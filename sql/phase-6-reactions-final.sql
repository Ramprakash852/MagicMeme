/**
 * Phase 6 (Final) — Realtime Reactions Setup SQL
 * =================================================
 * Run this entire script in: Supabase Dashboard → SQL Editor → New Query → RUN
 *
 * What this creates:
 *   1. `reactions` table  — one row per (meme_id, emoji), stores count
 *   2. `add_reaction` RPC — atomic upsert+increment (no race conditions)
 *   3. Realtime publication — broadcasts row changes to subscribed clients
 *   4. RLS policies        — anon can read; service role can write
 *
 * After running:
 *   • Go to Database → Publications → supabase_realtime
 *   • Toggle ON the `reactions` table
 *   • Test: create a meme and tap an emoji reaction
 */

-- ─── 1. Create reactions table ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reactions (
  id          BIGSERIAL PRIMARY KEY,
  meme_id     TEXT        NOT NULL,
  emoji       TEXT        NOT NULL CHECK (char_length(emoji) > 0),
  count       INTEGER     NOT NULL DEFAULT 1 CHECK (count >= 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One row per (meme, emoji) pair
  UNIQUE (meme_id, emoji),

  -- Cascade on meme delete
  CONSTRAINT fk_reactions_meme
    FOREIGN KEY (meme_id) REFERENCES public.memes(id) ON DELETE CASCADE
);

-- ─── 2. Performance index ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_reactions_meme_id ON public.reactions(meme_id);

-- ─── 3. Auto-update updated_at trigger ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reactions_updated_at ON public.reactions;
CREATE TRIGGER reactions_updated_at
  BEFORE UPDATE ON public.reactions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── 4. RPC: atomic increment (no race conditions) ───────────────────────────
--
-- Called from: POST /api/memes/[id]/react
-- Logic: if (meme_id, emoji) row exists → increment count
--        else                            → insert with count = 1
-- Realtime: the INSERT/UPDATE triggers the supabase_realtime broadcast
--
CREATE OR REPLACE FUNCTION public.add_reaction(
  p_meme_id TEXT,
  p_emoji   TEXT
)
RETURNS TABLE (success BOOLEAN, count INTEGER)
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.reactions (meme_id, emoji, count)
  VALUES (p_meme_id, p_emoji, 1)
  ON CONFLICT (meme_id, emoji)
  DO UPDATE
    SET count      = reactions.count + 1,
        updated_at = NOW()
  RETURNING TRUE, reactions.count INTO success, count;

  RETURN NEXT;
END;
$$;

-- Backward-compat alias (some older API routes call increment_reaction)
CREATE OR REPLACE FUNCTION public.increment_reaction(
  p_meme_id TEXT,
  p_emoji   TEXT
)
RETURNS TABLE (success BOOLEAN, count INTEGER)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY SELECT * FROM public.add_reaction(p_meme_id, p_emoji);
END;
$$;

-- ─── 5. Enable Supabase Realtime ─────────────────────────────────────────────
-- Safe: only adds if not already in publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'reactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reactions;
  END IF;
END;
$$;

-- ─── 6. Row Level Security ───────────────────────────────────────────────────
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- Anon can SELECT (read counts on public share page)
DROP POLICY IF EXISTS "anon_read_reactions" ON public.reactions;
CREATE POLICY "anon_read_reactions"
  ON public.reactions FOR SELECT
  TO anon
  USING (TRUE);

-- ─── 7. Grant permissions ────────────────────────────────────────────────────
GRANT SELECT ON public.reactions TO anon;
GRANT EXECUTE ON FUNCTION public.add_reaction(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_reaction(TEXT, TEXT) TO anon;

-- ─── 8. Optional: seed test data ────────────────────────────────────────────
-- Replace 'YOUR_MEME_ID' with a real meme ID from your memes table
/*
INSERT INTO public.reactions (meme_id, emoji, count)
VALUES
  ('YOUR_MEME_ID', '😂', 12),
  ('YOUR_MEME_ID', '🔥', 8),
  ('YOUR_MEME_ID', '💀', 5),
  ('YOUR_MEME_ID', '👏', 3)
ON CONFLICT (meme_id, emoji) DO UPDATE
  SET count = EXCLUDED.count;
*/

-- ─── Verification ─────────────────────────────────────────────────────────────
SELECT 'Phase 6 reactions setup complete ✅' AS status;
