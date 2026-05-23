/**
 * layerBuilder — converts AI suggestion + template → EditorTextLayer[]
 * All positions are in pixels relative to a 600×500 base canvas.
 * Fabric will scale them when the canvas resizes.
 */
import type { EditorTextLayer } from '@/store/useMemeStore';
import type { MemeTemplate } from '@/lib/templates';
import type { MemeSuggestion } from '@/types';

const BASE_W = 600;
const BASE_H = 500;

function makeId() {
  return `layer_${Math.random().toString(36).slice(2, 9)}`;
}

function resolveText(zone: { id: string }, suggestion: MemeSuggestion): string {
  if (zone.id === 'top' || zone.id === 'setup' || zone.id === 'reject')
    return suggestion.topText ?? '';
  if (zone.id === 'bottom' || zone.id === 'punchline' || zone.id === 'approve')
    return suggestion.bottomText ?? '';
  return suggestion.mainCaption ?? suggestion.topText ?? '';
}

function resolveFont(zone: { color: string; stroke: string }): string {
  // White with stroke = Impact style; dark/no stroke = Inter
  if (zone.color === '#ffffff' && zone.stroke !== 'transparent') return 'Impact';
  if (zone.color === '#000000') return 'Inter';
  if (zone.color === '#FFE600') return 'Impact';
  return 'Impact';
}

export function buildInitialLayers(
  suggestion: MemeSuggestion,
  template: MemeTemplate,
  canvasW = BASE_W,
  canvasH = BASE_H,
): EditorTextLayer[] {
  return template.zones
    .map((zone) => {
      const text = resolveText(zone, suggestion);
      if (!text) return null;

      // Convert relative positions to pixels
      const centerX = zone.x * canvasW + (zone.width * canvasW) / 2;

      let centerY: number;
      if (zone.position === 'bottom') {
        // Anchor from bottom
        const approxLines = Math.ceil((text.length * (zone.fontSize * 0.6)) / (zone.width * canvasW));
        const totalH = approxLines * zone.fontSize * 1.2;
        centerY = canvasH - totalH - 16;
      } else if (zone.position === 'center') {
        centerY = canvasH / 2;
      } else {
        centerY = zone.y * canvasH + zone.fontSize;
      }

      const fontFamily = resolveFont(zone);
      const isImpact = fontFamily === 'Impact';

      const layer: EditorTextLayer = {
        id: makeId(),
        text,
        fontFamily,
        fontSize: Math.round((zone.fontSize / 500) * canvasW * 1.05),
        fontWeight: isImpact ? 'bold' : 'normal',
        fontStyle: 'normal',
        fill: zone.color,
        stroke: zone.stroke !== 'transparent' ? zone.stroke : '',
        strokeWidth: zone.stroke !== 'transparent' ? Math.max(1, Math.round(zone.fontSize * 0.08)) : 0,
        textAlign: zone.align,
        left: centerX,
        top: centerY,
        angle: 0,
        scaleX: 1,
        scaleY: 1,
        shadow: zone.color === '#ffffff',
      };

      return layer;
    })
    .filter(Boolean) as EditorTextLayer[];
}
