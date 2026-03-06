import { renderMeshGradient } from '../../mesh-gradient/engine/render-mesh';
import { MESH_PRESETS } from '../../mesh-gradient/data/presets';
import { downloadBlob } from '../../utils/image-io';
import type { SFState, SFPatternId, SFLogoPosition } from '../state/types';
import type { MeshEffects } from '../../mesh-gradient/state/types';

const DEFAULT_EFFECTS: MeshEffects = { intensity: 75, smoothness: 75, blendMode: 'screen' };

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  size: number,
  state: SFState,
  screenshotImg: HTMLImageElement | null,
  logoImg: HTMLImageElement | null,
) {
  ctx.clearRect(0, 0, size, size);

  // 1. Background
  renderBackground(ctx, size, state);

  // 2. Screenshot
  if (screenshotImg && screenshotImg.naturalWidth > 0) {
    renderScreenshot(ctx, size, state, screenshotImg);
  }

  // 3. Logo
  if (state.logoEnabled && logoImg && logoImg.naturalWidth > 0) {
    renderLogo(ctx, size, state, logoImg);
  }
}

function renderBackground(ctx: CanvasRenderingContext2D, size: number, state: SFState) {
  switch (state.bgType) {
    case 'gradient': {
      const preset = MESH_PRESETS.find(p => p.id === state.bgGradientPresetId) ?? MESH_PRESETS[0];
      const effects: MeshEffects = { ...DEFAULT_EFFECTS, ...preset.effects };
      renderMeshGradient(ctx, size, size, preset.nodes, preset.bgColor, effects);
      break;
    }
    case 'solid':
      ctx.fillStyle = state.bgSolidColor;
      ctx.fillRect(0, 0, size, size);
      break;
    case 'pattern':
      ctx.fillStyle = state.bgPatternBgColor;
      ctx.fillRect(0, 0, size, size);
      renderPatternOverlay(ctx, size, state.bgPatternId, state.bgPatternColor, state.bgPatternScale);
      break;
  }
}

function renderPatternOverlay(
  ctx: CanvasRenderingContext2D,
  size: number,
  patternId: SFPatternId,
  color: string,
  scale: number,
) {
  const svg = buildPatternSvg(patternId, color, scale);
  const img = new Image();
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  // Synchronous pattern rendering via offscreen canvas
  const offscreen = document.createElement('canvas');
  offscreen.width = size;
  offscreen.height = size;
  const offCtx = offscreen.getContext('2d')!;

  img.onload = () => {
    const pattern = offCtx.createPattern(img, 'repeat');
    if (pattern) {
      offCtx.fillStyle = pattern;
      offCtx.fillRect(0, 0, size, size);
      ctx.drawImage(offscreen, 0, 0);
    }
    URL.revokeObjectURL(url);
  };
  img.src = url;
}

// Pre-render pattern images for synchronous use
const patternCache = new Map<string, HTMLImageElement>();

export function preloadPattern(patternId: SFPatternId, color: string, scale: number): Promise<HTMLImageElement> {
  const key = `${patternId}-${color}-${scale}`;
  const cached = patternCache.get(key);
  if (cached) return Promise.resolve(cached);

  return new Promise((resolve) => {
    const svg = buildPatternSvg(patternId, color, scale);
    const img = new Image();
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      patternCache.set(key, img);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.src = url;
  });
}

export function renderFrameSync(
  ctx: CanvasRenderingContext2D,
  size: number,
  state: SFState,
  screenshotImg: HTMLImageElement | null,
  logoImg: HTMLImageElement | null,
  patternImg: HTMLImageElement | null,
) {
  ctx.clearRect(0, 0, size, size);

  // 1. Background
  switch (state.bgType) {
    case 'gradient': {
      const preset = MESH_PRESETS.find(p => p.id === state.bgGradientPresetId) ?? MESH_PRESETS[0];
      const effects: MeshEffects = { ...DEFAULT_EFFECTS, ...preset.effects };
      renderMeshGradient(ctx, size, size, preset.nodes, preset.bgColor, effects);
      break;
    }
    case 'solid':
      ctx.fillStyle = state.bgSolidColor;
      ctx.fillRect(0, 0, size, size);
      break;
    case 'pattern':
      ctx.fillStyle = state.bgPatternBgColor;
      ctx.fillRect(0, 0, size, size);
      if (patternImg) {
        const pattern = ctx.createPattern(patternImg, 'repeat');
        if (pattern) {
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, size, size);
        }
      }
      break;
  }

  // 2. Screenshot
  if (screenshotImg && screenshotImg.naturalWidth > 0) {
    renderScreenshot(ctx, size, state, screenshotImg);
  }

  // 3. Logo
  if (state.logoEnabled && logoImg && logoImg.naturalWidth > 0) {
    renderLogo(ctx, size, state, logoImg);
  }
}

function renderScreenshot(
  ctx: CanvasRenderingContext2D,
  size: number,
  state: SFState,
  img: HTMLImageElement,
) {
  const maxArea = size * state.screenshotScale;
  const imgAspect = img.naturalWidth / img.naturalHeight;
  let drawW: number, drawH: number;

  if (imgAspect >= 1) {
    drawW = maxArea;
    drawH = maxArea / imgAspect;
  } else {
    drawH = maxArea;
    drawW = maxArea * imgAspect;
  }

  const offsetX = (state.screenshotOffsetX / 100) * size * 0.3;
  const offsetY = (state.screenshotOffsetY / 100) * size * 0.3;
  const x = (size - drawW) / 2 + offsetX;
  const y = (size - drawH) / 2 + offsetY;
  const radius = state.screenshotBorderRadius * (size / 600);

  ctx.save();

  // Shadow
  if (state.screenshotShadow > 0) {
    const blur = (state.screenshotShadow / 100) * 60 * (size / 600);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = blur;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = blur * 0.3;

    // Draw shadow shape (rounded rect)
    ctx.beginPath();
    roundedRect(ctx, x, y, drawW, drawH, radius);
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  // Clip rounded rect and draw image
  ctx.beginPath();
  roundedRect(ctx, x, y, drawW, drawH, radius);
  ctx.clip();
  ctx.drawImage(img, x, y, drawW, drawH);

  ctx.restore();
}

function renderLogo(
  ctx: CanvasRenderingContext2D,
  size: number,
  state: SFState,
  img: HTMLImageElement,
) {
  const logoSize = size * state.logoScale;
  const aspect = img.naturalWidth / img.naturalHeight;
  const logoW = logoSize * (aspect >= 1 ? 1 : aspect);
  const logoH = logoSize * (aspect >= 1 ? 1 / aspect : 1);
  const margin = size * 0.04;

  const { x, y } = getLogoPosition(state.logoPosition, size, logoW, logoH, margin);

  ctx.save();
  ctx.globalAlpha = state.logoOpacity;
  ctx.drawImage(img, x, y, logoW, logoH);
  ctx.restore();
}

function getLogoPosition(
  position: SFLogoPosition,
  size: number,
  logoW: number,
  logoH: number,
  margin: number,
): { x: number; y: number } {
  switch (position) {
    case 'top-left':      return { x: margin, y: margin };
    case 'top-center':    return { x: (size - logoW) / 2, y: margin };
    case 'top-right':     return { x: size - logoW - margin, y: margin };
    case 'bottom-left':   return { x: margin, y: size - logoH - margin };
    case 'bottom-center': return { x: (size - logoW) / 2, y: size - logoH - margin };
    case 'bottom-right':  return { x: size - logoW - margin, y: size - logoH - margin };
  }
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  r = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function buildPatternSvg(patternId: SFPatternId, color: string, scale: number): string {
  const s = Math.round(20 * scale);
  const half = s / 2;

  switch (patternId) {
    case 'dots':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}"><circle cx="${half}" cy="${half}" r="${s * 0.15}" fill="${color}" opacity="0.3"/></svg>`;
    case 'grid':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}"><path d="M${s} 0L${s} ${s}M0 ${s}L${s} ${s}" stroke="${color}" stroke-width="0.5" opacity="0.2"/></svg>`;
    case 'diagonal':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}"><path d="M0 ${s}L${s} 0M-${half} ${half}L${half} -${half}M${half} ${s + half}L${s + half} ${half}" stroke="${color}" stroke-width="0.5" opacity="0.2"/></svg>`;
    case 'crosses': {
      const cs = s * 0.2;
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}"><path d="M${half - cs} ${half}L${half + cs} ${half}M${half} ${half - cs}L${half} ${half + cs}" stroke="${color}" stroke-width="0.5" opacity="0.25"/></svg>`;
    }
    case 'waves':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${s * 2}" height="${s}"><path d="M0 ${half}Q${half} 0 ${s} ${half}T${s * 2} ${half}" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.2"/></svg>`;
    case 'triangles': {
      const th = s * 0.866;
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${Math.round(th)}"><path d="M0 ${Math.round(th)}L${half} 0L${s} ${Math.round(th)}Z" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.2"/></svg>`;
    }
  }
}

export async function exportFrame(
  state: SFState,
  screenshotImg: HTMLImageElement | null,
  logoImg: HTMLImageElement | null,
) {
  const size = state.outputResolution;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // For export, load pattern synchronously first if needed
  let patternImg: HTMLImageElement | null = null;
  if (state.bgType === 'pattern') {
    patternImg = await preloadPattern(state.bgPatternId, state.bgPatternColor, state.bgPatternScale);
  }

  renderFrameSync(ctx, size, state, screenshotImg, logoImg, patternImg);

  const mimeType = state.outputFormat === 'jpg' ? 'image/jpeg' : 'image/png';
  const quality = state.outputFormat === 'jpg' ? 0.92 : undefined;

  return new Promise<void>((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const baseName = state.screenshotFileName.replace(/\.[^.]+$/, '') || 'frame';
          downloadBlob(blob, `${baseName}_framed.${state.outputFormat}`);
        }
        resolve();
      },
      mimeType,
      quality,
    );
  });
}
