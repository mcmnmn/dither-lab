import { useEffect, useRef } from 'react';
import { useGrainState, useGrainDispatch } from '../state/grain-context';
import type {
  GrainEffectId,
  AsciiSettings,
  HalftoneSettings,
  NoiseFieldSettings,
  PixelSortSettings,
  CrosshatchSettings,
  VhsSettings,
  ProcessingSettings,
  PostProcessingSettings,
  GrainExportFormat,
} from '../state/types';

const STORAGE_KEY = 'grain-lab-settings';

const VALID_EFFECTS: GrainEffectId[] = ['ascii', 'halftone', 'noise-field', 'pixel-sort', 'crosshatch', 'vhs'];
const VALID_FORMATS: GrainExportFormat[] = ['png', 'jpeg', 'gif'];

interface PersistedGrainSettings {
  activeEffect: GrainEffectId;
  ascii: AsciiSettings;
  halftone: HalftoneSettings;
  noiseField: NoiseFieldSettings;
  pixelSort: PixelSortSettings;
  crosshatch: CrosshatchSettings;
  vhs: VhsSettings;
  processing: ProcessingSettings;
  postProcessing: PostProcessingSettings;
  exportFormat: GrainExportFormat;
}

/**
 * Persists and restores grain tool settings from localStorage.
 * Only saves user-configurable settings (not transient state like sourceImage, GPU status, etc.)
 */
export function useGrainPersistence() {
  const state = useGrainState();
  const dispatch = useGrainDispatch();
  // Skip saving during the first 2 effect runs (initial render + LOAD_STATE re-render)
  // to avoid overwriting saved state with defaults
  const saveSkips = useRef(2);

  // Load on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        // No saved state — allow saving immediately on next change
        saveSkips.current = 0;
        return;
      }

      const parsed: PersistedGrainSettings = JSON.parse(saved);

      // Validate active effect
      const activeEffect = VALID_EFFECTS.includes(parsed.activeEffect)
        ? parsed.activeEffect
        : 'ascii';

      // Validate export format
      const exportFormat = VALID_FORMATS.includes(parsed.exportFormat)
        ? parsed.exportFormat
        : 'png';

      dispatch({
        type: 'GRAIN_LOAD_STATE',
        state: {
          activeEffect,
          ascii: parsed.ascii,
          halftone: parsed.halftone,
          noiseField: parsed.noiseField,
          pixelSort: parsed.pixelSort,
          crosshatch: parsed.crosshatch,
          vhs: parsed.vhs,
          processing: parsed.processing,
          postProcessing: parsed.postProcessing,
          exportFormat,
        },
      });
    } catch {
      // Ignore corrupt localStorage
      saveSkips.current = 0;
    }
  }, [dispatch]);

  // Save on change — skip initial renders to avoid overwriting saved state with defaults
  useEffect(() => {
    if (saveSkips.current > 0) {
      saveSkips.current--;
      return;
    }

    const settings: PersistedGrainSettings = {
      activeEffect: state.activeEffect,
      ascii: state.ascii,
      halftone: state.halftone,
      noiseField: state.noiseField,
      pixelSort: state.pixelSort,
      crosshatch: state.crosshatch,
      vhs: state.vhs,
      processing: state.processing,
      postProcessing: state.postProcessing,
      exportFormat: state.exportFormat,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [
    state.activeEffect,
    state.ascii,
    state.halftone,
    state.noiseField,
    state.pixelSort,
    state.crosshatch,
    state.vhs,
    state.processing,
    state.postProcessing,
    state.exportFormat,
  ]);
}
