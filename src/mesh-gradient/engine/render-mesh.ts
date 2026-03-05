import { hexToRgba } from '../../utils/color';
import type { MeshNode, MeshEffects, MeshNoise } from '../state/types';

export function renderMeshGradient(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  nodes: MeshNode[],
  bgColor: string,
  effects: MeshEffects,
  noise: MeshNoise,
): void {
  // Step 1: Fill background
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.filter = 'none';
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  if (nodes.length === 0) return;

  const diagonal = Math.sqrt(width * width + height * height);
  const baseRadius = diagonal * (0.3 + (effects.smoothness / 100) * 0.7);
  const alpha = effects.intensity / 100;

  // Step 2: Composite radial gradients on offscreen canvas
  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const offCtx = offscreen.getContext('2d')!;

  for (const node of nodes) {
    const cx = node.x * width;
    const cy = node.y * height;

    const gradient = offCtx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius);
    gradient.addColorStop(0, hexToRgba(node.color, alpha));
    gradient.addColorStop(1, hexToRgba(node.color, 0));

    offCtx.globalCompositeOperation = 'lighter';
    offCtx.fillStyle = gradient;
    offCtx.fillRect(0, 0, width, height);
  }

  // Step 3: Apply blur and draw to main canvas
  const blurRadius = (effects.blur / 100) * (diagonal * 0.05);
  ctx.filter = blurRadius > 0.5 ? `blur(${blurRadius}px)` : 'none';
  ctx.drawImage(offscreen, 0, 0);
  ctx.filter = 'none';

  // Step 4: Apply noise overlay
  if (noise.amount > 0) {
    const noiseCanvas = document.createElement('canvas');
    noiseCanvas.width = width;
    noiseCanvas.height = height;
    const noiseCtx = noiseCanvas.getContext('2d')!;
    const imageData = noiseCtx.createImageData(width, height);
    const data = imageData.data;

    const step = Math.max(1, Math.round((100 - noise.scale) / 10));

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const v = Math.random() * 255;
        for (let dy = 0; dy < step && y + dy < height; dy++) {
          for (let dx = 0; dx < step && x + dx < width; dx++) {
            const i = ((y + dy) * width + (x + dx)) * 4;
            data[i] = data[i + 1] = data[i + 2] = v;
            data[i + 3] = 255;
          }
        }
      }
    }

    noiseCtx.putImageData(imageData, 0, 0);
    ctx.globalAlpha = noise.amount / 200;
    ctx.globalCompositeOperation = 'overlay';
    ctx.drawImage(noiseCanvas, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
}
