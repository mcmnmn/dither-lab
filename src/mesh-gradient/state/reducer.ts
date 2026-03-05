import { meshGradientInitialState, DEFAULT_NODES } from './defaults';
import { generateHarmonyColors } from '../engine/generate-harmony';
import type { MeshGradientState, MeshGradientAction, MeshSettingsSnapshot } from './types';

export { meshGradientInitialState };

const MAX_HISTORY = 50;

function takeSnapshot(state: MeshGradientState): MeshSettingsSnapshot {
  return {
    nodes: state.nodes.map(n => ({ ...n })),
    bgColor: state.bgColor,
    effects: { ...state.effects },
  };
}

function restoreSnapshot(state: MeshGradientState, snap: MeshSettingsSnapshot): MeshGradientState {
  return {
    ...state,
    nodes: snap.nodes.map(n => ({ ...n })),
    bgColor: snap.bgColor,
    effects: { ...snap.effects },
  };
}

export function meshGradientReducer(
  state: MeshGradientState,
  action: MeshGradientAction,
): MeshGradientState {
  switch (action.type) {
    case 'MG_ADD_NODE':
      return { ...state, nodes: [...state.nodes, action.node] };

    case 'MG_REMOVE_NODE':
      if (state.nodes.length <= 2) return state;
      return { ...state, nodes: state.nodes.filter(n => n.id !== action.id) };

    case 'MG_UPDATE_NODE_COLOR':
      return {
        ...state,
        nodes: state.nodes.map(n => n.id === action.id ? { ...n, color: action.color } : n),
      };

    case 'MG_UPDATE_NODE_POSITION':
      return {
        ...state,
        nodes: state.nodes.map(n =>
          n.id === action.id ? { ...n, x: action.x, y: action.y } : n,
        ),
      };

    case 'MG_SET_NODES':
      return { ...state, nodes: action.nodes };

    case 'MG_SET_BG_COLOR':
      return { ...state, bgColor: action.color };

    case 'MG_SET_HARMONY':
      return { ...state, harmonyRule: action.rule };

    case 'MG_UPDATE_EFFECTS':
      return { ...state, effects: { ...state.effects, ...action.effects } };

    case 'MG_TOGGLE_DARK_PREVIEW':
      return { ...state, darkPreview: !state.darkPreview };

    case 'MG_SET_EXPORT_FORMAT':
      return { ...state, exportFormat: action.format };

    case 'MG_SET_EXPORT_RESOLUTION':
      return { ...state, exportResolution: action.resolution };

    case 'MG_TOGGLE_CODE_PANEL':
      return { ...state, showCodePanel: !state.showCodePanel };

    case 'MG_RANDOMIZE_POSITIONS':
      return {
        ...state,
        nodes: state.nodes.map(n => ({
          ...n,
          x: 0.1 + Math.random() * 0.8,
          y: 0.1 + Math.random() * 0.8,
        })),
      };

    case 'MG_RESET_POSITIONS': {
      const defaults = DEFAULT_NODES;
      return {
        ...state,
        nodes: state.nodes.map((n, i) => ({
          ...n,
          x: defaults[i]?.x ?? 0.5,
          y: defaults[i]?.y ?? 0.5,
        })),
      };
    }

    case 'MG_DISTRIBUTE_EVENLY': {
      const count = state.nodes.length;
      const cols = Math.ceil(Math.sqrt(count));
      const rows = Math.ceil(count / cols);
      return {
        ...state,
        nodes: state.nodes.map((n, i) => ({
          ...n,
          x: ((i % cols) + 0.5) / cols,
          y: (Math.floor(i / cols) + 0.5) / rows,
        })),
      };
    }

    case 'MG_GENERATE': {
      const colors = generateHarmonyColors(state.harmonyRule, state.nodes.length);
      return {
        ...state,
        nodes: state.nodes.map((n, i) => ({
          ...n,
          color: colors[i] || n.color,
          x: 0.1 + Math.random() * 0.8,
          y: 0.1 + Math.random() * 0.8,
        })),
      };
    }

    case 'MG_PUSH_HISTORY': {
      const snap = takeSnapshot(state);
      const trimmed = state.history.slice(0, state.historyIndex + 1);
      const next = [...trimmed, snap];
      if (next.length > MAX_HISTORY) next.shift();
      return { ...state, history: next, historyIndex: next.length - 1 };
    }

    case 'MG_UNDO': {
      if (state.historyIndex <= 0) return state;
      const newIndex = state.historyIndex - 1;
      return restoreSnapshot(
        { ...state, historyIndex: newIndex },
        state.history[newIndex],
      );
    }

    case 'MG_REDO': {
      if (state.historyIndex >= state.history.length - 1) return state;
      const newIndex = state.historyIndex + 1;
      return restoreSnapshot(
        { ...state, historyIndex: newIndex },
        state.history[newIndex],
      );
    }

    case 'MG_SET_DRAGGING':
      return { ...state, draggingNodeId: action.id };

    case 'MG_LOAD_STATE':
      return { ...state, ...action.state };

    default:
      return state;
  }
}
