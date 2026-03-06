import type { SFState, SFAction } from './types';

export function sfReducer(state: SFState, action: SFAction): SFState {
  switch (action.type) {
    case 'SF_SET_SCREENSHOT':
      return { ...state, screenshotSrc: action.src, screenshotFileName: action.fileName };
    case 'SF_CLEAR_SCREENSHOT':
      return { ...state, screenshotSrc: null, screenshotFileName: '' };
    case 'SF_SET_SCREENSHOT_SCALE':
      return { ...state, screenshotScale: action.scale };
    case 'SF_SET_BORDER_RADIUS':
      return { ...state, screenshotBorderRadius: action.radius };
    case 'SF_SET_SHADOW':
      return { ...state, screenshotShadow: action.shadow };
    case 'SF_SET_OFFSET':
      return { ...state, screenshotOffsetX: action.x, screenshotOffsetY: action.y };
    case 'SF_SET_BG_TYPE':
      return { ...state, bgType: action.bgType };
    case 'SF_SET_BG_SOLID_COLOR':
      return { ...state, bgSolidColor: action.color };
    case 'SF_SET_BG_GRADIENT_PRESET':
      return { ...state, bgGradientPresetId: action.presetId };
    case 'SF_SET_BG_PATTERN':
      return { ...state, bgPatternId: action.patternId };
    case 'SF_SET_BG_PATTERN_COLOR':
      return { ...state, bgPatternColor: action.color };
    case 'SF_SET_BG_PATTERN_BG_COLOR':
      return { ...state, bgPatternBgColor: action.color };
    case 'SF_SET_BG_PATTERN_SCALE':
      return { ...state, bgPatternScale: action.scale };
    case 'SF_SET_LOGO':
      return { ...state, logoSrc: action.src, logoEnabled: true };
    case 'SF_CLEAR_LOGO':
      return { ...state, logoSrc: null, logoEnabled: false };
    case 'SF_TOGGLE_LOGO':
      return { ...state, logoEnabled: !state.logoEnabled };
    case 'SF_SET_LOGO_POSITION':
      return { ...state, logoPosition: action.position };
    case 'SF_SET_LOGO_SCALE':
      return { ...state, logoScale: action.scale };
    case 'SF_SET_LOGO_OPACITY':
      return { ...state, logoOpacity: action.opacity };
    case 'SF_SET_OUTPUT_FORMAT':
      return { ...state, outputFormat: action.format };
    case 'SF_SET_OUTPUT_RESOLUTION':
      return { ...state, outputResolution: action.resolution };
    case 'SF_LOAD_STATE':
      return { ...state, ...action.state };
    default:
      return state;
  }
}
