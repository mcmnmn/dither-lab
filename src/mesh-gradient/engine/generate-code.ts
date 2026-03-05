import { hexToRgba } from '../../utils/color';
import type { MeshGradientState } from '../state/types';

export function generateCSS(state: MeshGradientState): string {
  const { nodes, bgColor, effects } = state;

  const gradients = nodes.map(node => {
    const x = (node.x * 100).toFixed(0);
    const y = (node.y * 100).toFixed(0);
    const size = (30 + (effects.smoothness / 100) * 70).toFixed(0);
    const alpha = (effects.intensity / 100).toFixed(2);
    return `radial-gradient(${size}% ${size}% at ${x}% ${y}%, ${hexToRgba(node.color, parseFloat(alpha))} 0%, transparent 100%)`;
  });

  const blurPx = ((effects.blur / 100) * 40).toFixed(0);

  return `.mesh-gradient {
  width: 100%;
  height: 100vh;
  background-color: ${bgColor};
  background-image:
    ${gradients.join(',\n    ')};${effects.blur > 0 ? `\n  filter: blur(${blurPx}px);` : ''}
}`;
}

export function generateSVG(state: MeshGradientState): string {
  const { nodes, bgColor, effects } = state;
  const w = 1920;
  const h = 1080;
  const diagonal = Math.sqrt(w * w + h * h);

  const defs = nodes.map((node, i) => {
    const cx = (node.x * w).toFixed(0);
    const cy = (node.y * h).toFixed(0);
    const r = (diagonal * (0.3 + (effects.smoothness / 100) * 0.7)).toFixed(0);
    const alpha = (effects.intensity / 100).toFixed(2);
    return `    <radialGradient id="g${i}" cx="${cx}" cy="${cy}" r="${r}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${node.color}" stop-opacity="${alpha}"/>
      <stop offset="100%" stop-color="${node.color}" stop-opacity="0"/>
    </radialGradient>`;
  });

  const rects = nodes.map((_, i) =>
    `    <rect width="100%" height="100%" fill="url(#g${i})"/>`,
  );

  const blurDef = effects.blur > 0
    ? `    <filter id="blur"><feGaussianBlur stdDeviation="${((effects.blur / 100) * 40).toFixed(0)}"/></filter>\n`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
  <defs>
${defs.join('\n')}
${blurDef}  </defs>
  <rect width="100%" height="100%" fill="${bgColor}"/>
  <g${effects.blur > 0 ? ' filter="url(#blur)"' : ''} style="mix-blend-mode: screen">
${rects.join('\n')}
  </g>
</svg>`;
}
