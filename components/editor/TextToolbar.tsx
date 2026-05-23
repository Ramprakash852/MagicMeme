"use client";
/**
 * TextToolbar — font family, size, weight, color, alignment, stroke, shadow
 * Works in both vertical (desktop sidebar) and horizontal (mobile bottom sheet) modes
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { EditorTextLayer } from "@/store/useMemeStore";
import { cn } from "@/lib/utils";

const FONT_FAMILIES = [
  { id: "Impact", label: "Impact", preview: "Impact, Arial Black, sans-serif" },
  { id: "Inter", label: "Inter", preview: "Inter, system-ui, sans-serif" },
  {
    id: "Arial Black",
    label: "Arial Black",
    preview: "Arial Black, sans-serif",
  },
  { id: "Georgia", label: "Georgia", preview: "Georgia, serif" },
  { id: "Courier", label: "Courier", preview: '"Courier New", monospace' },
  {
    id: "Comic Sans",
    label: "Comic Sans",
    preview: '"Comic Sans MS", cursive',
  },
];

const FONT_SIZES = [18, 24, 28, 32, 38, 44, 48, 56, 64, 72, 80];

const PRESET_COLORS = [
  "#ffffff",
  "#000000",
  "#FFE600",
  "#FF3366",
  "#00CFFF",
  "#C8F135",
  "#FF6B35",
  "#A855F7",
];

interface Props {
  layer: EditorTextLayer;
  onChange: (patch: Partial<EditorTextLayer>) => void | Promise<void>;
  orientation: "vertical" | "horizontal";
}

export function TextToolbar({ layer, onChange, orientation }: Props) {
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [strokePickerOpen, setStrokePickerOpen] = useState(false);
  const [fontMenuOpen, setFontMenuOpen] = useState(false);

  const isVertical = orientation === "vertical";

  return (
    <div
      className={cn(
        "flex gap-3",
        isVertical ? "flex-col px-4 pb-4" : "flex-col gap-3",
      )}
    >
      {/* Section: Font Family */}
      <ToolSection label="Font">
        <div className="relative">
          <button
            onClick={() => setFontMenuOpen(!fontMenuOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#444] transition-colors text-sm text-white"
            style={{
              fontFamily: FONT_FAMILIES.find((f) => f.id === layer.fontFamily)
                ?.preview,
            }}
          >
            <span>{layer.fontFamily}</span>
            <span className="text-white/30 text-xs">▾</span>
          </button>

          <AnimatePresence>
            {fontMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full mt-1 left-0 right-0 z-50 bg-[#1A1A1A] border border-[#333] rounded-xl overflow-hidden shadow-2xl"
              >
                {FONT_FAMILIES.map((font) => (
                  <button
                    key={font.id}
                    onClick={() => {
                      onChange({ fontFamily: font.id });
                      setFontMenuOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2.5 text-sm hover:bg-[#2A2A2A] transition-colors",
                      layer.fontFamily === font.id &&
                        "bg-[#C8F135]/10 text-[#C8F135]",
                    )}
                    style={{ fontFamily: font.preview }}
                  >
                    {font.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ToolSection>

      {/* Section: Size + Weight + Style */}
      <ToolSection label="Size & Style">
        <div className="flex items-center gap-2">
          {/* Font size */}
          <div className="flex items-center gap-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-2 py-1.5">
            <button
              onClick={() => {
                const idx = FONT_SIZES.indexOf(layer.fontSize);
                if (idx > 0) onChange({ fontSize: FONT_SIZES[idx - 1] });
              }}
              className="text-white/50 hover:text-white w-5 h-5 flex items-center justify-center rounded transition-colors"
            >
              −
            </button>
            <span className="text-sm font-mono text-white w-8 text-center tabular-nums">
              {layer.fontSize}
            </span>
            <button
              onClick={() => {
                const idx = FONT_SIZES.indexOf(layer.fontSize);
                if (idx < FONT_SIZES.length - 1)
                  onChange({ fontSize: FONT_SIZES[idx + 1] });
              }}
              className="text-white/50 hover:text-white w-5 h-5 flex items-center justify-center rounded transition-colors"
            >
              +
            </button>
          </div>

          {/* Bold */}
          <StyleToggle
            active={layer.fontWeight === "bold"}
            onClick={() =>
              onChange({
                fontWeight: layer.fontWeight === "bold" ? "normal" : "bold",
              })
            }
            label="B"
            style={{ fontWeight: "bold" }}
          />

          {/* Italic */}
          <StyleToggle
            active={layer.fontStyle === "italic"}
            onClick={() =>
              onChange({
                fontStyle: layer.fontStyle === "italic" ? "normal" : "italic",
              })
            }
            label="I"
            style={{ fontStyle: "italic" }}
          />

          {/* Shadow */}
          <StyleToggle
            active={layer.shadow}
            onClick={() => onChange({ shadow: !layer.shadow })}
            label="S"
            title="Shadow"
          />
        </div>
      </ToolSection>

      {/* Section: Text Align */}
      <ToolSection label="Alignment">
        <div className="flex gap-1">
          {(["left", "center", "right"] as const).map((align) => (
            <button
              key={align}
              onClick={() => onChange({ textAlign: align })}
              title={align}
              className={cn(
                "flex-1 py-2 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-1",
                layer.textAlign === align
                  ? "bg-[#C8F135] text-black"
                  : "bg-[#1A1A1A] border border-[#2A2A2A] text-white/50 hover:text-white hover:border-[#444]",
              )}
            >
              <AlignIcon align={align} />
              <span className="text-[10px] capitalize">{align}</span>
            </button>
          ))}
        </div>
      </ToolSection>

      {/* Section: Colors */}
      <ToolSection label="Text Color">
        <ColorPicker
          value={layer.fill}
          onChange={(c) => onChange({ fill: c })}
          open={colorPickerOpen}
          onToggle={() => setColorPickerOpen(!colorPickerOpen)}
          presets={PRESET_COLORS}
        />
      </ToolSection>

      {/* Section: Stroke */}
      <ToolSection label="Outline">
        <div className="flex items-center gap-2">
          <ColorPicker
            value={layer.stroke || "#000000"}
            onChange={(c) => onChange({ stroke: c })}
            open={strokePickerOpen}
            onToggle={() => setStrokePickerOpen(!strokePickerOpen)}
            presets={PRESET_COLORS}
          />
          <div className="flex items-center gap-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-2 py-1.5 flex-1">
            <span className="text-white/30 text-xs">W</span>
            <button
              onClick={() =>
                onChange({
                  strokeWidth: Math.max(0, (layer.strokeWidth || 0) - 1),
                })
              }
              className="text-white/50 hover:text-white w-5 h-5 flex items-center justify-center rounded"
            >
              −
            </button>
            <span className="text-xs font-mono text-white w-4 text-center">
              {layer.strokeWidth}
            </span>
            <button
              onClick={() =>
                onChange({
                  strokeWidth: Math.min(12, (layer.strokeWidth || 0) + 1),
                })
              }
              className="text-white/50 hover:text-white w-5 h-5 flex items-center justify-center rounded"
            >
              +
            </button>
          </div>
        </div>
      </ToolSection>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function ToolSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="px-0.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/30">
        {label}
      </span>
      {children}
    </div>
  );
}

function StyleToggle({
  active,
  onClick,
  label,
  title,
  style,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  title?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      title={title ?? label}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all",
        active
          ? "bg-[#C8F135] text-black shadow-[0_10px_24px_rgba(200,241,53,0.18)]"
          : "border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-white/50 hover:border-[rgba(255,255,255,0.14)] hover:text-white",
      )}
      style={style}
    >
      {label}
    </motion.button>
  );
}

// ─── Align Icon ─────────────────────────────────────────────────────────────
function AlignIcon({ align }: { align: "left" | "center" | "right" }) {
  if (align === "left") {
    return (
      <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
        <rect x="0" y="0" width="14" height="2" rx="1" fill="currentColor" />
        <rect x="0" y="4" width="9" height="2" rx="1" fill="currentColor" />
        <rect x="0" y="8" width="11" height="2" rx="1" fill="currentColor" />
      </svg>
    );
  }
  if (align === "center") {
    return (
      <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
        <rect x="0" y="0" width="14" height="2" rx="1" fill="currentColor" />
        <rect x="2.5" y="4" width="9" height="2" rx="1" fill="currentColor" />
        <rect x="1" y="8" width="12" height="2" rx="1" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
      <rect x="0" y="0" width="14" height="2" rx="1" fill="currentColor" />
      <rect x="5" y="4" width="9" height="2" rx="1" fill="currentColor" />
      <rect x="3" y="8" width="11" height="2" rx="1" fill="currentColor" />
    </svg>
  );
}

function ColorPicker({
  value,
  onChange,
  open,
  onToggle,
  presets,
}: {
  value: string;
  onChange: (color: string) => void;
  open: boolean;
  onToggle: () => void;
  presets: string[];
}) {
  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.93 }}
        onClick={onToggle}
        className="w-9 h-9 rounded-lg border-2 border-[#333] hover:border-[#555] transition-colors shadow-inner"
        style={{ backgroundColor: value }}
        title="Pick color"
      />
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 z-50 bg-[#1A1A1A] border border-[#333] rounded-xl p-3 shadow-2xl"
          >
            <div className="grid grid-cols-4 gap-2 mb-3">
              {presets.map((color) => (
                <motion.button
                  key={color}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    onChange(color);
                    onToggle();
                  }}
                  className={cn(
                    "w-8 h-8 rounded-lg border-2 transition-all",
                    value === color
                      ? "border-[#C8F135] scale-110"
                      : "border-[#333] hover:border-[#555]",
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            {/* Native color input */}
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-white/40 text-xs">Custom</span>
              <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-8 h-6 rounded cursor-pointer bg-transparent border-0 p-0"
              />
            </label>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
