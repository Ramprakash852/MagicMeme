"use client";
/**
 * ReactionButton — social-media-grade emoji reaction button.
 *
 * States:
 *   Default    → dark pill, count muted
 *   Hover      → lifts 3px, emoji jiggles, border brightens, count brightens
 *   Active     → firm press scale (0.9)
 *   Optimistic → lime glow ring pulses outward; count shifts to lime
 *   Hot (>10)  → subtle color tint matching emoji metadata
 *   Loading    → skeleton shimmer placeholder
 *   Disabled   → 40% opacity, no interaction
 *
 * Mobile: touch-action manipulation for instant tap; no hover jitter.
 */
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { ReactionCounter } from "./ReactionCounter";
import { REACTION_META } from "@/types";
import type { ReactionEmoji } from "@/types";

interface ReactionButtonProps {
  emoji: ReactionEmoji;
  count: number;
  isOptimistic?: boolean;
  isLoading?: boolean;
  onTap: (emoji: ReactionEmoji) => void;
  disabled?: boolean;
}

export function ReactionButton({
  emoji,
  count,
  isOptimistic,
  isLoading,
  onTap,
  disabled,
}: ReactionButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const meta = REACTION_META[emoji as ReactionEmoji];
  const isHot = count >= 10;

  const handleClick = () => {
    if (disabled || isLoading) return;
    onTap(emoji);
  };

  // Prevent double-fire on mobile (touchend + click)
  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (disabled || isLoading) return;
    onTap(emoji);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#1A1A1A] border border-[#222]">
        <span className="text-lg opacity-30">{emoji}</span>
        <span className="w-5 h-3 rounded bg-[#2A2A2A] animate-pulse" />
      </div>
    );
  }

  return (
    <motion.button
      ref={buttonRef}
      onClick={handleClick}
      onTouchEnd={handleTouchEnd}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -3, scale: 1.06 }}
      whileTap={{ scale: 0.88, y: 0 }}
      disabled={disabled}
      aria-label={`React with ${emoji} (${count} reactions)`}
      className="relative flex items-center gap-1.5 px-3 py-2 rounded-2xl border transition-colors duration-150 select-none outline-none focus-visible:ring-2 focus-visible:ring-[#C8F135]/60 disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        background: isOptimistic
          ? `${meta?.glow ?? "rgba(200,241,53,0.08)"}`
          : isHot
            ? `${meta?.glow ?? "rgba(255,255,255,0.03)"}`
            : "#1A1A1A",
        borderColor: isOptimistic
          ? `${meta?.color ?? "#C8F135"}55`
          : isHovered
            ? "#444"
            : "#2A2A2A",
        touchAction: "manipulation",
      }}
    >
      {/* Emoji with jiggle-on-hover */}
      <motion.span
        animate={
          isHovered
            ? { scale: 1.25, rotate: [0, -10, 10, -6, 6, 0] }
            : isOptimistic
              ? { scale: [1, 1.15, 1], rotate: [0, -8, 8, 0] }
              : { scale: 1, rotate: 0 }
        }
        transition={{
          duration: isHovered ? 0.5 : 0.4,
          ease: "easeInOut",
        }}
        className="text-base leading-none"
        style={{ display: "inline-block" }}
      >
        {emoji}
      </motion.span>

      {/* Count */}
      <ReactionCounter count={count} isOptimistic={isOptimistic} />

      {/* Optimistic ring pulse */}
      <AnimatePresence>
        {isOptimistic && (
          <motion.span
            key="ring"
            initial={{ scale: 0.85, opacity: 0.8 }}
            animate={{ scale: 1.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              border: `1.5px solid ${meta?.color ?? "#C8F135"}`,
            }}
          />
        )}
      </AnimatePresence>

      {/* "Hot" badge for popular reactions */}
      <AnimatePresence>
        {isHot && count > 0 && (
          <motion.span
            key="hot"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-1.5 -right-1 text-[9px] leading-none px-1 py-0.5 rounded-full font-bold"
            style={{
              background: meta?.color ?? "#C8F135",
              color: "#000",
            }}
          >
            HOT
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
