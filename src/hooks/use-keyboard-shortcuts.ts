import { useEffect } from 'react';
import { useAppState, useAppDispatch } from '../state/app-context';
import { ALGORITHMS } from '../algorithms';
import { exportSingle } from '../utils/output';
import { processImage } from '../services/dither-engine';
import { PALETTE_PRESETS } from '../palette/presets';

export function useKeyboardShortcuts() {
  const state = useAppState();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Only handle shortcuts when Dither Lab is active
      if (state.activeTool !== 'dither') return;

      const isMod = e.metaKey || e.ctrlKey;

      // Ctrl/Cmd+Z: Undo
      if (isMod && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        dispatch({ type: 'UNDO' });
        return;
      }

      // Ctrl/Cmd+Shift+Z: Redo
      if (isMod && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        dispatch({ type: 'REDO' });
        return;
      }

      // Ctrl/Cmd+S: Download
      if (isMod && e.key === 's') {
        e.preventDefault();
        if (!state.sourceImage || !state.resultImage) return;

        let presetColors: number[][] | undefined;
        if (state.paletteMode === 'preset') {
          presetColors = PALETTE_PRESETS.find(p => p.id === state.presetId)?.colors;
        }

        const result = processImage({
          imageData: state.sourceImage,
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

        await exportSingle(
          result.imageData,
          state.fileName || 'image',
          state.exportFormat,
          state.exportScale,
          state.algorithmId,
          state.colorCount
        );
        return;
      }

      // Ignore shortcuts when focused on an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLTextAreaElement) return;

      // Space: Hold to show original in toggle mode
      if (e.key === ' ') {
        e.preventDefault();
        if (e.repeat) return; // Ignore key repeat
        if (state.comparisonMode !== 'toggle') {
          // Switch to toggle mode
          dispatch({ type: 'SET_COMPARISON_MODE', mode: 'toggle' });
        }
        dispatch({ type: 'SET_SHOW_ORIGINAL', show: true });
        return;
      }

      // 1-9: Quick-select algorithm
      const numKey = parseInt(e.key);
      if (numKey >= 1 && numKey <= 9 && numKey <= ALGORITHMS.length) {
        dispatch({ type: 'SET_ALGORITHM', algorithmId: ALGORITHMS[numKey - 1].id });
        return;
      }

      // + / =: Zoom in
      if (e.key === '+' || e.key === '=') {
        dispatch({ type: 'SET_ZOOM', zoom: Math.min(32, state.zoom * 1.5) });
        return;
      }

      // -: Zoom out
      if (e.key === '-') {
        dispatch({ type: 'SET_ZOOM', zoom: Math.max(0.1, state.zoom / 1.5) });
        return;
      }

      // 0: Fit to view
      if (e.key === '0') {
        dispatch({ type: 'SET_ZOOM', zoom: 1 });
        dispatch({ type: 'SET_PAN', x: 0, y: 0 });
        return;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Space release: stop showing original
      if (e.key === ' ') {
        dispatch({ type: 'SET_SHOW_ORIGINAL', show: false });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [state, dispatch]);
}
