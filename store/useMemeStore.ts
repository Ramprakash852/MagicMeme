// Zustand store for meme creation flow with steps: upload, suggest, edit, share
import { create } from "zustand";
import type { MemeSuggestion } from "@/types";

export type AppStep = "upload" | "suggest" | "edit" | "share";

export interface EditorTextLayer {
  id: string;
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: "normal" | "bold";
  fontStyle: "normal" | "italic";
  fill: string;
  stroke: string;
  strokeWidth: number;
  textAlign: "left" | "center" | "right";
  left: number; // pixels on canvas
  top: number; // pixels on canvas
  angle: number;
  scaleX: number;
  scaleY: number;
  shadow: boolean;
}

export interface EditorState {
  activeTemplateId: string;
  layers: EditorTextLayer[];
  activeLayerId: string | null;
  exportedDataUrl: string | null;
}

interface MemeState {
  step: AppStep;
  imageData: string | null; // base64 data URL
  imageMimeType: string;
  suggestions: MemeSuggestion[];
  selectedSuggestion: MemeSuggestion | null;
  savedMemeId: string | null;
  shareUrl: string | null; // full public URL for share page
  isLoading: boolean;
  error: string | null;
  // Editor state
  editor: EditorState;
  // Actions
  setImage: (data: string, mimeType: string) => void;
  setSuggestions: (s: MemeSuggestion[]) => void;
  selectSuggestion: (s: MemeSuggestion) => void;
  setSavedMemeId: (id: string) => void;
  setShareUrl: (url: string | null) => void;
  setStep: (step: AppStep) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  setEditorState: (patch: Partial<EditorState>) => void;
  setExportedDataUrl: (url: string | null) => void;
  reset: () => void;
}

const initialEditorState: EditorState = {
  activeTemplateId: "classic",
  layers: [],
  activeLayerId: null,
  exportedDataUrl: null,
};

const initialState = {
  step: "upload" as AppStep,
  imageData: null,
  imageMimeType: "image/jpeg",
  suggestions: [],
  selectedSuggestion: null,
  savedMemeId: null,
  shareUrl: null,
  isLoading: false,
  error: null,
  editor: initialEditorState,
};

export const useMemeStore = create<MemeState>((set) => ({
  ...initialState,
  setImage: (data, mimeType) =>
    set({ imageData: data, imageMimeType: mimeType }),
  setSuggestions: (suggestions) => set({ suggestions }),
  selectSuggestion: (s) => set({ selectedSuggestion: s, step: "edit" }),
  // NOTE: does not change step — caller must setStep('share') separately
  setSavedMemeId: (id) => set({ savedMemeId: id }),
  setShareUrl: (url) => set({ shareUrl: url }),
  setStep: (step) => set({ step }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setEditorState: (patch) =>
    set((s) => ({ editor: { ...s.editor, ...patch } })),
  setExportedDataUrl: (url) =>
    set((s) => ({ editor: { ...s.editor, exportedDataUrl: url } })),
  reset: () => set(initialState),
}));
