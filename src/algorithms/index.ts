import type { AlgorithmDefinition, DitherSettings } from './types';
import { applyErrorDiffusion } from './error-diffusion/common';
import { floydSteinberg } from './error-diffusion/floyd-steinberg';
import { atkinson } from './error-diffusion/atkinson';
import { stucki } from './error-diffusion/stucki';
import { burkes } from './error-diffusion/burkes';
import { sierraFull, sierraTwoRow, sierraLite } from './error-diffusion/sierra';
import { jarvisJudiceNinke } from './error-diffusion/jarvis-judice-ninke';
import { applyOrderedDither } from './ordered/ordered-dither';
import { BAYER_2x2, BAYER_4x4, BAYER_8x8 } from './ordered/bayer';
import { applyThreshold } from './threshold';
import { applyRandomDither } from './random';

export const ALGORITHMS: AlgorithmDefinition[] = [
  // Error Diffusion
  { id: 'floyd-steinberg', name: 'Floyd-Steinberg', category: 'error-diffusion', description: 'Classic, balanced' },
  { id: 'atkinson', name: 'Atkinson', category: 'error-diffusion', description: 'High contrast, retro Mac feel' },
  { id: 'stucki', name: 'Stucki', category: 'error-diffusion', description: 'Smooth gradients' },
  { id: 'burkes', name: 'Burkes', category: 'error-diffusion', description: 'Fast Floyd-Steinberg variant' },
  { id: 'sierra-full', name: 'Sierra (Full)', category: 'error-diffusion', description: 'Smooth, similar to Stucki' },
  { id: 'sierra-two-row', name: 'Sierra Two-Row', category: 'error-diffusion', description: 'Faster Sierra variant' },
  { id: 'sierra-lite', name: 'Sierra Lite', category: 'error-diffusion', description: 'Lightest Sierra' },
  { id: 'jarvis-judice-ninke', name: 'Jarvis-Judice-Ninke', category: 'error-diffusion', description: 'Smoothest error diffusion' },

  // Ordered
  { id: 'bayer-2x2', name: 'Bayer 2x2', category: 'ordered', description: 'Coarse crosshatch' },
  { id: 'bayer-4x4', name: 'Bayer 4x4', category: 'ordered', description: 'Classic ordered dither' },
  { id: 'bayer-8x8', name: 'Bayer 8x8', category: 'ordered', description: 'Fine ordered dither' },

  // Other
  { id: 'threshold', name: 'Threshold', category: 'other', description: 'Simple cutoff' },
  { id: 'random', name: 'Random / Noise', category: 'other', description: 'Film grain effect' },
];

const ERROR_DIFFUSION_KERNELS = {
  'floyd-steinberg': floydSteinberg,
  'atkinson': atkinson,
  'stucki': stucki,
  'burkes': burkes,
  'sierra-full': sierraFull,
  'sierra-two-row': sierraTwoRow,
  'sierra-lite': sierraLite,
  'jarvis-judice-ninke': jarvisJudiceNinke,
} as const;

const ORDERED_MATRICES = {
  'bayer-2x2': { matrix: BAYER_2x2, size: 2 },
  'bayer-4x4': { matrix: BAYER_4x4, size: 4 },
  'bayer-8x8': { matrix: BAYER_8x8, size: 8 },
} as const;

export function dither(imageData: ImageData, settings: DitherSettings): ImageData {
  const { algorithmId, palette, strength, threshold } = settings;

  if (algorithmId in ERROR_DIFFUSION_KERNELS) {
    const kernel = ERROR_DIFFUSION_KERNELS[algorithmId as keyof typeof ERROR_DIFFUSION_KERNELS];
    return applyErrorDiffusion(imageData, palette, kernel, strength);
  }

  if (algorithmId in ORDERED_MATRICES) {
    const { matrix, size } = ORDERED_MATRICES[algorithmId as keyof typeof ORDERED_MATRICES];
    return applyOrderedDither(imageData, palette, matrix, size);
  }

  if (algorithmId === 'threshold') {
    return applyThreshold(imageData, palette, threshold);
  }

  if (algorithmId === 'random') {
    return applyRandomDither(imageData, palette, strength);
  }

  // Custom matrix
  if (settings.customMatrix) {
    const { weights, size } = settings.customMatrix;
    return applyOrderedDither(imageData, palette, weights, size);
  }

  // Fallback to Floyd-Steinberg
  return applyErrorDiffusion(imageData, palette, floydSteinberg, strength);
}

export function getAlgorithmsByCategory() {
  const groups: Record<string, AlgorithmDefinition[]> = {
    'Error Diffusion': [],
    'Ordered': [],
    'Other': [],
  };

  for (const alg of ALGORITHMS) {
    if (alg.category === 'error-diffusion') groups['Error Diffusion'].push(alg);
    else if (alg.category === 'ordered') groups['Ordered'].push(alg);
    else groups['Other'].push(alg);
  }

  return groups;
}
