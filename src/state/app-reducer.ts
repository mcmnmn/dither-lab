import type { AppState, AppAction, SettingsSnapshot, ThemeId, ToolId } from './types';

const MAX_HISTORY = 50;

function captureSnapshot(state: AppState): SettingsSnapshot {
  return {
    algorithmId: state.algorithmId,
    paletteMode: state.paletteMode,
    presetId: state.presetId,
    manualColors: state.manualColors,
    colorCount: state.colorCount,
    strength: state.strength,
    threshold: state.threshold,
  };
}

function pushHistory(state: AppState): Pick<AppState, 'history' | 'historyIndex'> {
  const snapshot = captureSnapshot(state);
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(snapshot);
  if (newHistory.length > MAX_HISTORY) newHistory.shift();
  return { history: newHistory, historyIndex: newHistory.length - 1 };
}

export const initialState: AppState = {
  mode: 'single',
  sourceImage: null,
  sourceFile: null,
  fileName: '',
  algorithmId: 'floyd-steinberg',
  paletteMode: 'preset',
  presetId: 'bw-dither',
  manualColors: [[0, 0, 0], [255, 255, 255]],
  colorCount: 2,
  strength: 1.0,
  threshold: 128,
  customMatrix: null,
  comparisonMode: 'slider',
  showOriginal: false,
  zoom: 1,
  panX: 0,
  panY: 0,
  showPixelGrid: false,
  resultImage: null,
  processing: false,
  processingTime: 0,
  batchQueue: [],
  batchProcessing: false,
  batchProgress: 0,
  exportFormat: 'png',
  exportScale: 1,
  theme: 'butterlite' as ThemeId,
  activeTool: 'dither' as ToolId,
  history: [],
  historyIndex: -1,
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_SOURCE':
      return {
        ...state,
        sourceImage: action.imageData,
        sourceFile: action.file,
        fileName: action.fileName,
        resultImage: null,
        zoom: 1,
        panX: 0,
        panY: 0,
      };

    case 'SET_RESULT':
      return {
        ...state,
        resultImage: action.imageData,
        processing: false,
        processingTime: action.duration,
      };

    case 'SET_PROCESSING':
      return { ...state, processing: action.processing };

    case 'SET_ALGORITHM':
      return {
        ...state,
        algorithmId: action.algorithmId,
        ...pushHistory(state),
      };

    case 'SET_PALETTE_MODE':
      return {
        ...state,
        paletteMode: action.mode,
        ...pushHistory(state),
      };

    case 'SET_PRESET':
      return {
        ...state,
        presetId: action.presetId,
        ...pushHistory(state),
      };

    case 'SET_MANUAL_COLORS':
      return {
        ...state,
        manualColors: action.colors,
        ...pushHistory(state),
      };

    case 'SET_COLOR_COUNT':
      return {
        ...state,
        colorCount: action.count,
        ...pushHistory(state),
      };

    case 'SET_STRENGTH':
      return {
        ...state,
        strength: action.strength,
        ...pushHistory(state),
      };

    case 'SET_THRESHOLD':
      return {
        ...state,
        threshold: action.threshold,
        ...pushHistory(state),
      };

    case 'SET_CUSTOM_MATRIX':
      return { ...state, customMatrix: action.matrix };

    case 'SET_COMPARISON_MODE':
      return { ...state, comparisonMode: action.mode, showOriginal: false };

    case 'SET_SHOW_ORIGINAL':
      return { ...state, showOriginal: action.show };

    case 'SET_ZOOM':
      return { ...state, zoom: action.zoom };

    case 'SET_PAN':
      return { ...state, panX: action.x, panY: action.y };

    case 'TOGGLE_PIXEL_GRID':
      return { ...state, showPixelGrid: !state.showPixelGrid };

    case 'SET_MODE':
      return { ...state, mode: action.mode };

    case 'SET_EXPORT_FORMAT':
      return { ...state, exportFormat: action.format };

    case 'SET_EXPORT_SCALE':
      return { ...state, exportScale: action.scale };

    case 'SET_THEME':
      return { ...state, theme: action.theme };

    case 'SET_ACTIVE_TOOL':
      return { ...state, activeTool: action.tool };

    case 'UNDO': {
      if (state.historyIndex <= 0) return state;
      const snapshot = state.history[state.historyIndex - 1];
      return { ...state, ...snapshot, historyIndex: state.historyIndex - 1 };
    }

    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1) return state;
      const snapshot = state.history[state.historyIndex + 1];
      return { ...state, ...snapshot, historyIndex: state.historyIndex + 1 };
    }

    case 'ADD_BATCH_ITEMS':
      return { ...state, batchQueue: [...state.batchQueue, ...action.items] };

    case 'UPDATE_BATCH_ITEM':
      return {
        ...state,
        batchQueue: state.batchQueue.map(item =>
          item.id === action.id ? { ...item, ...action.updates } : item
        ),
      };

    case 'CLEAR_BATCH':
      return { ...state, batchQueue: [], batchProgress: 0 };

    case 'SET_BATCH_PROCESSING':
      return { ...state, batchProcessing: action.processing };

    case 'SET_BATCH_PROGRESS':
      return { ...state, batchProgress: action.progress };

    case 'LOAD_STATE':
      return { ...state, ...action.state };

    default:
      return state;
  }
}
