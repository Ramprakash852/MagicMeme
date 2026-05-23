"use client";
/**
 * ReactionBurst — polished particle explosion for emoji reactions.
 *
 * Features:
 *  - 7-10 particles bursting radially from button center
 *  - Per-emoji color-tinted background glow flash
 *  - Natural physics: varied speed, rotation, size per particle
 *  - Two waves: main burst + 2-3 smaller echo particles (delayed)
 *  - Fixed positioning + pointer-events-none (zero layout impact)
 *  - Auto-cleanup after animation completes
 */
import { useEffect, useId, useRef, useState } from "react";
import { motion } from "framer-motion";
import { REACTION_META } from "@/types";
import type { ReactionEmoji } from "@/types";

interface ReactionBurstProps {
  /** The emoji character to burst. */
  emoji: string;
  /** Center X in viewport coordinates. */
  x: number;
  /** Center Y in viewport coordinates. */
  y: number;
  /** Increment this to re-trigger the animation. */
  trigger: string | number | null;
}

interface Particle {
  id: string;
  emoji: string;
  angle: number;
  distance: number;
  duration: number;
  size: number; // em
  delay: number;
  spin: number; // degrees to rotate
}

function makeParticles(emoji: string, burstId: string): Particle[] {
  const count = 7 + Math.floor(Math.random() * 4); // 7-10
  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    const baseAngle = (i / count) * 360;
    const jitter = (Math.random() - 0.5) * 28;
    particles.push({
      id: `${burstId}-${i}`,
      emoji,
      angle: baseAngle + jitter,
      distance: 55 + Math.random() * 55,
      duration: 0.45 + Math.random() * 0.25,
      size: 0.85 + Math.random() * 0.55,
      delay: Math.random() * 0.04, // slight stagger
      spin: (Math.random() - 0.5) * 180,
    });
  }

  // 2-3 smaller echo particles at shorter distance
  const echoCount = 2 + Math.floor(Math.random() * 2);
  for (let i = 0; i < echoCount; i++) {
    particles.push({
      id: `${burstId}-echo-${i}`,
      emoji,
      angle: Math.random() * 360,
      distance: 25 + Math.random() * 20,
      duration: 0.35,
      size: 0.6,
      delay: 0.06 + Math.random() * 0.08,
      spin: (Math.random() - 0.5) * 90,
    });
  }

  return particles;
}

export function ReactionBurst({ emoji, x, y, trigger }: ReactionBurstProps) {
  const uid = useId();
  const [bursts, setBursts] = useState<
    { id: string; particles: Particle[]; x: number; y: number }[]
  >([]);
  const prevTrigger = useRef<typeof trigger>(null);

  useEffect(() => {
    if (trigger === null || trigger === prevTrigger.current) return;
    prevTrigger.current = trigger;

    const burstId = `${uid}-${Date.now()}`;
    const particles = makeParticles(emoji, burstId);
    setBursts((prev) => [...prev, { id: burstId, particles, x, y }]);

    // Remove burst after animations complete
    const maxDuration =
      Math.max(...particles.map((p) => (p.delay + p.duration) * 1000)) + 100;
    const timer = setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== burstId));
    }, maxDuration);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  const meta = REACTION_META[emoji as ReactionEmoji];

  return (
    <>
      {bursts.map((burst) => (
        <div
          key={burst.id}
          className="pointer-events-none"
          style={{ position: "fixed", inset: 0, zIndex: 9999 }}
        >
          {/* Glow flash at burst origin */}
          <motion.div
            initial={{ scale: 0.2, opacity: 0.9 }}
            animate={{ scale: 2.8, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
              position: "absolute",
              left: burst.x - 24,
              top: burst.y - 24,
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: meta?.glow ?? "rgba(200,241,53,0.3)",
            }}
          />

          {/* Emoji particles */}
          {burst.particles.map((p) => {
            const rad = (p.angle * Math.PI) / 180;
            const endX = Math.cos(rad) * p.distance;
            const endY = Math.sin(rad) * p.distance;

            return (
              <motion.span
                key={p.id}
                initial={{
                  x: burst.x,
                  y: burst.y,
                  scale: 1.2,
                  opacity: 1,
                  rotate: 0,
                  fontSize: `${p.size}rem`,
                }}
                animate={{
                  x: burst.x + endX,
                  y: burst.y + endY,
                  scale: 0,
                  opacity: 0,
                  rotate: p.spin,
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  lineHeight: 1,
                  userSelect: "none",
                  willChange: "transform, opacity",
                }}
              >
                {p.emoji}
              </motion.span>
            );
          })}
        </div>
      ))}
    </>
  );
}
