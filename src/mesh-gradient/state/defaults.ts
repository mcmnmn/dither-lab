import type { MeshGradientState, MeshNode, MeshExportResolution } from './types';

export const DEFAULT_NODES: MeshNode[] = [
  { id: '1', x: 0.2, y: 0.2, color: '#ff6b35' },
  { id: '2', x: 0.8, y: 0.25, color: '#f7c59f' },
  { id: '3', x: 0.5, y: 0.75, color: '#1a535c' },
  { id: '4', x: 0.15, y: 0.7, color: '#4ecdc4' },
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
  bgColor: '#1a1a2e',
  harmonyRule: 'random',
  effects: { blur: 40, intensity: 80, smoothness: 60 },
  noise: { amount: 0, scale: 50 },
  darkPreview: true,
  exportFormat: 'png',
  exportResolution: 2048,
  showCodePanel: false,
  history: [],
  historyIndex: -1,
  draggingNodeId: null,
};

export const EXPORT_RESOLUTIONS: { value: MeshExportResolution; label: string }[] = [
  { value: 1024, label: '1024 x 1024' },
  { value: 2048, label: '2048 x 2048' },
  { value: 4096, label: '4096 x 4096' },
];
