import type { SvgAnimatorState, SvgAnimatorAction } from './types';
import { svgAnimatorInitialState } from './defaults';

export { svgAnimatorInitialState };

export function svgAnimatorReducer(state: SvgAnimatorState, action: SvgAnimatorAction): SvgAnimatorState {
  switch (action.type) {
    case 'SA_SET_SVG_SOURCE':
      return { ...state, svgSource: action.source, parsedSvg: null, parseError: null, elementOverrides: {}, selectedElementIndex: null };
    case 'SA_SET_PARSED_SVG':
      return { ...state, parsedSvg: action.parsed, parseError: action.error };
    case 'SA_SET_PRESET':
      return { ...state, preset: action.preset };
    case 'SA_SET_DURATION':
      return { ...state, duration: action.duration };
    case 'SA_SET_EASING':
      return { ...state, easing: action.easing };
    case 'SA_TOGGLE_LOOP':
      return { ...state, loop: !state.loop };
    case 'SA_TOGGLE_STAGGER':
      return { ...state, stagger: !state.stagger };
    case 'SA_SET_STAGGER_DELAY':
      return { ...state, staggerDelay: action.delay };
    case 'SA_TOGGLE_PLAYING':
      return { ...state, playing: !state.playing };
    case 'SA_SET_PLAYING':
      return { ...state, playing: action.playing };
    case 'SA_SET_PREVIEW_BG':
      return { ...state, previewBg: action.bg };
    case 'SA_SET_PREVIEW_SIZE':
      return { ...state, previewSize: action.size };
    case 'SA_TOGGLE_EXPORT_MODAL':
      return { ...state, showExportModal: !state.showExportModal };
    case 'SA_LOAD_STATE':
      return { ...state, ...action.state };

    // V2
    case 'SA_SET_STAGGER_MODE':
      return { ...state, staggerMode: action.mode };
    case 'SA_SET_INTENSITY':
      return { ...state, intensity: action.intensity };
    case 'SA_SET_TRANSFORM_ORIGIN':
      return { ...state, transformOrigin: action.origin };
    case 'SA_SET_SLIDE_DIRECTION':
      return { ...state, slideDirection: action.direction };
    case 'SA_SET_ELEMENT_OVERRIDE': {
      const existing = state.elementOverrides[action.index] ?? {};
      return {
        ...state,
        elementOverrides: {
          ...state.elementOverrides,
          [action.index]: { ...existing, ...action.config },
        },
      };
    }
    case 'SA_CLEAR_ELEMENT_OVERRIDE': {
      const next = { ...state.elementOverrides };
      delete next[action.index];
      return { ...state, elementOverrides: next };
    }
    case 'SA_SET_SELECTED_ELEMENT':
      return { ...state, selectedElementIndex: action.index };
    case 'SA_REORDER_ELEMENTS': {
      if (!state.parsedSvg) return state;
      const elements = [...state.parsedSvg.elements];
      const [moved] = elements.splice(action.fromIndex, 1);
      elements.splice(action.toIndex, 0, moved);
      // Re-index
      const reindexed = elements.map((el, i) => ({ ...el, index: i }));
      return {
        ...state,
        parsedSvg: { ...state.parsedSvg, elements: reindexed },
      };
    }
    case 'SA_RENAME_ELEMENT': {
      if (!state.parsedSvg) return state;
      const elements = state.parsedSvg.elements.map((el, i) =>
        i === action.index ? { ...el, name: action.name } : el
      );
      return { ...state, parsedSvg: { ...state.parsedSvg, elements } };
    }
    case 'SA_TOGGLE_ELEMENT_VISIBILITY': {
      if (!state.parsedSvg) return state;
      const elements = state.parsedSvg.elements.map((el, i) =>
        i === action.index ? { ...el, visible: !el.visible } : el
      );
      return { ...state, parsedSvg: { ...state.parsedSvg, elements } };
    }
    case 'SA_TOGGLE_GRID_OVERLAY':
      return { ...state, showGridOverlay: !state.showGridOverlay };
    case 'SA_SET_TIMELINE_POSITION':
      return { ...state, timelinePosition: action.position };
    case 'SA_SAVE_RECIPE':
      return { ...state, recipes: [...state.recipes, action.recipe] };
    case 'SA_DELETE_RECIPE':
      return { ...state, recipes: state.recipes.filter(r => r.id !== action.id) };
    case 'SA_APPLY_RECIPE': {
      const r = action.recipe;
      return {
        ...state,
        preset: r.preset,
        duration: r.duration,
        easing: r.easing,
        loop: r.loop,
        stagger: r.stagger,
        staggerDelay: r.staggerDelay,
        staggerMode: r.staggerMode,
        intensity: r.intensity,
        transformOrigin: r.transformOrigin,
        slideDirection: r.slideDirection ?? state.slideDirection,
      };
    }
    case 'SA_TOGGLE_RECIPE_MODAL':
      return { ...state, showRecipeModal: !state.showRecipeModal };
    case 'SA_RESTART_ANIMATION':
      return { ...state, playing: true, animationGeneration: state.animationGeneration + 1 };
    default:
      return state;
  }
}
