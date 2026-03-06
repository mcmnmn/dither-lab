import { useEffect, useRef } from 'react';
import { useResourcesState, useResourcesDispatch } from '../state/context';
import { GIVEBUTTER_SEED } from '../data/seed-data';
import type { Brand, Resource } from '../state/types';

const STORAGE_KEY = 'resources-library';

function validateBrands(arr: unknown): Brand[] {
  if (!Array.isArray(arr)) return [];
  return arr.filter(
    (b): b is Brand =>
      b && typeof b === 'object' && typeof b.id === 'string' && typeof b.name === 'string',
  );
}

function validateResources(arr: unknown): Resource[] {
  if (!Array.isArray(arr)) return [];
  return arr.filter(
    (r): r is Resource =>
      r &&
      typeof r === 'object' &&
      typeof r.id === 'string' &&
      typeof r.brandId === 'string' &&
      typeof r.type === 'string' &&
      typeof r.name === 'string',
  );
}

export function useResourcesPersistence() {
  const state = useResourcesState();
  const dispatch = useResourcesDispatch();
  const saveSkips = useRef(2);

  // Load on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        // First time: seed with Givebutter kit
        dispatch({
          type: 'RS_LOAD_STATE',
          state: {
            brands: GIVEBUTTER_SEED.brands,
            resources: GIVEBUTTER_SEED.resources,
            selectedBrandId: 'givebutter-primary',
          },
        });
        saveSkips.current = 0;
        return;
      }

      const parsed = JSON.parse(saved);
      const brands = validateBrands(parsed.brands);
      const resources = validateResources(parsed.resources);
      const selectedBrandId =
        typeof parsed.selectedBrandId === 'string' && brands.some(b => b.id === parsed.selectedBrandId)
          ? parsed.selectedBrandId
          : brands[0]?.id ?? null;
      const filterType =
        typeof parsed.filterType === 'string' &&
        ['all', 'color', 'logo', 'font', 'link', 'image'].includes(parsed.filterType)
          ? parsed.filterType
          : 'all';

      dispatch({
        type: 'RS_LOAD_STATE',
        state: { brands, resources, selectedBrandId, filterType },
      });
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

    const data = {
      brands: state.brands,
      resources: state.resources,
      selectedBrandId: state.selectedBrandId,
      filterType: state.filterType,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [state.brands, state.resources, state.selectedBrandId, state.filterType]);
}
