/**
 * /m/[id] — Public meme share page
 * Server component: generates OG metadata from Supabase data.
 * Client component: handles reactions, copy-link, download.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { SavedMeme } from "@/types";
import { MemeViewClient } from "./MemeViewClient";

// ─── Fetch helper ─────────────────────────────────────────────────────────────
async function getMeme(id: string): Promise<SavedMeme | null> {
  const { data, error } = await supabaseAdmin
    .from("memes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as SavedMeme;
}

// ─── OG metadata ─────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const meme = await getMeme(id);

  if (!meme) {
    return { title: "Meme not found — MagicMeme" };
  }

  const caption =
    meme.top_text ||
    meme.main_caption ||
    meme.bottom_text ||
    "Check out this meme!";

  const title = `"${caption}" — MagicMeme`;
  const description = "AI-generated meme. Made with MagicMeme.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: meme.image_url,
          width: 1200,
          height: 900,
          alt: caption,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [meme.image_url],
    },
  };
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default async function MemePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const meme = await getMeme(id);

  if (!meme) notFound();

  return <MemeViewClient meme={meme} />;
}
