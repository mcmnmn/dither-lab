import { rgbToHex } from '../../utils/color';
import { colorExtractorInitialState } from './defaults';
import type { ColorExtractorState, ColorExtractorAction, ExtractedColor } from './types';

export { colorExtractorInitialState };

export function colorExtractorReducer(
  state: ColorExtractorState,
  action: ColorExtractorAction,
): ColorExtractorState {
  switch (action.type) {
    case 'CE_SET_SOURCE':
      return { ...state, sourceImage: action.imageData, fileName: action.fileName, colors: [] };

    case 'CE_SET_COLORS': {
      const locked = state.colors.filter(c => c.locked);
      const newUnlocked = action.colors.slice(0, Math.max(0, state.colorCount - locked.length));
      return { ...state, colors: [...locked, ...newUnlocked], extracting: false };
    }

    case 'CE_SET_COLOR_COUNT':
      return { ...state, colorCount: action.count };

    case 'CE_SET_HOVERED_COLOR':
      return { ...state, hoveredColor: action.rgb, hoveredPosition: action.position };

    case 'CE_ADD_PICKED_COLOR': {
      const hex = rgbToHex(action.rgb[0], action.rgb[1], action.rgb[2]);
      const newColor: ExtractedColor = { rgb: action.rgb, hex, locked: true, imagePosition: action.imagePosition };
      return { ...state, colors: [...state.colors, newColor] };
    }

    case 'CE_UPDATE_COLOR': {
      const hex = rgbToHex(action.rgb[0], action.rgb[1], action.rgb[2]);
      return {
        ...state,
        colors: state.colors.map((c, i) =>
          i === action.index ? { ...c, rgb: action.rgb, hex, imagePosition: action.imagePosition } : c,
        ),
      };
    }

    case 'CE_REMOVE_COLOR':
      return { ...state, colors: state.colors.filter((_, i) => i !== action.index) };

    case 'CE_TOGGLE_LOCK':
      return {
        ...state,
        colors: state.colors.map((c, i) => i === action.index ? { ...c, locked: !c.locked } : c),
      };

    case 'CE_SET_EXPORT_FORMAT':
      return { ...state, exportFormat: action.format };

    case 'CE_SET_EXTRACTING':
      return { ...state, extracting: action.extracting };

    case 'CE_LOAD_STATE':
      return { ...state, ...action.state };

    default:
      return state;
  }
}
