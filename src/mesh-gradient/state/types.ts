export type HarmonyRule = 'analogous' | 'complementary' | 'split-complementary' | 'triadic' | 'tetradic' | 'random';
export type MeshExportFormat = 'png' | 'jpg' | 'svg' | 'css';
export type MeshExportResolution = 1024 | 2048 | 4096;

export interface MeshNode {
  id: string;
  x: number;
  y: number;
  color: string;
}

export interface MeshEffects {
  blur: number;
  intensity: number;
  smoothness: number;
}

export interface MeshNoise {
  amount: number;
  scale: number;
}

export interface MeshSettingsSnapshot {
  nodes: MeshNode[];
  bgColor: string;
  effects: MeshEffects;
  noise: MeshNoise;
}

export interface MeshGradientState {
  nodes: MeshNode[];
  bgColor: string;
  harmonyRule: HarmonyRule;
  effects: MeshEffects;
  noise: MeshNoise;
  darkPreview: boolean;
  exportFormat: MeshExportFormat;
  exportResolution: MeshExportResolution;
  showCodePanel: boolean;
  history: MeshSettingsSnapshot[];
  historyIndex: number;
  draggingNodeId: string | null;
}

export type MeshGradientAction =
  | { type: 'MG_ADD_NODE'; node: MeshNode }
  | { type: 'MG_REMOVE_NODE'; id: string }
  | { type: 'MG_UPDATE_NODE_COLOR'; id: string; color: string }
  | { type: 'MG_UPDATE_NODE_POSITION'; id: string; x: number; y: number }
  | { type: 'MG_SET_NODES'; nodes: MeshNode[] }
  | { type: 'MG_SET_BG_COLOR'; color: string }
  | { type: 'MG_SET_HARMONY'; rule: HarmonyRule }
  | { type: 'MG_UPDATE_EFFECTS'; effects: Partial<MeshEffects> }
  | { type: 'MG_UPDATE_NOISE'; noise: Partial<MeshNoise> }
  | { type: 'MG_TOGGLE_DARK_PREVIEW' }
  | { type: 'MG_SET_EXPORT_FORMAT'; format: MeshExportFormat }
  | { type: 'MG_SET_EXPORT_RESOLUTION'; resolution: MeshExportResolution }
  | { type: 'MG_TOGGLE_CODE_PANEL' }
  | { type: 'MG_RANDOMIZE_POSITIONS' }
  | { type: 'MG_RESET_POSITIONS' }
  | { type: 'MG_DISTRIBUTE_EVENLY' }
  | { type: 'MG_GENERATE' }
  | { type: 'MG_UNDO' }
  | { type: 'MG_REDO' }
  | { type: 'MG_PUSH_HISTORY' }
  | { type: 'MG_SET_DRAGGING'; id: string | null }
  | { type: 'MG_LOAD_STATE'; state: Partial<MeshGradientState> };
