// ─── Legacy (kept for compat) ──────────────────────────────────────────────
export interface TextZone {
  id: string;
  label: string;
  position: { x: number; y: number; width: number; height: number };
  fontSize: number;
  align: "left" | "center" | "right";
  color: string;
  strokeColor: string;
}

// ─── AI suggestions ────────────────────────────────────────────────────────
export interface MemeSuggestion {
  templateId: string;
  topText: string;
  bottomText: string;
  mainCaption: string;
  vibe: string; // 'chaotic' | 'deadpan' | 'wholesome' | etc
  label: string; // short tag for display
}

// ─── Saved meme — mirrors the `memes` Supabase table ──────────────────────
export interface SavedMeme {
  id: string; // nanoid, used as public URL slug
  created_at: string;
  image_url: string; // Supabase Storage public URL
  template_id: string;
  top_text: string | null;
  bottom_text: string | null;
  main_caption: string | null;
  vibe: string | null;
}

// ─── Reactions ─────────────────────────────────────────────────────────────
export interface ReactionCount {
  emoji: string;
  count: number;
}

// ─── Realtime reaction DB row (mirrors `reactions` table) ───────────────────
export interface ReactionRow {
  meme_id: string;
  emoji: string;
  count: number;
  updated_at?: string;
}

export const REACTION_EMOJIS = ["😂", "🔥", "💀", "👏", "🤣", "😭"] as const;
export type ReactionEmoji = (typeof REACTION_EMOJIS)[number];

/** Per-emoji display metadata for the UI */
export const REACTION_META: Record<
  ReactionEmoji,
  { label: string; color: string; glow: string }
> = {
  "😂": { label: "Dead", color: "#FFD700", glow: "rgba(255,215,0,0.25)" },
  "🔥": { label: "Fire", color: "#FF6B35", glow: "rgba(255,107,53,0.25)" },
  "💀": { label: "Rip", color: "#A78BFA", glow: "rgba(167,139,250,0.25)" },
  "👏": { label: "Clap", color: "#34D399", glow: "rgba(52,211,153,0.25)" },
  "🤣": { label: "LMAO", color: "#F59E0B", glow: "rgba(245,158,11,0.25)" },
  "😭": { label: "Crying", color: "#60A5FA", glow: "rgba(96,165,250,0.25)" },
};
