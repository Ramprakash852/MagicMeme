'use client';
/**
 * ReactionBar — emoji reactions with count display and optimistic updates.
 * Bouncy press animation, count pop-in, active state glow.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ReactionCount } from '@/types';
import { cn } from '@/lib/utils';

const REACTION_EMOJIS = ['😂', '🔥', '💀', '👏', '🤣', '😭'];

interface Props {
  reactions: ReactionCount[];
  loading?: boolean;
  onReact: (emoji: string) => void;
}

export function ReactionBar({ reactions, loading, onReact }: Props) {
  const [justReacted, setJustReacted] = useState<string | null>(null);

  const getCount = (emoji: string) =>
    reactions.find((r) => r.emoji === emoji)?.count ?? 0;

  const handleReact = (emoji: string) => {
    setJustReacted(emoji);
    onReact(emoji);
    setTimeout(() => setJustReacted(null), 600);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-white/30 text-xs font-medium uppercase tracking-widest">
        Reactions
      </p>

      <div className="flex items-center gap-2 flex-wrap justify-center">
        {REACTION_EMOJIS.map((emoji) => {
          const count = getCount(emoji);
          const isActive = justReacted === emoji;

          return (
            <motion.button
              key={emoji}
              onClick={() => handleReact(emoji)}
              whileHover={{ scale: 1.12, y: -2 }}
              whileTap={{ scale: 0.85 }}
              animate={
                isActive
                  ? { scale: [1, 1.35, 1], y: [0, -8, 0] }
                  : { scale: 1, y: 0 }
              }
              transition={
                isActive
                  ? { duration: 0.4, ease: 'easeOut' }
                  : { type: 'spring', stiffness: 400 }
              }
              className={cn(
                'relative flex items-center gap-1.5 px-3 py-2 rounded-2xl border transition-all duration-200 select-none',
                count > 0
                  ? 'bg-[#1E1E1E] border-[#333] hover:border-[#555]'
                  : 'bg-[#181818] border-[#222] hover:border-[#333]',
                isActive && 'border-[#C8F135]/40 bg-[#C8F135]/5',
              )}
            >
              {/* Emoji */}
              <span className="text-lg leading-none">{emoji}</span>

              {/* Count */}
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.span
                    key="skeleton"
                    className="w-4 h-3 rounded bg-[#2A2A2A] animate-pulse"
                  />
                ) : count > 0 ? (
                  <motion.span
                    key={count}
                    initial={{ opacity: 0, y: -4, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.8 }}
                    transition={{ duration: 0.18 }}
                    className="text-xs font-bold text-white/70 tabular-nums min-w-[1ch]"
                  >
                    {formatCount(count)}
                  </motion.span>
                ) : null}
              </AnimatePresence>

              {/* Burst ring on reaction */}
              <AnimatePresence>
                {isActive && (
                  <motion.span
                    initial={{ scale: 0.5, opacity: 0.8 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 rounded-2xl border border-[#C8F135]/60 pointer-events-none"
                  />
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Total count */}
      <AnimatePresence>
        {!loading && reactions.length > 0 && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-white/20 text-xs"
          >
            {reactions.reduce((s, r) => s + r.count, 0).toLocaleString()}{' '}
            total reactions
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
