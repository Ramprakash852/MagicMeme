/**
 * Phase 6 — Reactions Setup SQL
 * Run these commands in Supabase SQL Editor to set up the reactions system
 *
 * Steps:
 * 1. Paste this entire script into Supabase SQL Editor
 * 2. Click "RUN" at the bottom-right
 * 3. Verify tables created in Tables view
 * 4. Enable realtime for the reactions table (see instructions below)
 */

-- ─── Create reactions table ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reactions (
  id BIGSERIAL PRIMARY KEY,
  meme_id TEXT NOT NULL,
  emoji TEXT NOT NULL CHECK (LENGTH(emoji) > 0),
  count INTEGER NOT NULL DEFAULT 1 CHECK (count >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique per meme+emoji to prevent duplicates
  UNIQUE (meme_id, emoji),
  
  -- Foreign key to memes table (cascade delete if meme is deleted)
  CONSTRAINT fk_meme_id FOREIGN KEY (meme_id) REFERENCES public.memes(id) ON DELETE CASCADE
);

-- ─── Index for faster queries by meme_id ──────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_reactions_meme_id ON public.reactions(meme_id);

-- ─── RPC function: idempotent reaction increment ──────────────────────────
CREATE OR REPLACE FUNCTION public.add_reaction(
  p_meme_id TEXT,
  p_emoji TEXT
) RETURNS TABLE (success BOOLEAN, count INTEGER) AS $$
BEGIN
  -- Upsert: increment if exists, insert with count=1 if not
  INSERT INTO public.reactions (meme_id, emoji, count)
  VALUES (p_meme_id, p_emoji, 1)
  ON CONFLICT (meme_id, emoji)
  DO UPDATE SET
    count = reactions.count + 1,
    updated_at = NOW()
  RETURNING (TRUE, reactions.count) INTO success, count;
  
  RETURN NEXT;
END;
$$ LANGUAGE PLPGSQL;

-- ─── Enable realtime for reactions table ──────────────────────────────────
-- This allows frontend to subscribe to live updates via Supabase.realtime
BEGIN;
  -- Alter publication to include reactions table
  ALTER PUBLICATION supabase_realtime ADD TABLE public.reactions;
COMMIT;

-- ─── (Optional) Test data ─────────────────────────────────────────────────
-- Uncomment to add sample reactions for testing
/*
INSERT INTO public.reactions (meme_id, emoji, count) VALUES
  ('test-meme-1', '😂', 5),
  ('test-meme-1', '🔥', 3),
  ('test-meme-1', '💀', 2);
*/

-- ─── Grant permissions ────────────────────────────────────────────────────
-- Allow anonymous users to read and call the RPC
GRANT SELECT ON public.reactions TO anon;
GRANT EXECUTE ON FUNCTION public.add_reaction TO anon;
