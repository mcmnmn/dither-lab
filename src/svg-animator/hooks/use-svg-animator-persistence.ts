import { useEffect, useRef } from 'react';
import { useSvgAnimatorState, useSvgAnimatorDispatch } from '../state/context';
import type { AnimationPreset, EasingId, PreviewBackground, PreviewSize, StaggerMode, TransformOrigin, SlideDirection, Recipe } from '../state/types';
import { EASING_OPTIONS, PRESET_OPTIONS, PREVIEW_SIZE_OPTIONS, STAGGER_MODE_OPTIONS, TRANSFORM_ORIGIN_OPTIONS, SLIDE_DIRECTION_OPTIONS } from '../state/defaults';

const STORAGE_KEY = 'svg-animator-settings';

const VALID_PRESETS = PRESET_OPTIONS.map(p => p.value);
const VALID_EASINGS = EASING_OPTIONS.map(e => e.value);
const VALID_BGS: PreviewBackground[] = ['light', 'dark', 'checker'];
const VALID_SIZES: PreviewSize[] = PREVIEW_SIZE_OPTIONS;
const VALID_STAGGER_MODES = STAGGER_MODE_OPTIONS.map(s => s.value);
const VALID_ORIGINS: string[] = TRANSFORM_ORIGIN_OPTIONS;
const VALID_DIRECTIONS = SLIDE_DIRECTION_OPTIONS.map(d => d.value);

function validateRecipes(raw: unknown): Recipe[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((r): r is Recipe =>
    r && typeof r === 'object' &&
    typeof r.id === 'string' &&
    typeof r.name === 'string' &&
    VALID_PRESETS.includes(r.preset) &&
    typeof r.duration === 'number' &&
    VALID_EASINGS.includes(r.easing) &&
    typeof r.loop === 'boolean' &&
    typeof r.stagger === 'boolean' &&
    typeof r.staggerDelay === 'number' &&
    VALID_STAGGER_MODES.includes(r.staggerMode) &&
    typeof r.intensity === 'number' &&
    VALID_ORIGINS.includes(r.transformOrigin) &&
    !r.builtIn
  );
}

export function useSvgAnimatorPersistence() {
  const state = useSvgAnimatorState();
  const dispatch = useSvgAnimatorDispatch();
  const saveSkips = useRef(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const p = JSON.parse(saved);

      dispatch({
        type: 'SA_LOAD_STATE',
        state: {
          ...(p.preset && VALID_PRESETS.includes(p.preset) ? { preset: p.preset as AnimationPreset } : {}),
          ...(typeof p.duration === 'number' && p.duration >= 200 && p.duration <= 3000 ? { duration: p.duration } : {}),
          ...(p.easing && VALID_EASINGS.includes(p.easing) ? { easing: p.easing as EasingId } : {}),
          ...(typeof p.loop === 'boolean' ? { loop: p.loop } : {}),
          ...(typeof p.stagger === 'boolean' ? { stagger: p.stagger } : {}),
          ...(typeof p.staggerDelay === 'number' && p.staggerDelay >= 0 && p.staggerDelay <= 300 ? { staggerDelay: p.staggerDelay } : {}),
          ...(p.previewBg && VALID_BGS.includes(p.previewBg) ? { previewBg: p.previewBg as PreviewBackground } : {}),
          ...(p.previewSize && VALID_SIZES.includes(p.previewSize) ? { previewSize: p.previewSize as PreviewSize } : {}),
          // V2
          ...(p.staggerMode && VALID_STAGGER_MODES.includes(p.staggerMode) ? { staggerMode: p.staggerMode as StaggerMode } : {}),
          ...(typeof p.intensity === 'number' && p.intensity >= 1 && p.intensity <= 10 ? { intensity: p.intensity } : {}),
          ...(p.transformOrigin && VALID_ORIGINS.includes(p.transformOrigin) ? { transformOrigin: p.transformOrigin as TransformOrigin } : {}),
          ...(p.slideDirection && VALID_DIRECTIONS.includes(p.slideDirection) ? { slideDirection: p.slideDirection as SlideDirection } : {}),
          ...(p.recipes ? { recipes: validateRecipes(p.recipes) } : {}),
        },
      });
    } catch {
      // Ignore corrupt localStorage
    }
  }, [dispatch]);

  useEffect(() => {
    if (saveSkips.current < 2) {
      saveSkips.current++;
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      preset: state.preset,
      duration: state.duration,
      easing: state.easing,
      loop: state.loop,
      stagger: state.stagger,
      staggerDelay: state.staggerDelay,
      previewBg: state.previewBg,
      previewSize: state.previewSize,
      // V2
      staggerMode: state.staggerMode,
      intensity: state.intensity,
      transformOrigin: state.transformOrigin,
      slideDirection: state.slideDirection,
      recipes: state.recipes.filter(r => !r.builtIn),
    }));
  }, [
    state.preset, state.duration, state.easing, state.loop, state.stagger, state.staggerDelay,
    state.previewBg, state.previewSize,
    state.staggerMode, state.intensity, state.transformOrigin, state.slideDirection, state.recipes,
  ]);
}
