export interface MemeTemplate {
  id: string;
  name: string;
  layout: 'top-bottom' | 'caption-below' | 'caption-above' | 'center' | 'subtitle' | 'split';
  textZones: TextZone[];
  defaultFont: string;
  defaultFontSize: number;
}

export interface TextZone {
  id: string;
  label: string;
  position: { x: number; y: number; width: number; height: number };
  fontSize: number;
  align: 'left' | 'center' | 'right';
  color: string;
  strokeColor: string;
}

export interface MemeSuggestion {
  templateId: string;
  topText: string;
  bottomText: string;
  mainCaption: string;
  vibe: string;          // 'chaotic' | 'deadpan' | 'wholesome' | etc
  explanation: string;   // Why this is funny (for debugging prompts)
}

export interface Meme {
  id: string;
  createdAt: string;
  imageData: string;
  templateId: string;
  captionTop: string;
  captionBottom: string;
  captionMain: string;
  font: string;
  reactions: ReactionCount[];
}

export interface ReactionCount {
  emoji: string;
  count: number;
}
