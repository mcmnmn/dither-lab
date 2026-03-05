import { useEffect, useRef, useCallback } from 'react';
import { useAppState, useAppDispatch } from '../state/app-context';
import { processImage } from '../services/dither-engine';
import { PALETTE_PRESETS } from '../palette/presets';
import { downscaleImageData } from '../utils/image-io';
import { cropImageData } from '../utils/crop';

const PREVIEW_MAX_DIM = 1024;
const DEBOUNCE_MS = 100;

/**
 * Runs the dither engine whenever settings or source image change.
 * Uses a downscaled preview for responsiveness.
 */
export function useDither() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const runDither = useCallback(() => {
    if (!state.sourceImage) return;

    dispatch({ type: 'SET_PROCESSING', processing: true });

    // Crop then downscale for preview
    const cropped = cropImageData(state.sourceImage, state.cropAspectRatio);
    const previewData = downscaleImageData(cropped, PREVIEW_MAX_DIM);

    // Resolve preset colors
    let presetColors: number[][] | undefined;
    if (state.paletteMode === 'preset') {
      const preset = PALETTE_PRESETS.find(p => p.id === state.presetId);
      presetColors = preset?.colors;
    }

    try {
      const result = processImage({
        imageData: previewData,
        settings: {
          algorithmId: state.algorithmId,
          paletteMode: state.paletteMode,
          presetColors,
          manualColors: state.manualColors,
          colorCount: state.colorCount,
          strength: state.strength,
          threshold: state.threshold,
          customMatrix: state.customMatrix ?? undefined,
        },
      });

      dispatch({ type: 'SET_RESULT', imageData: result.imageData, duration: result.duration });
    } catch {
      dispatch({ type: 'SET_PROCESSING', processing: false });
    }
  }, [
    state.sourceImage,
    state.cropAspectRatio,
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
    if (!state.sourceImage) return;

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(runDither, DEBOUNCE_MS);

    return () => clearTimeout(timerRef.current);
  }, [runDither, state.sourceImage]);

  return { runDither };
}
