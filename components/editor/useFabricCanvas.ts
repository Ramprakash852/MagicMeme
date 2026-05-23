"use client";
/**
 * useFabricCanvas — core Fabric.js v7 integration hook
 * Handles: canvas init, image background, text layers, selection, export
 */
import { useEffect, useRef, useCallback, useState } from "react";
import type { Canvas, FabricText } from "fabric";
import type { EditorTextLayer } from "@/store/useMemeStore";

export interface UseFabricCanvasOptions {
  imageData: string;
  templateId: string;
  initialLayers: EditorTextLayer[];
  onLayersChange: (layers: EditorTextLayer[]) => void;
  onActiveLayerChange: (id: string | null) => void;
}

const FONT_MAP: Record<string, string> = {
  Impact: "Impact, Arial Black, sans-serif",
  Inter: "Inter, system-ui, sans-serif",
  "Arial Black": "Arial Black, Arial, sans-serif",
  Georgia: "Georgia, serif",
  Courier: '"Courier New", monospace',
  "Comic Sans": '"Comic Sans MS", cursive',
};

function serializeText(obj: FabricText): EditorTextLayer {
  return {
    id: (obj as any).layerId ?? obj.text ?? "",
    text: obj.text ?? "",
    fontFamily: obj.fontFamily ?? "Impact",
    fontSize: obj.fontSize ?? 48,
    fontWeight: (obj.fontWeight as "normal" | "bold") ?? "normal",
    fontStyle: (obj.fontStyle as "normal" | "italic") ?? "normal",
    fill: (obj.fill as string) ?? "#ffffff",
    stroke: typeof obj.stroke === "string" ? obj.stroke : "",
    strokeWidth: obj.strokeWidth ?? 0,
    textAlign: (obj.textAlign as "left" | "center" | "right") ?? "center",
    left: obj.left ?? 0,
    top: obj.top ?? 0,
    angle: obj.angle ?? 0,
    scaleX: obj.scaleX ?? 1,
    scaleY: obj.scaleY ?? 1,
    shadow: !!obj.shadow,
  };
}

export function useFabricCanvas(
  canvasElRef: React.RefObject<HTMLCanvasElement | null>,
  containerRef: React.RefObject<HTMLDivElement | null>,
  options: UseFabricCanvasOptions,
) {
  const fabricRef = useRef<Canvas | null>(null);
  const initGenerationRef = useRef(0);
  const [isReady, setIsReady] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ w: 600, h: 500 });
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // ─── Init canvas ────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvasEl = canvasElRef.current;
    if (!canvasEl) return;

    const initGeneration = ++initGenerationRef.current;
    let disposed = false;
    let fabricInstance: Canvas | null = null;

    (async () => {
      const { Canvas: FabricCanvas } = await import("fabric");
      if (
        disposed ||
        initGeneration !== initGenerationRef.current ||
        fabricRef.current
      ) {
        return;
      }

      fabricInstance = new FabricCanvas(canvasEl, {
        selection: true,
        preserveObjectStacking: true,
        stopContextMenu: true,
        fireRightClick: false,
        enableRetinaScaling: true,
      });

      const instance = fabricInstance;
      if (!instance) return;

      fabricRef.current = fabricInstance;

      // Selection events → sync active layer id
      instance.on("selection:created", (e) => {
        const obj = e.selected?.[0] as any;
        if (obj?.layerId) optionsRef.current.onActiveLayerChange(obj.layerId);
      });
      instance.on("selection:updated", (e) => {
        const obj = e.selected?.[0] as any;
        if (obj?.layerId) optionsRef.current.onActiveLayerChange(obj.layerId);
      });
      instance.on("selection:cleared", () => {
        optionsRef.current.onActiveLayerChange(null);
      });

      // Object modification → sync layers
      const syncLayers = () => {
        const texts = instance.getObjects("text") as FabricText[];
        const layers = texts.map(serializeText);
        optionsRef.current.onLayersChange(layers);
      };
      instance.on("object:modified", syncLayers);
      (instance as any).on("object:moved", syncLayers);
      (instance as any).on("object:scaled", syncLayers);
      instance.on("text:changed", syncLayers);

      // Touch support
      (instance as any).on("touch:gesture", () => {});

      setIsReady(true);
    })();

    return () => {
      disposed = true;
      if (fabricInstance) {
        fabricInstance.dispose();
      }
      fabricRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Resize to container ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isReady || !containerRef.current) return;
    const ro = new ResizeObserver(() => {
      const fabric = fabricRef.current;
      if (!fabric || !containerRef.current) return;
      const cw = containerRef.current.clientWidth;
      const ch = containerRef.current.clientHeight;
      if (cw < 10 || ch < 10) return;
      fabric.setDimensions({ width: cw, height: ch });
      setCanvasSize({ w: cw, h: ch });
      fabric.renderAll();
    });
    ro.observe(containerRef.current);
    // Trigger once
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    fabricRef.current?.setDimensions({ width: cw, height: ch });
    setCanvasSize({ w: cw, h: ch });
    return () => ro.disconnect();
  }, [isReady, containerRef]);

  // ─── Load background image ───────────────────────────────────────────────────
  const loadImage = useCallback(
    async (imgData: string, _templateId?: string) => {
      const fabric = fabricRef.current;
      if (!fabric) return;

      const { FabricImage } = await import("fabric");

      const imgEl = await new Promise<HTMLImageElement>((res, rej) => {
        const el = new window.Image();
        el.onload = () => res(el);
        el.onerror = rej;
        el.src = imgData;
      });

      const cw = fabric.width ?? 600;
      const ch = fabric.height ?? 500;

      // Scale image to cover canvas
      const scale = Math.max(cw / imgEl.width, ch / imgEl.height);
      const fabricImg = new FabricImage(imgEl, {
        left: (cw - imgEl.width * scale) / 2,
        top: (ch - imgEl.height * scale) / 2,
        scaleX: scale,
        scaleY: scale,
        selectable: false,
        evented: false,
        hasBorders: false,
        hasControls: false,
      });

      // Clear and set background
      fabric.clear();
      fabric.add(fabricImg);
      fabric.sendObjectToBack(fabricImg);
      fabric.renderAll();

      return { cw, ch };
    },
    [],
  );

  // ─── Add text layers from template/suggestion ────────────────────────────────
  const addTextLayers = useCallback(
    async (layers: EditorTextLayer[], cw: number, ch: number) => {
      const fabric = fabricRef.current;
      if (!fabric) return;

      const { FabricText, Shadow } = await import("fabric");

      // Remove existing text objects
      const existingTexts = fabric.getObjects("text") as FabricText[];
      existingTexts.forEach((t) => fabric.remove(t));

      for (const layer of layers) {
        const fontStack = FONT_MAP[layer.fontFamily] ?? layer.fontFamily;

        const textObj = new FabricText(layer.text || layer.text, {
          left: layer.left || cw / 2,
          top: layer.top || ch * 0.1,
          originX: "center",
          originY: "center",
          fontSize: layer.fontSize,
          fontFamily: fontStack,
          fontWeight: layer.fontWeight,
          fontStyle: layer.fontStyle,
          fill: layer.fill,
          stroke: layer.stroke || "",
          strokeWidth: layer.strokeWidth,
          textAlign: layer.textAlign,
          width: cw * 0.85,
          splitByGrapheme: false,
          shadow: layer.shadow
            ? new Shadow({
                color: "rgba(0,0,0,0.7)",
                blur: 8,
                offsetX: 2,
                offsetY: 2,
              })
            : undefined,
          // Touch-friendly controls
          cornerSize: 12,
          cornerColor: "#C8F135",
          cornerStyle: "circle",
          borderColor: "#C8F135",
          transparentCorners: false,
        } as any);

        // Store layer id on object
        (textObj as any).layerId = layer.id;

        fabric.add(textObj);
      }

      fabric.renderAll();
    },
    [],
  );

  // ─── Load image + build initial layers ──────────────────────────────────────
  const initEditor = useCallback(
    async (
      imgData: string,
      templateId: string,
      suggestedLayers: EditorTextLayer[],
    ) => {
      const result = await loadImage(imgData, templateId);
      if (!result) return;
      const { cw, ch } = result;
      await addTextLayers(suggestedLayers, cw, ch);
    },
    [loadImage, addTextLayers],
  );

  // ─── Update single layer property ────────────────────────────────────────────
  const updateActiveLayer = useCallback(
    async (patch: Partial<EditorTextLayer>) => {
      const fabric = fabricRef.current;
      if (!fabric) return;

      const active = fabric.getActiveObject() as any;
      if (!active || active.type !== "text") return;

      const { Shadow } = await import("fabric");

      if (patch.text !== undefined) active.set("text", patch.text);
      if (patch.fontFamily !== undefined)
        active.set(
          "fontFamily",
          FONT_MAP[patch.fontFamily] ?? patch.fontFamily,
        );
      if (patch.fontSize !== undefined) active.set("fontSize", patch.fontSize);
      if (patch.fontWeight !== undefined)
        active.set("fontWeight", patch.fontWeight);
      if (patch.fontStyle !== undefined)
        active.set("fontStyle", patch.fontStyle);
      if (patch.fill !== undefined) active.set("fill", patch.fill);
      if (patch.stroke !== undefined) active.set("stroke", patch.stroke);
      if (patch.strokeWidth !== undefined)
        active.set("strokeWidth", patch.strokeWidth);
      if (patch.textAlign !== undefined)
        active.set("textAlign", patch.textAlign);
      if (patch.shadow !== undefined) {
        active.set(
          "shadow",
          patch.shadow
            ? new Shadow({
                color: "rgba(0,0,0,0.7)",
                blur: 8,
                offsetX: 2,
                offsetY: 2,
              })
            : null,
        );
      }

      fabric.renderAll();

      // Sync layers up
      const texts = fabric.getObjects("text") as FabricText[];
      optionsRef.current.onLayersChange(texts.map(serializeText));
    },
    [],
  );

  // ─── Add new text layer ───────────────────────────────────────────────────────
  const addTextLayer = useCallback(
    async (text = "New Text", _templateId?: string) => {
      const fabric = fabricRef.current;
      if (!fabric) return;

      const { FabricText, Shadow } = await import("fabric");
      const cw = fabric.width ?? 600;
      const ch = fabric.height ?? 500;
      const id = `layer_${Date.now()}`;

      const textObj = new FabricText(text, {
        left: cw / 2,
        top: ch / 2,
        originX: "center",
        originY: "center",
        fontSize: 48,
        fontFamily: "Impact, Arial Black, sans-serif",
        fontWeight: "bold",
        fill: "#ffffff",
        stroke: "#000000",
        strokeWidth: 2,
        textAlign: "center",
        width: cw * 0.85,
        shadow: new Shadow({
          color: "rgba(0,0,0,0.5)",
          blur: 6,
          offsetX: 1,
          offsetY: 1,
        }),
        cornerSize: 12,
        cornerColor: "#C8F135",
        cornerStyle: "circle",
        borderColor: "#C8F135",
        transparentCorners: false,
      } as any);

      (textObj as any).layerId = id;

      fabric.add(textObj);
      fabric.setActiveObject(textObj);
      fabric.renderAll();

      const texts = fabric.getObjects("text") as FabricText[];
      optionsRef.current.onLayersChange(texts.map(serializeText));
      optionsRef.current.onActiveLayerChange(id);
    },
    [],
  );

  // ─── Delete active layer ─────────────────────────────────────────────────────
  const deleteActiveLayer = useCallback(() => {
    const fabric = fabricRef.current;
    if (!fabric) return;
    const active = fabric.getActiveObject();
    if (!active || (active as any).type === "image") return;
    fabric.remove(active);
    fabric.discardActiveObject();
    fabric.renderAll();
    const texts = fabric.getObjects("text") as FabricText[];
    optionsRef.current.onLayersChange(texts.map(serializeText));
    optionsRef.current.onActiveLayerChange(null);
  }, []);

  // ─── Select layer by id ───────────────────────────────────────────────────────
  const selectLayer = useCallback((id: string) => {
    const fabric = fabricRef.current;
    if (!fabric) return;
    const obj = fabric.getObjects().find((o: any) => o.layerId === id);
    if (obj) {
      fabric.setActiveObject(obj);
      fabric.renderAll();
    }
  }, []);

  // ─── Switch template (reload image + reposition texts) ───────────────────────
  const switchTemplate = useCallback(
    async (newTemplateId: string, layers: EditorTextLayer[]) => {
      const fabric = fabricRef.current;
      if (!fabric) return;
      const result = await loadImage(
        optionsRef.current.imageData,
        newTemplateId,
      );
      if (!result) return;
      const { cw, ch } = result;
      await addTextLayers(layers, cw, ch);
    },
    [loadImage, addTextLayers],
  );

  // ─── Export PNG ───────────────────────────────────────────────────────────────
  const exportPNG = useCallback((): string | null => {
    const fabric = fabricRef.current;
    if (!fabric) return null;

    // Deselect all for clean export
    fabric.discardActiveObject();
    fabric.renderAll();

    return fabric.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 2, // 2x for high resolution
    });
  }, []);

  return {
    fabricRef,
    isReady,
    canvasSize,
    initEditor,
    updateActiveLayer,
    addTextLayer,
    deleteActiveLayer,
    selectLayer,
    switchTemplate,
    exportPNG,
  };
}
