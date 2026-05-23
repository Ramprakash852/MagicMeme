/**
 * GET /api/memes/[id]/image
 * Serves the saved meme image from Supabase Storage
 */
import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Download image from Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from("memes")
      .download(`${id}.png`);

    if (error || !data) {
      console.error("[api/meme-image] Not found:", error);
      return NextResponse.json(
        { error: "Meme image not found" },
        { status: 404 },
      );
    }

    // Return as image with proper headers
    return new NextResponse(data, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("[api/meme-image] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch image" },
      { status: 500 },
    );
  }
}
