import { useEffect, useRef } from 'react';
import { useGraphState, useGraphDispatch } from '../state/context';

const STORAGE_KEY = 'graph-maker';

export function useGraphPersistence() {
  const state = useGraphState();
  const dispatch = useGraphDispatch();
  const loadedRef = useRef(false);

  // Load on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        // Don't restore parsedData — it will be re-parsed from rawInput
        delete saved.parsedData;
        delete saved.parseError;
        dispatch({ type: 'GM_LOAD_STATE', state: saved });
      }
    } catch { /* ignore */ }
    loadedRef.current = true;
  }, [dispatch]);

  // Save on change
  useEffect(() => {
    if (!loadedRef.current) return;
    try {
      const { parsedData, parseError, ...rest } = state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
    } catch { /* ignore — localStorage full */ }
  }, [state]);
}
