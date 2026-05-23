"use client";
/**
 * TemplateDrawer — slide-in panel for switching meme templates
 * Shows live canvas previews of each template with the current image
 */
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TEMPLATES } from "@/lib/templates";
import type { MemeSuggestion } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  activeTemplateId: string;
  imageData: string;
  suggestion: MemeSuggestion | null;
  onSelect: (templateId: string) => void;
  onClose: () => void;
}

export function TemplateDrawer({
  open,
  activeTemplateId,
  imageData,
  suggestion,
  onSelect,
  onClose,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/65 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 bottom-0 z-50 flex w-full max-w-sm flex-col border-l border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,10,0.96)] shadow-[0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] px-5 py-4">
              <div>
                <h3 className="text-sm font-bold text-white">Templates</h3>
                <p className="mt-0.5 text-xs text-white/30">Choose a layout</p>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-sm text-white/50 transition-colors hover:bg-[rgba(255,255,255,0.06)] hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Template grid */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {TEMPLATES.map((template, i) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                >
                  <TemplatePreviewCard
                    template={template}
                    imageData={imageData}
                    suggestion={suggestion}
                    isActive={template.id === activeTemplateId}
                    onSelect={() => onSelect(template.id)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Template preview card ────────────────────────────────────────────────────
function TemplatePreviewCard({
  template,
  imageData,
  suggestion,
  isActive,
  onSelect,
}: {
  template: (typeof TEMPLATES)[0];
  imageData: string;
  suggestion: MemeSuggestion | null;
  isActive: boolean;
  onSelect: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageData) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const W = canvas.width; // 240
      const H = canvas.height; // 160

      // Draw image cover
      const scale = Math.max(W / img.width, H / img.height);
      const sw = img.width * scale;
      const sh = img.height * scale;
      const sx = (W - sw) / 2;
      const sy = (H - sh) / 2;
      ctx.drawImage(img, sx, sy, sw, sh);

      // Draw text zones
      if (suggestion) {
        template.zones.forEach((zone) => {
          const text =
            zone.id === "top" || zone.id === "setup" || zone.id === "reject"
              ? suggestion.topText
              : zone.id === "bottom" ||
                  zone.id === "punchline" ||
                  zone.id === "approve"
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
          if (zone.position === "bottom") {
            startY = H - totalH - 8;
          }

          const x =
            zone.align === "center"
              ? W / 2
              : zone.align === "right"
                ? zone.x * W + maxW
                : zone.x * W;

          lines.forEach((line, idx) => {
            const y = startY + idx * lineH + fontSize;
            if (zone.stroke !== "transparent") ctx.strokeText(line, x, y);
            ctx.fillText(line, x, y);
          });
        });
      }

      setLoaded(true);
    };
    img.src = imageData;
  }, [imageData, suggestion, template]);

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onSelect}
      className={cn(
        "group relative w-full overflow-hidden rounded-[22px] border transition-all duration-200",
        isActive
          ? "border-[rgba(200,241,53,0.35)] ring-2 ring-[rgba(200,241,53,0.22)]"
          : "border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.14)]",
      )}
    >
      <canvas
        ref={canvasRef}
        width={240}
        height={160}
        className={cn(
          "w-full block transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Skeleton */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-[rgba(255,255,255,0.05)]" />
      )}

      {/* Label overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white">
            {template.name}
          </span>
          {isActive && (
            <span className="rounded-full bg-[#C8F135] px-1.5 py-0.5 text-[10px] font-bold text-black">
              Active
            </span>
          )}
        </div>
        <p className="mt-0.5 line-clamp-1 text-[10px] text-white/40">
          {template.description}
        </p>
      </div>

      {/* Hover glow */}
      {!isActive && (
        <div className="absolute inset-0 pointer-events-none opacity-0 transition-opacity group-hover:opacity-100 bg-[#C8F135]/5" />
      )}
    </motion.button>
  );
}
