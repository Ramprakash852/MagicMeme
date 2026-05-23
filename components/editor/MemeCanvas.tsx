"use client";
/**
 * MemeCanvas — Fabric.js powered meme editor
 * Full drag, resize, font controls, template switching, PNG export
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMemeStore } from "@/store/useMemeStore";
import type { EditorTextLayer } from "@/store/useMemeStore";
import { useFabricCanvas } from "./useFabricCanvas";
import { TextToolbar } from "./TextToolbar";
import { TemplateDrawer } from "./TemplateDrawer";
import { LayerPanel } from "./LayerPanel";
import { ExportButton } from "./ExportButton";
import { Button } from "@/components/ui/Button";
import { getTemplate } from "@/lib/templates";
import { buildInitialLayers } from "./layerBuilder";
import toast from "react-hot-toast";

export function MemeCanvas() {
  const {
    imageData,
    selectedSuggestion,
    editor,
    setEditorState,
    setExportedDataUrl,
    setStep,
    reset,
  } = useMemeStore();

  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [templateDrawerOpen, setTemplateDrawerOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isMobileToolbarOpen, setIsMobileToolbarOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Active layer derived from editor state
  const activeLayer =
    editor.layers.find((l) => l.id === editor.activeLayerId) ?? null;

  const handleLayersChange = useCallback(
    (layers: EditorTextLayer[]) => {
      setEditorState({ layers });
    },
    [setEditorState],
  );

  const handleActiveLayerChange = useCallback(
    (id: string | null) => {
      setEditorState({ activeLayerId: id });
      if (id) setIsMobileToolbarOpen(true);
    },
    [setEditorState],
  );

  const {
    isReady,
    hasMeasuredSize,
    initEditor,
    updateActiveLayer,
    addTextLayer,
    deleteActiveLayer,
    selectLayer,
    switchTemplate,
    exportPNG,
  } = useFabricCanvas(canvasElRef, containerRef, {
    imageData: imageData ?? "",
    templateId: editor.activeTemplateId,
    initialLayers: editor.layers,
    onLayersChange: handleLayersChange,
    onActiveLayerChange: handleActiveLayerChange,
  });

  // ─── Init editor once Fabric is ready ───────────────────────────────────────
  useEffect(() => {
    if (
      !isReady ||
      !hasMeasuredSize ||
      !imageData ||
      !selectedSuggestion ||
      initialized
    )
      return;

    const template = getTemplate(selectedSuggestion.templateId);
    const layers = buildInitialLayers(selectedSuggestion, template, 600, 500);

    setEditorState({
      activeTemplateId: selectedSuggestion.templateId,
      layers,
    });

    initEditor(imageData, selectedSuggestion.templateId, layers).then(() => {
      setInitialized(true);
    });
  }, [
    isReady,
    imageData,
    selectedSuggestion,
    initialized,
    hasMeasuredSize,
    initEditor,
    setEditorState,
  ]);

  // ─── Template switch ─────────────────────────────────────────────────────────
  const handleTemplateSwitch = useCallback(
    async (templateId: string) => {
      if (templateId === editor.activeTemplateId) return;
      setTemplateDrawerOpen(false);

      const template = getTemplate(templateId);
      if (!selectedSuggestion) return;

      // Rebuild layers with new template positions
      const newLayers = buildInitialLayers(
        selectedSuggestion,
        template,
        600,
        500,
      );
      setEditorState({
        activeTemplateId: templateId,
        layers: newLayers,
        activeLayerId: null,
      });

      await switchTemplate(templateId, newLayers);
      toast.success(`Switched to ${template.name}`);
    },
    [
      editor.activeTemplateId,
      selectedSuggestion,
      setEditorState,
      switchTemplate,
    ],
  );

  // ─── Export ─────────────────────────────────────────────────────────────────
  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      await new Promise((r) => setTimeout(r, 80)); // Let UI update
      const dataUrl = exportPNG();
      if (!dataUrl) throw new Error("Export failed");

      setExportedDataUrl(dataUrl);
      // SharePanel (Phase 5) handles upload + share URL generation
      toast.success("Looking good! Saving…");
      setTimeout(() => setStep("share"), 400);
    } catch {
      toast.error("Export failed. Try again.");
    } finally {
      setIsExporting(false);
    }
  }, [exportPNG, setExportedDataUrl, setStep]);

  // ─── Keyboard shortcuts ──────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        // Only delete if not editing text in an input
        if (
          document.activeElement?.tagName === "INPUT" ||
          document.activeElement?.tagName === "TEXTAREA"
        )
          return;
        deleteActiveLayer();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [deleteActiveLayer]);

  return (
    <div className="flex h-full w-full min-h-0 flex-col bg-[var(--background)] text-[var(--text-primary)]">
      {/* ── Top Bar ──────────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(5,5,5,0.72)] px-4 py-3 backdrop-blur-2xl sm:px-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep("suggest")}
            className="gap-1 text-xs text-white/55 hover:text-white"
          >
            ← Back
          </Button>
          <span className="hidden text-xs text-white/20 sm:block">|</span>
          <span className="hidden text-xs text-white/50 sm:block">
            {getTemplate(editor.activeTemplateId).name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Add text */}
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => addTextLayer("New Text", editor.activeTemplateId)}
            className="flex items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-xs font-medium text-white/70 transition-all hover:border-[rgba(200,241,53,0.25)] hover:text-white"
          >
            <span className="text-[#C8F135]">+</span> Text
          </motion.button>

          {/* Template switcher */}
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => setTemplateDrawerOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-xs font-medium text-white/70 transition-all hover:border-[rgba(200,241,53,0.25)] hover:text-white"
          >
            ◧ Templates
          </motion.button>

          {/* Export */}
          <ExportButton onClick={handleExport} loading={isExporting} />
        </div>
      </div>

      {/* ── Main Layout ──────────────────────────────────────────────────────── */}
      <div className="grid flex-1 min-h-0 overflow-hidden lg:grid-cols-[280px_minmax(0,1fr)_320px]">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col border-r border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] overflow-y-auto">
          <div className="border-b border-[rgba(255,255,255,0.06)] px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/35">
              Layer stack
            </p>
          </div>
          <LayerPanel
            layers={editor.layers}
            activeLayerId={editor.activeLayerId}
            onSelect={selectLayer}
            onDelete={deleteActiveLayer}
            onAdd={() => addTextLayer("New Text", editor.activeTemplateId)}
          />
        </aside>

        {/* Canvas Area */}
        <div className="flex min-h-0 flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,rgba(200,241,53,0.05),transparent_35%),var(--background)] p-4 sm:p-6 lg:p-8">
          {/* Canvas shadow/glow frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-4xl"
            style={{ aspectRatio: "4/3" }}
          >
            {/* Glow */}
            <div
              className="absolute -inset-px rounded-[28px] opacity-35 blur-2xl pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse, #C8F13530, transparent 70%)",
              }}
            />

            {/* Canvas container */}
            <div
              ref={containerRef}
              className="relative w-full h-full overflow-hidden rounded-[28px] border border-[rgba(255,255,255,0.08)] bg-[rgba(17,17,17,0.92)] shadow-[0_30px_80px_rgba(0,0,0,0.5)]"
              style={{ aspectRatio: "4/3" }}
            >
              <canvas ref={canvasElRef} className="block w-full h-full" />

              {/* Loading overlay */}
              <AnimatePresence>
                {!initialized && (
                  <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[rgba(17,17,17,0.9)]"
                  >
                    <div className="h-8 w-8 rounded-full border-2 border-white/10 border-t-[#C8F135] animate-spin" />
                    <p className="text-sm text-white/40">Loading editor...</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Selection hint */}
              <AnimatePresence>
                {initialized && !editor.activeLayerId && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.8, duration: 0.4 }}
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none"
                  >
                    <span className="rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-xs text-white/50 backdrop-blur-sm">
                      Tap text to edit · Drag to move
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Canvas size label */}
            <div className="absolute -bottom-6 right-0 text-xs text-white/20">
              2× export quality
            </div>
          </motion.div>
        </div>

        {/* Right rail */}
        <aside className="hidden lg:flex flex-col gap-4 border-l border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4 xl:p-5 overflow-y-auto">
          <div className="premium-card rounded-[24px] p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/35">
                  Export
                </p>
                <p className="mt-1 text-sm text-white/70">Finish and publish</p>
              </div>
              <ExportButton onClick={handleExport} loading={isExporting} />
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  addTextLayer("New Text", editor.activeTemplateId)
                }
                className="flex-1"
              >
                + Text
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTemplateDrawerOpen(true)}
                className="flex-1"
              >
                Templates
              </Button>
            </div>
          </div>

          {activeLayer ? (
            <div className="premium-card rounded-[24px] p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/35">
                    Text controls
                  </p>
                  <p className="mt-1 text-sm text-white/70">
                    Adjust the active layer
                  </p>
                </div>
                <span className="rounded-full border border-[rgba(200,241,53,0.18)] bg-[rgba(200,241,53,0.08)] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#C8F135]">
                  Live
                </span>
              </div>
              <TextToolbar
                layer={activeLayer}
                onChange={updateActiveLayer}
                orientation="vertical"
              />
            </div>
          ) : (
            <div className="premium-card rounded-[24px] p-4 text-sm text-white/50">
              Select a text layer to reveal styling controls.
            </div>
          )}
        </aside>
      </div>

      {/* ── Mobile Toolbar ───────────────────────────────────────────────────── */}
      <MobileToolbar
        activeLayer={activeLayer}
        isOpen={isMobileToolbarOpen && !!activeLayer}
        onClose={() => setIsMobileToolbarOpen(false)}
        onChange={updateActiveLayer}
        onDelete={deleteActiveLayer}
      />

      {/* ── Template Drawer ──────────────────────────────────────────────────── */}
      <TemplateDrawer
        open={templateDrawerOpen}
        activeTemplateId={editor.activeTemplateId}
        imageData={imageData ?? ""}
        suggestion={selectedSuggestion}
        onSelect={handleTemplateSwitch}
        onClose={() => setTemplateDrawerOpen(false)}
      />
    </div>
  );
}

// ─── Mobile Toolbar ────────────────────────────────────────────────────────────
function MobileToolbar({
  activeLayer,
  isOpen,
  onClose,
  onChange,
  onDelete,
}: {
  activeLayer: EditorTextLayer | null;
  isOpen: boolean;
  onClose: () => void;
  onChange: (patch: Partial<EditorTextLayer>) => void | Promise<void>;
  onDelete: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && activeLayer && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 lg:hidden"
            onClick={onClose}
          />
          {/* Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-x-3 bottom-3 z-40 lg:hidden rounded-[28px] border border-[rgba(255,255,255,0.08)] bg-[rgba(17,17,17,0.94)] shadow-[0_20px_48px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-white/15" />
            </div>
            <div className="flex items-center justify-between px-4 pb-2">
              <span className="text-sm font-medium text-white/50">
                Text Style
              </span>
              <div className="flex gap-2">
                <button
                  onClick={onDelete}
                  className="rounded-lg bg-red-500/10 px-2 py-1 text-xs text-red-300 transition-colors hover:bg-red-500/20 hover:text-red-200"
                >
                  Delete
                </button>
                <button
                  onClick={onClose}
                  className="rounded-lg px-2 py-1 text-xs text-white/40 transition-colors hover:bg-white/5 hover:text-white"
                >
                  Done
                </button>
              </div>
            </div>
            <div className="px-4 pb-6">
              <TextToolbar
                layer={activeLayer}
                onChange={onChange}
                orientation="horizontal"
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
