export interface TextZone {
  id: string;
  placeholder: string;
  x: number; y: number;          // 0-1 relative to image
  width: number;                  // 0-1 relative to image
  fontSize: number;               // base px, scaled to canvas
  align: 'left' | 'center' | 'right';
  color: string;
  stroke: string;
  position: 'top' | 'bottom' | 'center' | 'overlay';
}

export interface MemeTemplate {
  id: string;
  name: string;
  description: string;
  zones: TextZone[];
  bgColor?: string;              // for caption-below style
  imageRatio: 'full' | 'top-half' | 'center';
}

export const TEMPLATES: MemeTemplate[] = [
  {
    id: 'classic',
    name: 'Classic Impact',
    description: 'Top + bottom white Impact text with black stroke',
    imageRatio: 'full',
    zones: [
      { id: 'top', placeholder: 'TOP TEXT', x: 0.05, y: 0.02,
        width: 0.9, fontSize: 52, align: 'center',
        color: '#ffffff', stroke: '#000000', position: 'top' },
      { id: 'bottom', placeholder: 'BOTTOM TEXT', x: 0.05, y: 0.82,
        width: 0.9, fontSize: 52, align: 'center',
        color: '#ffffff', stroke: '#000000', position: 'bottom' },
    ],
  },
  {
    id: 'caption-below',
    name: 'Caption Below',
    description: 'Clean image with white caption bar below',
    imageRatio: 'top-half',
    bgColor: '#ffffff',
    zones: [
      { id: 'caption', placeholder: 'Caption text here', x: 0.05, y: 0.72,
        width: 0.9, fontSize: 32, align: 'center',
        color: '#000000', stroke: 'transparent', position: 'overlay' },
    ],
  },
  {
    id: 'drake',
    name: 'Drake Format',
    description: 'Two-panel vertical with side text',
    imageRatio: 'full',
    zones: [
      { id: 'reject', placeholder: 'Thing being rejected', x: 0.52, y: 0.08,
        width: 0.44, fontSize: 26, align: 'left',
        color: '#000000', stroke: 'transparent', position: 'overlay' },
      { id: 'approve', placeholder: 'Thing being approved', x: 0.52, y: 0.55,
        width: 0.44, fontSize: 26, align: 'left',
        color: '#000000', stroke: 'transparent', position: 'overlay' },
    ],
  },
  {
    id: 'bold-center',
    name: 'Bold Center',
    description: 'Single large centered text over image',
    imageRatio: 'full',
    zones: [
      { id: 'main', placeholder: 'THE MOMENT WHEN...', x: 0.05, y: 0.35,
        width: 0.9, fontSize: 60, align: 'center',
        color: '#ffffff', stroke: '#000000', position: 'center' },
    ],
  },
  {
    id: 'subtitle',
    name: 'Subtitle Style',
    description: 'Dark overlay bar at bottom, light subtitle text',
    imageRatio: 'full',
    zones: [
      { id: 'sub', placeholder: 'when the code finally compiles', x: 0.05, y: 0.84,
        width: 0.9, fontSize: 34, align: 'center',
        color: '#ffffff', stroke: 'transparent', position: 'bottom' },
    ],
  },
  {
    id: 'two-caption',
    name: 'Two Caption',
    description: 'Setup line at top, punchline at bottom, no stroke',
    imageRatio: 'full',
    zones: [
      { id: 'setup', placeholder: 'The setup...', x: 0.05, y: 0.03,
        width: 0.9, fontSize: 36, align: 'center',
        color: '#ffffff', stroke: '#000000', position: 'top' },
      { id: 'punchline', placeholder: 'THE PUNCHLINE', x: 0.05, y: 0.78,
        width: 0.9, fontSize: 48, align: 'center',
        color: '#FFE600', stroke: '#000000', position: 'bottom' },
    ],
  },
];

export const getTemplate = (id: string) =>
  TEMPLATES.find(t => t.id === id) ?? TEMPLATES[0];
