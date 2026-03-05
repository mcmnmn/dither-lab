import type { GrainState, GrainAction, GrainEffectId } from './types';
import {
  DEFAULT_ASCII,
  DEFAULT_HALFTONE,
  DEFAULT_NOISE_FIELD,
  DEFAULT_PIXEL_SORT,
  DEFAULT_CROSSHATCH,
  DEFAULT_VHS,
  DEFAULT_PROCESSING,
  DEFAULT_POST_PROCESSING,
} from './defaults';

export const grainInitialState: GrainState = {
  activeEffect: 'ascii' as GrainEffectId,

  ascii: { ...DEFAULT_ASCII },
  halftone: { ...DEFAULT_HALFTONE },
  noiseField: { ...DEFAULT_NOISE_FIELD },
  pixelSort: { ...DEFAULT_PIXEL_SORT },
  crosshatch: { ...DEFAULT_CROSSHATCH },
  vhs: { ...DEFAULT_VHS },

  processing: { ...DEFAULT_PROCESSING },
  postProcessing: { ...DEFAULT_POST_PROCESSING },

  exportFormat: 'png',

  gpuReady: false,
  gpuError: null,
  renderTime: 0,
};

export function grainReducer(state: GrainState, action: GrainAction): GrainState {
  switch (action.type) {
    case 'GRAIN_SET_EFFECT':
      return { ...state, activeEffect: action.effect };

    case 'GRAIN_UPDATE_ASCII':
      return { ...state, ascii: { ...state.ascii, ...action.settings } };

    case 'GRAIN_UPDATE_HALFTONE':
      return { ...state, halftone: { ...state.halftone, ...action.settings } };

    case 'GRAIN_UPDATE_NOISE_FIELD':
      return { ...state, noiseField: { ...state.noiseField, ...action.settings } };

    case 'GRAIN_UPDATE_PIXEL_SORT':
      return { ...state, pixelSort: { ...state.pixelSort, ...action.settings } };

    case 'GRAIN_UPDATE_CROSSHATCH':
      return { ...state, crosshatch: { ...state.crosshatch, ...action.settings } };

    case 'GRAIN_UPDATE_VHS':
      return { ...state, vhs: { ...state.vhs, ...action.settings } };

    case 'GRAIN_UPDATE_PROCESSING':
      return { ...state, processing: { ...state.processing, ...action.settings } };

    case 'GRAIN_UPDATE_POST_PROCESSING':
      return { ...state, postProcessing: { ...state.postProcessing, ...action.settings } };

    case 'GRAIN_SET_EXPORT_FORMAT':
      return { ...state, exportFormat: action.format };

    case 'GRAIN_SET_GPU_READY':
      return { ...state, gpuReady: action.ready };

    case 'GRAIN_SET_GPU_ERROR':
      return { ...state, gpuError: action.error };

    case 'GRAIN_SET_RENDER_TIME':
      return { ...state, renderTime: action.time };

    case 'GRAIN_LOAD_STATE':
      return { ...state, ...action.state };

    default:
      return state;
  }
}
