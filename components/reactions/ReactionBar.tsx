"use client";
/**
 * ReactionBar — social-media-grade realtime reaction strip.
 *
 * Features:
 *  - 6 emoji buttons, staggered spring entrance
 *  - Burst particle animation from exact button center on tap
 *  - Remote reaction "pop" pulse when another user reacts (via onRemoteReaction)
 *  - Total reaction count with live animation
 *  - Realtime "live" indicator dot that pulses when subscribed
 *  - Responsive: wraps nicely on mobile, inline on desktop
 *  - Skeleton loading state while initial fetch completes
 */
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { ReactionButton } from "./ReactionButton";
import { ReactionBurst } from "./ReactionBurst";
import { ReactionCounter } from "./ReactionCounter";
import { REACTION_EMOJIS } from "@/types";
import type { ReactionCount, ReactionEmoji } from "@/types";

interface ReactionBarProps {
  reactions: ReactionCount[];
  onReact: (emoji: ReactionEmoji) => void;
  isLoading?: boolean;
  lastLocalReaction?: string | null;
  totalReactions?: number;
  /** Emoji that just arrived from a remote user (triggers remote pop). */
  remoteReaction?: string | null;
}

const STAGGER_DELAY = 0.04; // seconds between each button entrance

export function ReactionBar({
  reactions,
  onReact,
  isLoading,
  lastLocalReaction,
  totalReactions = 0,
  remoteReaction,
}: ReactionBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Burst position state: {emoji, x, y, trigger}
  const [burst, setBurst] = useState<{
    emoji: string;
    x: number;
    y: number;
    trigger: number;
  } | null>(null);

  const reactionMap = new Map(reactions.map((r) => [r.emoji, r.count]));

  const handleReact = useCallback(
    (emoji: ReactionEmoji) => {
      // Calculate burst from button center
      const buttonEl = buttonRefs.current.get(emoji);
      if (buttonEl) {
        const rect = buttonEl.getBoundingClientRect();
        setBurst({
          emoji,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          trigger: Date.now(),
        });
      }
      onReact(emoji);
    },
    [onReact],
  );

  return (
    <div className="flex flex-col gap-3">
      {/* ── Header row ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {/* Live indicator */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C8F135] opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C8F135]" />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-white/30">
            Live reactions
          </span>
        </div>

        {/* Total count */}
        <AnimatePresence>
          {totalReactions > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1 text-[11px] text-white/25"
            >
              <ReactionCounter count={totalReactions} />
              <span>total</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Buttons ──────────────────────────────────────────────────────── */}
      <motion.div
        ref={containerRef}
        className="flex flex-wrap gap-2 items-center"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: STAGGER_DELAY } },
        }}
      >
        {REACTION_EMOJIS.map((emoji, i) => {
          const count = reactionMap.get(emoji) ?? 0;
          const isOptimistic = lastLocalReaction === emoji;
          const isRemotePop = remoteReaction === emoji;

          return (
            <motion.div
              key={emoji}
              variants={{
                hidden: { scale: 0, opacity: 0, y: 8 },
                show: {
                  scale: 1,
                  opacity: 1,
                  y: 0,
                  transition: {
                    type: "spring",
                    stiffness: 260,
                    damping: 18,
                    delay: i * STAGGER_DELAY,
                  },
                },
              }}
              // Remote pop: subtle lift when another user reacts
              animate={
                isRemotePop
                  ? {
                      y: [-4, 0],
                      scale: [1.1, 1],
                      transition: { duration: 0.3, ease: "easeOut" },
                    }
                  : {}
              }
              ref={(el) => {
                if (el) buttonRefs.current.set(emoji, el);
                else buttonRefs.current.delete(emoji);
              }}
            >
              <ReactionButton
                emoji={emoji}
                count={count}
                isOptimistic={isOptimistic}
                isLoading={isLoading}
                onTap={handleReact}
                disabled={isLoading}
              />
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── Burst overlay (portal-less, fixed position) ───────────────── */}
      {burst && (
        <ReactionBurst
          emoji={burst.emoji}
          x={burst.x}
          y={burst.y}
          trigger={burst.trigger}
        />
      )}
    </div>
  );
}
