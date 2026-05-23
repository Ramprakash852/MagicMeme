"use client";
/**
 * useRealtimeReactions — Phase 6 (Final)
 *
 * Manages reaction state with:
 *   1. Initial fetch from GET /api/memes/[id]/react
 *   2. Optimistic +1 on tap (instant UI, no await)
 *   3. Fire-and-forget POST with automatic rollback on error
 *   4. Supabase Realtime postgres_changes for live cross-client sync
 *   5. Echo-suppression: ignores our own DB echoes (no double-burst)
 *   6. Haptic feedback on mobile (navigator.vibrate)
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { ReactionCount, ReactionRow } from "@/types";
import { REACTION_EMOJIS } from "@/types";

interface UseRealtimeReactionsOptions {
  /** The meme ID to subscribe to. Pass empty string to disable. */
  memeId: string;
  /** Fires when a *remote* client reacts — use to trigger remote burst FX. */
  onRemoteReaction?: (emoji: string) => void;
}

export interface UseRealtimeReactionsReturn {
  /** All reactions in REACTION_EMOJIS order (stable, no jump). */
  reactions: ReactionCount[];
  /** True only during the very first fetch. */
  loading: boolean;
  /** Fire a reaction — optimistic, fire-and-forget. */
  react: (emoji: string) => void;
  /** The emoji the *local* user just tapped (auto-clears after 800ms). */
  lastLocalReaction: string | null;
  /** Sum of all reaction counts. */
  totalReactions: number;
}

export function useRealtimeReactions({
  memeId,
  onRemoteReaction,
}: UseRealtimeReactionsOptions): UseRealtimeReactionsReturn {
  const [reactionMap, setReactionMap] = useState<Map<string, number>>(
    new Map(),
  );
  const [loading, setLoading] = useState(true);
  const [lastLocalReaction, setLastLocalReaction] = useState<string | null>(
    null,
  );

  // Echo-suppression: emojis we've tapped that haven't been confirmed by RT yet
  const pendingOptimistic = useRef<Set<string>>(new Set());
  // Stable ref so we don't recreate the RT channel when callback identity changes
  const onRemoteRef = useRef(onRemoteReaction);
  useEffect(() => {
    onRemoteRef.current = onRemoteReaction;
  }, [onRemoteReaction]);

  // ── 1. Initial fetch ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!memeId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);

    async function load() {
      try {
        const res = await fetch(`/api/memes/${memeId}/react`);
        if (!res.ok || cancelled) return;
        const { reactions } = (await res.json()) as {
          reactions: ReactionCount[];
        };
        const map = new Map<string, number>();
        reactions?.forEach((r) => map.set(r.emoji, r.count));
        setReactionMap(map);
      } catch {
        // Non-critical — reactions will show as 0
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [memeId]);

  // ── 2. Supabase Realtime subscription ────────────────────────────────────
  useEffect(() => {
    if (!memeId) return;

    const channel = supabase
      .channel(`meme-reactions:${memeId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reactions",
          filter: `meme_id=eq.${memeId}`,
        },
        (payload) => {
          const row = payload.new as ReactionRow;
          if (!row?.emoji) return;

          // Always overwrite with server truth (handles concurrent users)
          setReactionMap((prev) => {
            const next = new Map(prev);
            next.set(row.emoji, row.count);
            return next;
          });

          // Own echo → suppress; remote reaction → fire callback
          if (pendingOptimistic.current.has(row.emoji)) {
            pendingOptimistic.current.delete(row.emoji);
          } else {
            onRemoteRef.current?.(row.emoji);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [memeId]); // stable ref handles callback changes

  // ── 3. React — optimistic + fire-and-forget POST ──────────────────────────
  const react = useCallback(
    (emoji: string) => {
      if (!memeId) return;
      if (!REACTION_EMOJIS.includes(emoji as (typeof REACTION_EMOJIS)[number]))
        return;

      // Optimistic +1
      pendingOptimistic.current.add(emoji);
      setReactionMap((prev) => {
        const next = new Map(prev);
        next.set(emoji, (prev.get(emoji) ?? 0) + 1);
        return next;
      });

      // Trigger local burst animation
      setLastLocalReaction(emoji);
      setTimeout(() => setLastLocalReaction(null), 800);

      // Haptic feedback on mobile
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(20);
      }

      // Fire-and-forget — realtime will confirm via postgres_changes
      fetch(`/api/memes/${memeId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      }).catch(() => {
        // Network error: rollback
        pendingOptimistic.current.delete(emoji);
        setReactionMap((prev) => {
          const next = new Map(prev);
          const current = next.get(emoji) ?? 1;
          if (current <= 1) next.delete(emoji);
          else next.set(emoji, current - 1);
          return next;
        });
      });
    },
    [memeId],
  );

  // ── 4. Derive stable sorted array ────────────────────────────────────────
  // Keep in REACTION_EMOJIS order so button positions don't jump
  const reactions: ReactionCount[] = REACTION_EMOJIS.map((emoji) => ({
    emoji,
    count: reactionMap.get(emoji) ?? 0,
  }));

  const totalReactions = reactions.reduce((sum, r) => sum + r.count, 0);

  return { reactions, loading, react, lastLocalReaction, totalReactions };
}
