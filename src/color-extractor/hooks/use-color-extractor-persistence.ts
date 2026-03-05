import { useEffect, useRef } from 'react';
import { useColorExtractorState, useColorExtractorDispatch } from '../state/context';
import type { PaletteExportFormat } from '../state/types';
import { DEFAULT_COLOR_COUNT } from '../state/defaults';

const STORAGE_KEY = 'color-extractor-settings';
const VALID_FORMATS: PaletteExportFormat[] = ['css', 'json', 'hex', 'tailwind'];

interface PersistedSettings {
  colorCount: number;
  exportFormat: PaletteExportFormat;
}

export function useColorExtractorPersistence() {
  const state = useColorExtractorState();
  const dispatch = useColorExtractorDispatch();
  const saveSkips = useRef(2);

  // Load on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        saveSkips.current = 0;
        return;
      }

      const parsed: PersistedSettings = JSON.parse(saved);
      const colorCount = typeof parsed.colorCount === 'number' && parsed.colorCount >= 2 && parsed.colorCount <= 12
        ? parsed.colorCount
        : DEFAULT_COLOR_COUNT;
      const exportFormat = VALID_FORMATS.includes(parsed.exportFormat) ? parsed.exportFormat : 'hex';

      dispatch({ type: 'CE_LOAD_STATE', state: { colorCount, exportFormat } });
    } catch {
      saveSkips.current = 0;
    }
  }, [dispatch]);

  // Save on change
  useEffect(() => {
    if (saveSkips.current > 0) {
      saveSkips.current--;
      return;
    }

    const settings: PersistedSettings = {
      colorCount: state.colorCount,
      exportFormat: state.exportFormat,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [state.colorCount, state.exportFormat]);
}
