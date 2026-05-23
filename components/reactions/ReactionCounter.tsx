"use client";
/**
 * ReactionCounter — animated slot-machine style count display.
 *
 * On count increase: new number slides UP from below (like a ticker).
 * On count decrease (rollback): new number slides DOWN from above.
 * Optimistic state: dims to 0.55 opacity with a subtle lime tint.
 */
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface ReactionCounterProps {
  count: number;
  isOptimistic?: boolean;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function ReactionCounter({ count, isOptimistic }: ReactionCounterProps) {
  const prevCount = useRef(count);
  const [direction, setDirection] = useState<1 | -1>(1); // 1 = up, -1 = down

  useEffect(() => {
    setDirection(count >= prevCount.current ? 1 : -1);
    prevCount.current = count;
  }, [count]);

  const variants = {
    enter: (dir: number) => ({
      y: dir > 0 ? 8 : -8,
      opacity: 0,
      scale: 0.85,
    }),
    center: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 500, damping: 28 },
    },
    exit: (dir: number) => ({
      y: dir > 0 ? -8 : 8,
      opacity: 0,
      scale: 0.85,
      transition: { duration: 0.12 },
    }),
  };

  return (
    <span
      className="relative inline-flex items-center justify-center min-w-[2ch] overflow-hidden"
      style={{ height: "1.2em" }}
    >
      <AnimatePresence mode="popLayout" custom={direction}>
        <motion.span
          key={count}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 flex items-center justify-center font-bold text-xs tabular-nums leading-none"
          style={{
            color: isOptimistic ? "#C8F135" : "rgba(255,255,255,0.75)",
            opacity: isOptimistic ? 0.8 : 1,
          }}
        >
          {formatCount(count)}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
