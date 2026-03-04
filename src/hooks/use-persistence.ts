import { useEffect } from 'react';
import { useAppState, useAppDispatch } from '../state/app-context';
import type { ThemeId, ToolId } from '../state/types';

const STORAGE_KEY = 'dither-lab-settings';

const VALID_THEMES: ThemeId[] = ['butterlite', 'noir', 'vt320', 'cassette'];
const VALID_TOOLS: ToolId[] = ['dither', 'grain', 'gradient'];

interface PersistedSettings {
  algorithmId: string;
  paletteMode: string;
  presetId: string;
  manualColors: number[][];
  colorCount: number;
  strength: number;
  threshold: number;
  exportFormat: string;
  exportScale: number;
  theme?: string;
  activeTool?: string;
  darkMode?: boolean; // legacy migration
}

/**
 * Persists and restores user settings from localStorage.
 */
export function usePersistence() {
  const state = useAppState();
  const dispatch = useAppDispatch();

  // Load on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: PersistedSettings = JSON.parse(saved);

        // Migrate from legacy darkMode / old theme names
        let theme: ThemeId = 'butterlite';
        if (parsed.theme === 'default' || parsed.theme === 'dark') {
          theme = 'noir';
        } else if (parsed.theme && VALID_THEMES.includes(parsed.theme as ThemeId)) {
          theme = parsed.theme as ThemeId;
        }

        // Validate activeTool
        let activeTool: ToolId = 'dither';
        if (parsed.activeTool && VALID_TOOLS.includes(parsed.activeTool as ToolId)) {
          activeTool = parsed.activeTool as ToolId;
        }

        dispatch({
          type: 'LOAD_STATE',
          state: {
            algorithmId: parsed.algorithmId,
            paletteMode: parsed.paletteMode as 'auto' | 'preset' | 'manual',
            presetId: parsed.presetId,
            manualColors: parsed.manualColors,
            colorCount: parsed.colorCount,
            strength: parsed.strength,
            threshold: parsed.threshold,
            exportFormat: parsed.exportFormat as 'png' | 'jpg' | 'gif' | 'webp',
            exportScale: parsed.exportScale,
            theme,
            activeTool,
          },
        });
      }
    } catch {
      // Ignore corrupt localStorage
    }
  }, [dispatch]);

  // Save on change
  useEffect(() => {
    const settings: PersistedSettings = {
      algorithmId: state.algorithmId,
      paletteMode: state.paletteMode,
      presetId: state.presetId,
      manualColors: state.manualColors,
      colorCount: state.colorCount,
      strength: state.strength,
      threshold: state.threshold,
      exportFormat: state.exportFormat,
      exportScale: state.exportScale,
      theme: state.theme,
      activeTool: state.activeTool,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [
    state.algorithmId,
    state.paletteMode,
    state.presetId,
    state.manualColors,
    state.colorCount,
    state.strength,
    state.threshold,
    state.exportFormat,
    state.exportScale,
    state.theme,
    state.activeTool,
  ]);
}
