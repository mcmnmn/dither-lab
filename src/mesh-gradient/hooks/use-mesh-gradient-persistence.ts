import { useEffect, useRef } from 'react';
import { useMeshGradientState, useMeshGradientDispatch } from '../state/context';
import { meshGradientInitialState } from '../state/defaults';
import type { HarmonyRule, MeshExportFormat, MeshExportResolution } from '../state/types';

const STORAGE_KEY = 'mesh-gradient-settings';

const VALID_HARMONIES: HarmonyRule[] = ['analogous', 'complementary', 'split-complementary', 'triadic', 'tetradic', 'random'];
const VALID_FORMATS: MeshExportFormat[] = ['png', 'jpg', 'svg', 'css'];
const VALID_RESOLUTIONS: MeshExportResolution[] = [1024, 2048, 4096];

export function useMeshGradientPersistence() {
  const state = useMeshGradientState();
  const dispatch = useMeshGradientDispatch();
  const saveSkips = useRef(0);

  // Load on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved);

      dispatch({
        type: 'MG_LOAD_STATE',
        state: {
          ...(parsed.bgColor ? { bgColor: parsed.bgColor } : {}),
          ...(parsed.harmonyRule && VALID_HARMONIES.includes(parsed.harmonyRule)
            ? { harmonyRule: parsed.harmonyRule }
            : {}),
          ...(parsed.effects ? { effects: { ...meshGradientInitialState.effects, ...parsed.effects } } : {}),
          ...(typeof parsed.darkPreview === 'boolean' ? { darkPreview: parsed.darkPreview } : {}),
          ...(parsed.exportFormat && VALID_FORMATS.includes(parsed.exportFormat)
            ? { exportFormat: parsed.exportFormat }
            : {}),
          ...(parsed.exportResolution && VALID_RESOLUTIONS.includes(parsed.exportResolution)
            ? { exportResolution: parsed.exportResolution }
            : {}),
        },
      });
    } catch {
      // Ignore corrupt localStorage
    }
  }, [dispatch]);

  // Save on change (skip first 2 renders to avoid overwriting with defaults)
  useEffect(() => {
    if (saveSkips.current < 2) {
      saveSkips.current++;
      return;
    }
    const settings = {
      bgColor: state.bgColor,
      harmonyRule: state.harmonyRule,
      effects: state.effects,
      darkPreview: state.darkPreview,
      exportFormat: state.exportFormat,
      exportResolution: state.exportResolution,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [state.bgColor, state.harmonyRule, state.effects, state.darkPreview, state.exportFormat, state.exportResolution]);
}
