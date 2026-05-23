/**
 * POST /api/memes
 * Saves a meme PNG to Supabase Storage and records metadata in the DB.
 * Returns { id, shareUrl }
 *
 * DB schema (run once in Supabase SQL editor):
 * ─────────────────────────────────────────────
 * create table if not exists memes (
 *   id          text primary key,          -- nanoid slug
 *   created_at  timestamptz default now(),
 *   image_url   text not null,             -- Supabase Storage public URL
 *   template_id text not null default '',
 *   top_text    text,
 *   bottom_text text,
 *   main_caption text,
 *   vibe        text
 * );
 *
 * -- Public read, no-auth write (RLS off for demo):
 * alter table memes enable row level security;
 * create policy "public read" on memes for select using (true);
 * create policy "public insert" on memes for insert with check (true);
 *
 * -- Storage bucket (run once):
 * insert into storage.buckets (id, name, public)
 *   values ('memes', 'memes', true)
 *   on conflict do nothing;
 * create policy "public read memes" on storage.objects for select
 *   using (bucket_id = 'memes');
 * create policy "public insert memes" on storage.objects for insert
 *   with check (bucket_id = 'memes');
 * ─────────────────────────────────────────────
 */
import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      imageDataUrl, // full base64 data URL of exported PNG
      templateId = "",
      topText = "",
      bottomText = "",
      mainCaption = "",
      vibe = "",
    } = body;

    if (!imageDataUrl) {
      return NextResponse.json(
        { error: "imageDataUrl is required" },
        { status: 400 },
      );
    }

    // ── 1. Decode base64 PNG ──────────────────────────────────────────────────
    const base64 = imageDataUrl.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64, "base64");

    // ── 2. Generate a short unique ID ─────────────────────────────────────────
    const id = nanoid(10);
    const fileName = `${id}.png`;

    // ── 3. Upload to Supabase Storage ─────────────────────────────────────────
    const { error: uploadError } = await supabaseAdmin.storage
      .from("memes")
      .upload(fileName, imageBuffer, {
        contentType: "image/png",
        upsert: false,
        cacheControl: "31536000", // 1 year
      });

    if (uploadError) {
      console.error("[memes/save] storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Storage upload failed", details: uploadError.message },
        { status: 500 },
      );
    }

    // ── 4. Get public URL ─────────────────────────────────────────────────────
    const { data: urlData } = supabaseAdmin.storage
      .from("memes")
      .getPublicUrl(fileName);

    const imageUrl = urlData.publicUrl;

    // ── 5. Insert into DB ─────────────────────────────────────────────────────
    //
    // Strategy: try a full insert first. If Supabase returns PGRST204
    // ("Could not find column X in schema cache") the table was created
    // without the optional text columns. In that case we fall back to a
    // minimal insert so the meme is always saved and shareable.
    //
    // FIX: run these in your Supabase SQL editor, then reload schema cache:
    //   alter table memes add column if not exists template_id  text;
    //   alter table memes add column if not exists top_text     text;
    //   alter table memes add column if not exists bottom_text  text;
    //   alter table memes add column if not exists main_caption text;
    //   alter table memes add column if not exists vibe         text;
    //   notify pgrst, 'reload schema';
    //
    const fullRow = {
      id,
      image_url: imageUrl,
      template_id: templateId || null,
      top_text: topText || null,
      bottom_text: bottomText || null,
      main_caption: mainCaption || null,
      vibe: vibe || null,
    };

    let { error: dbError } = await supabaseAdmin.from("memes").insert(fullRow);

    if (dbError?.code === "PGRST204") {
      // Schema cache doesn't know about the optional columns yet.
      // Log a clear migration hint and retry with only the core columns.
      console.warn(
        "[memes/save] PGRST204 — schema is missing optional columns.\n" +
          "Run the ALTER TABLE + notify pgrst lines shown above in the Supabase SQL editor.\n" +
          "Falling back to minimal insert (id + image_url only).\n" +
          "Error was:",
        dbError.message,
      );
      const fallback = await supabaseAdmin
        .from("memes")
        .insert({ id, image_url: imageUrl });
      dbError = fallback.error;
    }

    if (dbError) {
      console.error("[memes/save] db insert failed:", dbError);
      // Clean up the orphaned storage object so we don't leave junk behind
      await supabaseAdmin.storage.from("memes").remove([fileName]);
      return NextResponse.json(
        { error: "Database insert failed", details: dbError.message },
        { status: 500 },
      );
    }

    // ── 6. Return share URL ───────────────────────────────────────────────────
    // Priority: explicit env var > Origin header > x-forwarded-host > localhost
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
    const fwdHost = req.headers.get("x-forwarded-host");
    const fwdProto = req.headers.get("x-forwarded-proto") ?? "https";
    const origin =
      appUrl ??
      req.headers.get("origin") ??
      (fwdHost ? `${fwdProto}://${fwdHost}` : null) ??
      "http://localhost:3000";

    return NextResponse.json({
      id,
      imageUrl,
      shareUrl: `${origin}/m/${id}`,
    });
  } catch (err) {
    console.error("[memes/save] unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: String(err) },
      { status: 500 },
    );
  }
}
