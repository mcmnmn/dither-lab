import { hexToRgb } from '../../utils/color';
import type { MeshNode, MeshEffects, MeshBlendMode } from '../state/types';

const BLEND_MODE_MAP: Record<MeshBlendMode, GlobalCompositeOperation> = {
  'normal': 'source-over',
  'screen': 'screen',
  'multiply': 'multiply',
  'overlay': 'overlay',
  'soft-light': 'soft-light',
};

export function renderMeshGradient(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  nodes: MeshNode[],
  bgColor: string,
  effects: MeshEffects,
): void {
  // Step 1: Fill background
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.filter = 'none';
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  if (nodes.length === 0) return;

  const maxDim = Math.max(width, height);
  const baseRadius = maxDim * (0.35 + (effects.smoothness / 100) * 0.65);
  const alpha = effects.intensity / 100;

  // Step 2: Composite radial gradients on offscreen canvas
  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const offCtx = offscreen.getContext('2d')!;

  const compositeOp = BLEND_MODE_MAP[effects.blendMode] ?? 'screen';

  for (const node of nodes) {
    const cx = node.x * width;
    const cy = node.y * height;

    const gradient = offCtx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius);

    // Gaussian-like alpha falloff (5 stops)
    const [r, g, b] = hexToRgb(node.color);
    const rgba = (a: number) => `rgba(${r}, ${g}, ${b}, ${a})`;
    gradient.addColorStop(0, rgba(alpha));
    gradient.addColorStop(0.25, rgba(alpha * 0.9));
    gradient.addColorStop(0.5, rgba(alpha * 0.55));
    gradient.addColorStop(0.75, rgba(alpha * 0.15));
    gradient.addColorStop(1, rgba(0));

    offCtx.globalCompositeOperation = compositeOp;
    offCtx.fillStyle = gradient;
    offCtx.fillRect(0, 0, width, height);
  }

  // Step 3: Draw to main canvas
  ctx.drawImage(offscreen, 0, 0);
}
