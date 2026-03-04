import { useEffect, useRef, useCallback } from 'react';
import { useAppState, useAppDispatch } from '../state/app-context';
import { processImage } from '../services/dither-engine';
import { PALETTE_PRESETS } from '../palette/presets';
import { loadImageFile, downscaleImageData } from '../utils/image-io';

const PREVIEW_MAX_DIM = 512;
const DEBOUNCE_MS = 200;

/**
 * Converts ImageData to a data URL for display in an <img> tag.
 */
function imageDataToDataUrl(imageData: ImageData): string {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d')!;
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

/**
 * Generates live dithered previews for all batch items whenever
 * dither settings change. Mirrors the pattern from use-dither.ts.
 */
export function useBatchPreview() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // Cache loaded+downscaled ImageData per item id to avoid reloading files
  const imageCache = useRef<Map<string, ImageData>>(new Map());

  // Clean up cache entries for items no longer in the queue
  useEffect(() => {
    const currentIds = new Set(state.batchQueue.map(i => i.id));
    for (const id of imageCache.current.keys()) {
      if (!currentIds.has(id)) {
        imageCache.current.delete(id);
      }
    }
  }, [state.batchQueue]);

  const generatePreviews = useCallback(async () => {
    if (state.batchQueue.length === 0) return;

    // Resolve preset colors
    let presetColors: number[][] | undefined;
    if (state.paletteMode === 'preset') {
      const preset = PALETTE_PRESETS.find(p => p.id === state.presetId);
      presetColors = preset?.colors;
    }

    const settings = {
      algorithmId: state.algorithmId,
      paletteMode: state.paletteMode,
      presetColors,
      manualColors: state.manualColors,
      colorCount: state.colorCount,
      strength: state.strength,
      threshold: state.threshold,
      customMatrix: state.customMatrix ?? undefined,
    };

    // Process each item sequentially to avoid blocking the UI
    for (const item of state.batchQueue) {
      try {
        // Load and cache the downscaled image data
        let imageData = imageCache.current.get(item.id);
        if (!imageData) {
          const fullData = await loadImageFile(item.file);
          imageData = downscaleImageData(fullData, PREVIEW_MAX_DIM);
          imageCache.current.set(item.id, imageData);
        }

        // Run dither engine (synchronous, fast on downscaled data)
        const result = processImage({ imageData, settings });

        // Convert to data URL and update state
        const previewUrl = imageDataToDataUrl(result.imageData);
        dispatch({
          type: 'UPDATE_BATCH_ITEM',
          id: item.id,
          updates: { previewUrl },
        });
      } catch {
        // Silently skip failed previews
      }
    }
  }, [
    state.batchQueue,
    state.algorithmId,
    state.paletteMode,
    state.presetId,
    state.manualColors,
    state.colorCount,
    state.strength,
    state.threshold,
    state.customMatrix,
    dispatch,
  ]);

  useEffect(() => {
    if (state.batchQueue.length === 0) return;

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(generatePreviews, DEBOUNCE_MS);

    return () => clearTimeout(timerRef.current);
  }, [generatePreviews]);
}
