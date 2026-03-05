import { hexToRgb } from '../../utils/color';
import type { MeshGradientState } from '../state/types';

export function generateCSS(state: MeshGradientState): string {
  const { nodes, bgColor, effects } = state;

  const gradients = nodes.map(node => {
    const x = (node.x * 100).toFixed(0);
    const y = (node.y * 100).toFixed(0);
    const size = (35 + (effects.smoothness / 100) * 65).toFixed(0);
    const alpha = effects.intensity / 100;
    const [r, g, b] = hexToRgb(node.color);
    const rgba = (a: number) => `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`;

    return `radial-gradient(${size}% ${size}% at ${x}% ${y}%, ${rgba(alpha)} 0%, ${rgba(alpha * 0.9)} 25%, ${rgba(alpha * 0.55)} 50%, ${rgba(alpha * 0.15)} 75%, transparent 100%)`;
  });

  const blendLine = effects.blendMode !== 'normal'
    ? `\n  mix-blend-mode: ${effects.blendMode};`
    : '';

  return `.mesh-gradient {
  width: 100%;
  height: 100vh;
  background-color: ${bgColor};
  background-image:
    ${gradients.join(',\n    ')};${blendLine}
}`;
}

export function generateSVG(state: MeshGradientState): string {
  const { nodes, bgColor, effects } = state;
  const w = 1920;
  const h = 1080;
  const maxDim = Math.max(w, h);

  const defs = nodes.map((node, i) => {
    const cx = (node.x * w).toFixed(0);
    const cy = (node.y * h).toFixed(0);
    const r = (maxDim * (0.35 + (effects.smoothness / 100) * 0.65)).toFixed(0);
    const alpha = effects.intensity / 100;

    return `    <radialGradient id="g${i}" cx="${cx}" cy="${cy}" r="${r}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${node.color}" stop-opacity="${alpha.toFixed(2)}"/>
      <stop offset="25%" stop-color="${node.color}" stop-opacity="${(alpha * 0.9).toFixed(3)}"/>
      <stop offset="50%" stop-color="${node.color}" stop-opacity="${(alpha * 0.55).toFixed(3)}"/>
      <stop offset="75%" stop-color="${node.color}" stop-opacity="${(alpha * 0.15).toFixed(3)}"/>
      <stop offset="100%" stop-color="${node.color}" stop-opacity="0"/>
    </radialGradient>`;
  });

  const rects = nodes.map((_, i) =>
    `    <rect width="100%" height="100%" fill="url(#g${i})"/>`,
  );

  const svgBlendMode = effects.blendMode === 'normal' ? 'normal' : effects.blendMode;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
  <defs>
${defs.join('\n')}
  </defs>
  <rect width="100%" height="100%" fill="${bgColor}"/>
  <g style="mix-blend-mode: ${svgBlendMode}">
${rects.join('\n')}
  </g>
</svg>`;
}
