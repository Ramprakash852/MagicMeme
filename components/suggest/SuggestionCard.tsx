"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { MemeSuggestion } from "@/types";
import { getTemplate } from "@/lib/templates";

interface Props {
  suggestion: MemeSuggestion;
  imageData: string;
  index: number;
  onSelect: (s: MemeSuggestion) => void;
}

// Vibe badge colors
const VIBE_STYLES: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  chaotic: {
    bg: "rgba(255,107,53,0.1)",
    text: "#FF6B35",
    border: "rgba(255,107,53,0.25)",
  },
  deadpan: {
    bg: "rgba(96,165,250,0.1)",
    text: "#60A5FA",
    border: "rgba(96,165,250,0.25)",
  },
  wholesome: {
    bg: "rgba(52,211,153,0.1)",
    text: "#34D399",
    border: "rgba(52,211,153,0.25)",
  },
  relatable: {
    bg: "rgba(200,241,53,0.08)",
    text: "#C8F135",
    border: "rgba(200,241,53,0.2)",
  },
  absurd: {
    bg: "rgba(167,139,250,0.1)",
    text: "#A78BFA",
    border: "rgba(167,139,250,0.25)",
  },
  savage: {
    bg: "rgba(248,113,113,0.1)",
    text: "#F87171",
    border: "rgba(248,113,113,0.25)",
  },
};

const DEFAULT_VIBE_STYLE = {
  bg: "rgba(255,255,255,0.06)",
  text: "rgba(255,255,255,0.5)",
  border: "rgba(255,255,255,0.12)",
};

export function SuggestionCard({
  suggestion,
  imageData,
  index,
  onSelect,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendered, setRendered] = useState(false);
  const template = getTemplate(suggestion.templateId);
  const vibeStyle =
    VIBE_STYLES[suggestion.vibe?.toLowerCase() ?? ""] ?? DEFAULT_VIBE_STYLE;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const W = canvas.width;
      const H = canvas.height;

      // Cover crop
      const scale = Math.max(W / img.width, H / img.height);
      const sw = img.width * scale;
      const sh = img.height * scale;
      const sx = (W - sw) / 2;
      const sy = (H - sh) / 2;
      ctx.drawImage(img, sx, sy, sw, sh);

      // Draw text zones
      template.zones.forEach((zone) => {
        const text =
          zone.id === "top"
            ? suggestion.topText
            : zone.id === "bottom"
              ? suggestion.bottomText
              : suggestion.mainCaption || suggestion.topText;

        if (!text) return;

        const fontSize = Math.round((zone.fontSize / 500) * W);
        ctx.font = `900 ${fontSize}px Impact, Arial Black, sans-serif`;
        ctx.textAlign = zone.align;
        ctx.lineWidth = fontSize * 0.12;
        ctx.strokeStyle =
          zone.stroke !== "transparent" ? zone.stroke : "transparent";
        ctx.fillStyle = zone.color;

        const maxW = zone.width * W;
        const words = text.split(" ");
        const lines: string[] = [];
        let current = "";
        for (const word of words) {
          const test = current ? `${current} ${word}` : word;
          if (ctx.measureText(test).width > maxW && current) {
            lines.push(current);
            current = word;
          } else current = test;
        }
        if (current) lines.push(current);

        const lineH = fontSize * 1.2;
        const totalH = lines.length * lineH;
        let startY = zone.y * H;
        if (zone.position === "bottom")
          startY = H - totalH - (zone.y < 0.5 ? (1 - zone.y) * H * 0.1 : 12);

        const x =
          zone.align === "center"
            ? W / 2
            : zone.align === "right"
              ? zone.x * W + maxW
              : zone.x * W;

        lines.forEach((line, i) => {
          const y = startY + i * lineH + fontSize;
          if (zone.stroke !== "transparent") ctx.strokeText(line, x, y);
          ctx.fillText(line, x, y);
        });
      });

      setRendered(true);
    };
    img.src = imageData;
  }, [imageData, suggestion, template]);

  return (
    <motion.button
      initial={{ opacity: 0, y: 14, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.055,
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{
        scale: 1.04,
        y: -3,
        transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
      }}
      whileTap={{ scale: 0.97, y: 0, transition: { duration: 0.1 } }}
      onClick={() => onSelect(suggestion)}
      className="group relative overflow-hidden rounded-[24px] text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8F135]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow:
          "0 18px 48px rgba(0,0,0,0.42), 0 2px 0 rgba(255,255,255,0.02) inset",
        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      aria-label={`Select meme: ${suggestion.label}`}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "rgba(200,241,53,0.34)";
        el.style.boxShadow =
          "0 0 0 1px rgba(200,241,53,0.14), 0 24px 56px rgba(0,0,0,0.5), 0 0 36px rgba(200,241,53,0.08)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "rgba(255,255,255,0.08)";
        el.style.boxShadow =
          "0 18px 48px rgba(0,0,0,0.42), 0 2px 0 rgba(255,255,255,0.02) inset";
      }}
    >
      {/* Canvas preview with skeleton */}
      <div
        className="relative aspect-[4/3] overflow-hidden"
        style={{ background: "rgba(255,255,255,0.02)" }}
      >
        {/* Skeleton shimmer while canvas renders */}
        {!rendered && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#1c1c1c] via-[#262626] to-[#1c1c1c]">
            <motion.div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(200,241,53,0.08), transparent)",
              }}
              animate={{ x: ["-100%", "100%"] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        )}
        <canvas
          ref={canvasRef}
          width={400}
          height={300}
          className="w-full h-full block"
          style={{ opacity: rendered ? 1 : 0, transition: "opacity 0.3s" }}
        />

        {/* Hover CTA overlay */}
        <motion.div
          className="absolute inset-0 flex items-end justify-center pb-4 md:pb-6 pointer-events-none"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.24) 70%, transparent 100%)",
          }}
        >
          <motion.div
            className="px-3.5 md:px-4 py-1.5 md:py-2 rounded-full text-[11px] md:text-xs font-black tracking-[0.18em] whitespace-nowrap uppercase"
            initial={{ scale: 0.9, opacity: 0 }}
            whileHover={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            style={{
              background: "var(--lime)",
              color: "#000",
              boxShadow: "0 8px 16px rgba(200,241,53,0.3)",
            }}
          >
            Edit this →
          </motion.div>
        </motion.div>
      </div>

      {/* Card footer */}
      <div className="flex items-start justify-between gap-3 border-t border-[rgba(255,255,255,0.06)] px-4 py-3 md:px-5 md:py-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-snug text-[var(--text-primary)] md:text-[15px]">
            {suggestion.label}
          </p>
          <p className="mt-0.5 truncate text-[10px] md:text-xs text-[var(--text-secondary)]">
            {template.name}
          </p>
        </div>

        {/* Vibe badge */}
        {suggestion.vibe && (
          <motion.span
            className="shrink-0 text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-2 md:px-2.5 py-1 rounded-lg md:rounded-xl"
            style={{
              background: vibeStyle.bg,
              color: vibeStyle.text,
              border: `1px solid ${vibeStyle.border}`,
              boxShadow: `0 2px 8px ${vibeStyle.bg}`,
            }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2 },
            }}
          >
            {suggestion.vibe}
          </motion.span>
        )}
      </div>
    </motion.button>
  );
}
