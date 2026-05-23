"use client";
/**
 * LayerPanel — list of text layers with select, delete, reorder
 */
import { motion, AnimatePresence } from "framer-motion";
import type { EditorTextLayer } from "@/store/useMemeStore";
import { cn } from "@/lib/utils";

interface Props {
  layers: EditorTextLayer[];
  activeLayerId: string | null;
  onSelect: (id: string) => void;
  onDelete: () => void;
  onAdd: () => void;
}

export function LayerPanel({
  layers,
  activeLayerId,
  onSelect,
  onDelete,
  onAdd,
}: Props) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] px-4 py-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/40">
          Text Layers
        </span>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onAdd}
          className="flex h-6 w-6 items-center justify-center rounded-full border border-[rgba(200,241,53,0.16)] bg-[rgba(200,241,53,0.08)] text-xs font-bold text-[#C8F135] transition-colors hover:bg-[rgba(200,241,53,0.16)]"
          title="Add text layer"
        >
          +
        </motion.button>
      </div>

      {/* Layer list */}
      <div className="flex-1 overflow-y-auto py-2">
        <AnimatePresence initial={false}>
          {layers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center px-4 py-10 text-center"
            >
              <span className="text-2xl mb-2">✏️</span>
              <p className="text-xs text-white/30">No text layers</p>
              <button
                onClick={onAdd}
                className="mt-2 text-xs text-[#C8F135] hover:underline"
              >
                Add one
              </button>
            </motion.div>
          ) : (
            layers.map((layer) => (
              <motion.div
                key={layer.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
              >
                <LayerItem
                  layer={layer}
                  isActive={layer.id === activeLayerId}
                  onSelect={() => onSelect(layer.id)}
                  onDelete={onDelete}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function LayerItem({
  layer,
  isActive,
  onSelect,
  onDelete,
}: {
  layer: EditorTextLayer;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const truncated =
    layer.text.length > 22 ? layer.text.slice(0, 22) + "…" : layer.text;

  return (
    <div
      onClick={onSelect}
      className={cn(
        "group mx-2 flex cursor-pointer items-center gap-2 rounded-2xl border px-3 py-2.5 transition-all",
        isActive
          ? "border-[rgba(200,241,53,0.24)] bg-[rgba(200,241,53,0.08)]"
          : "border-transparent bg-[rgba(255,255,255,0.02)] hover:border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.04)]",
      )}
    >
      {/* Type icon */}
      <div
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
          isActive ? "bg-[#C8F135] text-black" : "bg-white/5 text-white/50",
        )}
      >
        T
      </div>

      {/* Text preview */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "truncate text-xs font-medium",
            isActive ? "text-white" : "text-white/60",
          )}
        >
          {truncated || "Empty"}
        </p>
        <p className="mt-0.5 text-[10px] text-white/25">
          {layer.fontFamily} · {layer.fontSize}px
        </p>
      </div>

      {/* Color swatch */}
      <div
        className="h-3 w-3 shrink-0 rounded-full border border-white/10"
        style={{ backgroundColor: layer.fill }}
      />

      {/* Delete btn — visible on hover */}
      {isActive && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs text-red-400 transition-colors hover:bg-red-500/20"
          title="Delete layer"
        >
          ✕
        </motion.button>
      )}
    </div>
  );
}
