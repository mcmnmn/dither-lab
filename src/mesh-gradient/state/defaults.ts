import type { MeshGradientState, MeshNode, MeshOutputResolution, MeshBlendMode } from './types';

export const DEFAULT_NODES: MeshNode[] = [
  { id: '1', x: 0.25, y: 0.2, color: '#FFBF02' },
  { id: '2', x: 0.8, y: 0.15, color: '#F6F3EB' },
  { id: '3', x: 0.3, y: 0.75, color: '#E6AC02' },
  { id: '4', x: 0.75, y: 0.7, color: '#FFD966' },
];

export const BLEND_MODE_OPTIONS: { value: MeshBlendMode; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'screen', label: 'Screen' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'soft-light', label: 'Soft Light' },
];

export const HARMONY_OPTIONS = [
  { value: 'analogous', label: 'Analogous' },
  { value: 'complementary', label: 'Complementary' },
  { value: 'split-complementary', label: 'Split Complementary' },
  { value: 'triadic', label: 'Triadic' },
  { value: 'tetradic', label: 'Tetradic' },
  { value: 'random', label: 'Random' },
];

export const meshGradientInitialState: MeshGradientState = {
  nodes: DEFAULT_NODES,
  bgColor: '#1B1B1B',
  harmonyRule: 'triadic',
  effects: { intensity: 75, smoothness: 75, blendMode: 'screen' as const },
  darkPreview: true,
  exportFormat: 'png',
  exportResolution: 2048,
  showCodePanel: false,
  history: [],
  historyIndex: -1,
  draggingNodeId: null,
};

export const EXPORT_RESOLUTIONS: { value: MeshOutputResolution; label: string }[] = [
  { value: 1024, label: '1024 x 1024' },
  { value: 2048, label: '2048 x 2048' },
  { value: 4096, label: '4096 x 4096' },
];
