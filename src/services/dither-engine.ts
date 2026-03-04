import { dither } from '../algorithms';
import type { DitherSettings, DitherResult } from '../algorithms/types';
import { medianCut } from '../palette/median-cut';

export interface EngineInput {
  imageData: ImageData;
  settings: Omit<DitherSettings, 'palette'> & {
    paletteMode: 'auto' | 'preset' | 'manual';
    presetColors?: number[][];
    manualColors?: number[][];
  };
}

/**
 * Orchestrates the dithering pipeline:
 * 1. Resolve palette (auto-quantize, preset, or manual)
 * 2. Apply the selected dithering algorithm
 * 3. Return the result with timing info
 */
export function processImage(input: EngineInput): DitherResult {
  const start = performance.now();
  const { imageData, settings } = input;

  // Resolve palette
  let palette: number[][];
  if (settings.paletteMode === 'auto') {
    palette = medianCut(imageData, settings.colorCount);
  } else if (settings.paletteMode === 'preset' && settings.presetColors) {
    palette = settings.presetColors;
  } else if (settings.paletteMode === 'manual' && settings.manualColors) {
    palette = settings.manualColors;
  } else {
    palette = [[0, 0, 0], [255, 255, 255]];
  }

  const ditherSettings: DitherSettings = {
    algorithmId: settings.algorithmId,
    palette,
    colorCount: settings.colorCount,
    strength: settings.strength,
    threshold: settings.threshold,
    customMatrix: settings.customMatrix,
  };

  const result = dither(imageData, ditherSettings);
  const duration = performance.now() - start;

  return { imageData: result, duration };
}
