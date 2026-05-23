/**
 * /api/memes/[id]/react
 *
 * GET  — fetch all reaction counts for a meme
 * POST — increment a reaction (atomic via RPC, fallback via raw upsert)
 *
 * The Supabase realtime channel for `reactions` will broadcast the DB change
 * back to all subscribed clients automatically — no WebSocket complexity here.
 *
 * RPC expected:
 *   add_reaction(p_meme_id text, p_emoji text) — upserts + increments count
 *   (see sql/phase-6-reactions-setup.sql)
 *
 * Fallback: if RPC doesn't exist, manual read-increment-write is used.
 * Both paths trigger the realtime broadcast since they mutate the DB.
 */
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const ALLOWED_EMOJIS = new Set(["😂", "🔥", "💀", "👏", "🤣", "😭"]);

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const emoji = body?.emoji;

    if (!id || !emoji || !ALLOWED_EMOJIS.has(emoji)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // ── Try RPC first (atomic, single round-trip) ────────────────────────
    const { error: rpcError } = await supabaseAdmin.rpc("add_reaction", {
      p_meme_id: id,
      p_emoji: emoji,
    });

    if (rpcError) {
      // ── Fallback: manual read → increment → upsert ──────────────────
      const { data: existing } = await supabaseAdmin
        .from("reactions")
        .select("count")
        .eq("meme_id", id)
        .eq("emoji", emoji)
        .maybeSingle();

      const newCount = (existing?.count ?? 0) + 1;

      const { error: upsertError } = await supabaseAdmin
        .from("reactions")
        .upsert(
          {
            meme_id: id,
            emoji,
            count: newCount,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "meme_id,emoji" },
        );

      if (upsertError) {
        console.error("[react] POST upsert error:", upsertError);
        return NextResponse.json(
          { error: "Failed to save reaction" },
          { status: 500 },
        );
      }
    }

    // ── Return updated counts (realtime will also push to subscribers) ──
    const { data: reactions } = await supabaseAdmin
      .from("reactions")
      .select("emoji, count")
      .eq("meme_id", id);

    return NextResponse.json({ success: true, reactions: reactions ?? [] });
  } catch (err) {
    console.error("[react] POST exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from("reactions")
      .select("emoji, count")
      .eq("meme_id", id);

    if (error) {
      console.error("[react] GET error:", error);
      return NextResponse.json({ reactions: [] });
    }

    return NextResponse.json({ reactions: data ?? [] });
  } catch (err) {
    console.error("[react] GET exception:", err);
    return NextResponse.json({ reactions: [] });
  }
}
