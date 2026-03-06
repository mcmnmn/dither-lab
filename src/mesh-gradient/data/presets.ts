import type { MeshNode, MeshEffects } from '../state/types';

export interface MeshPreset {
  id: string;
  name: string;
  nodes: MeshNode[];
  bgColor: string;
  effects?: Partial<MeshEffects>;
}

export const MESH_PRESETS: MeshPreset[] = [
  {
    id: 'givebutter',
    name: 'Givebutter',
    nodes: [
      { id: '1', x: 0.25, y: 0.2, color: '#FFBF02' },
      { id: '2', x: 0.8, y: 0.15, color: '#F6F3EB' },
      { id: '3', x: 0.3, y: 0.75, color: '#E6AC02' },
      { id: '4', x: 0.75, y: 0.7, color: '#FFD966' },
    ],
    bgColor: '#1B1B1B',
    effects: { intensity: 75, smoothness: 75, blendMode: 'screen' },
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    nodes: [
      { id: '1', x: 0.15, y: 0.2, color: '#ff6b35' },
      { id: '2', x: 0.75, y: 0.15, color: '#f7c59f' },
      { id: '3', x: 0.5, y: 0.7, color: '#ff2e63' },
      { id: '4', x: 0.85, y: 0.65, color: '#ffc93c' },
    ],
    bgColor: '#1a1a2e',
    effects: { intensity: 75, smoothness: 75, blendMode: 'screen' },
  },
  {
    id: 'ocean-deep',
    name: 'Ocean Deep',
    nodes: [
      { id: '1', x: 0.2, y: 0.3, color: '#0077b6' },
      { id: '2', x: 0.8, y: 0.2, color: '#00b4d8' },
      { id: '3', x: 0.4, y: 0.8, color: '#023e8a' },
      { id: '4', x: 0.7, y: 0.7, color: '#90e0ef' },
    ],
    bgColor: '#03045e',
    effects: { intensity: 70, smoothness: 80, blendMode: 'screen' },
  },
  {
    id: 'northern-lights',
    name: 'Northern Lights',
    nodes: [
      { id: '1', x: 0.15, y: 0.4, color: '#2de2e6' },
      { id: '2', x: 0.5, y: 0.15, color: '#9b5de5' },
      { id: '3', x: 0.85, y: 0.5, color: '#00f5d4' },
      { id: '4', x: 0.4, y: 0.85, color: '#7209b7' },
    ],
    bgColor: '#0d0221',
    effects: { intensity: 70, smoothness: 80, blendMode: 'screen' },
  },
  {
    id: 'cotton-candy',
    name: 'Cotton Candy',
    nodes: [
      { id: '1', x: 0.25, y: 0.25, color: '#ffafcc' },
      { id: '2', x: 0.75, y: 0.3, color: '#bde0fe' },
      { id: '3', x: 0.5, y: 0.75, color: '#ffc8dd' },
      { id: '4', x: 0.2, y: 0.65, color: '#a2d2ff' },
    ],
    bgColor: '#ffffff',
    effects: { intensity: 75, smoothness: 85, blendMode: 'normal' },
  },
  {
    id: 'forest-mist',
    name: 'Forest Mist',
    nodes: [
      { id: '1', x: 0.2, y: 0.2, color: '#2d6a4f' },
      { id: '2', x: 0.7, y: 0.3, color: '#95d5b2' },
      { id: '3', x: 0.4, y: 0.8, color: '#1b4332' },
      { id: '4', x: 0.85, y: 0.7, color: '#52b788' },
    ],
    bgColor: '#0b1a0f',
    effects: { intensity: 65, smoothness: 75, blendMode: 'screen' },
  },
  {
    id: 'neon-city',
    name: 'Neon City',
    nodes: [
      { id: '1', x: 0.15, y: 0.3, color: '#ff006e' },
      { id: '2', x: 0.8, y: 0.2, color: '#3a86ff' },
      { id: '3', x: 0.5, y: 0.8, color: '#8338ec' },
      { id: '4', x: 0.85, y: 0.7, color: '#ff006e' },
    ],
    bgColor: '#10002b',
    effects: { intensity: 75, smoothness: 70, blendMode: 'screen' },
  },
  {
    id: 'lavender-dream',
    name: 'Lavender Dream',
    nodes: [
      { id: '1', x: 0.3, y: 0.2, color: '#c77dff' },
      { id: '2', x: 0.7, y: 0.35, color: '#e0aaff' },
      { id: '3', x: 0.2, y: 0.7, color: '#9d4edd' },
      { id: '4', x: 0.8, y: 0.8, color: '#7b2cbf' },
    ],
    bgColor: '#240046',
    effects: { intensity: 70, smoothness: 80, blendMode: 'screen' },
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    nodes: [
      { id: '1', x: 0.2, y: 0.15, color: '#ffba08' },
      { id: '2', x: 0.8, y: 0.25, color: '#faa307' },
      { id: '3', x: 0.5, y: 0.7, color: '#e85d04' },
      { id: '4', x: 0.15, y: 0.8, color: '#dc2f02' },
    ],
    bgColor: '#370617',
    effects: { intensity: 75, smoothness: 75, blendMode: 'screen' },
  },
  {
    id: 'arctic-frost',
    name: 'Arctic Frost',
    nodes: [
      { id: '1', x: 0.25, y: 0.2, color: '#caf0f8' },
      { id: '2', x: 0.75, y: 0.3, color: '#ade8f4' },
      { id: '3', x: 0.4, y: 0.75, color: '#48cae4' },
      { id: '4', x: 0.85, y: 0.65, color: '#0096c7' },
    ],
    bgColor: '#e8f4f8',
    effects: { intensity: 70, smoothness: 85, blendMode: 'normal' },
  },
  {
    id: 'cherry-blossom',
    name: 'Cherry Blossom',
    nodes: [
      { id: '1', x: 0.3, y: 0.25, color: '#ff758f' },
      { id: '2', x: 0.7, y: 0.2, color: '#ffccd5' },
      { id: '3', x: 0.2, y: 0.75, color: '#ff4d6d' },
      { id: '4', x: 0.8, y: 0.7, color: '#fff0f3' },
    ],
    bgColor: '#1a0005',
    effects: { intensity: 70, smoothness: 80, blendMode: 'screen' },
  },
  {
    id: 'deep-space',
    name: 'Deep Space',
    nodes: [
      { id: '1', x: 0.15, y: 0.15, color: '#240046' },
      { id: '2', x: 0.8, y: 0.3, color: '#3c096c' },
      { id: '3', x: 0.5, y: 0.8, color: '#5a189a' },
      { id: '4', x: 0.25, y: 0.6, color: '#7b2cbf' },
    ],
    bgColor: '#0a0012',
    effects: { intensity: 65, smoothness: 85, blendMode: 'screen' },
  },
  {
    id: 'tropical',
    name: 'Tropical',
    nodes: [
      { id: '1', x: 0.2, y: 0.2, color: '#06d6a0' },
      { id: '2', x: 0.75, y: 0.15, color: '#ffd166' },
      { id: '3', x: 0.5, y: 0.75, color: '#ef476f' },
      { id: '4', x: 0.85, y: 0.6, color: '#118ab2' },
    ],
    bgColor: '#073b4c',
    effects: { intensity: 75, smoothness: 75, blendMode: 'screen' },
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    nodes: [
      { id: '1', x: 0.2, y: 0.3, color: '#adb5bd' },
      { id: '2', x: 0.7, y: 0.2, color: '#dee2e6' },
      { id: '3', x: 0.5, y: 0.8, color: '#6c757d' },
      { id: '4', x: 0.8, y: 0.65, color: '#e9ecef' },
    ],
    bgColor: '#212529',
    effects: { intensity: 70, smoothness: 80, blendMode: 'screen' },
  },
  {
    id: 'fire-storm',
    name: 'Fire Storm',
    nodes: [
      { id: '1', x: 0.2, y: 0.2, color: '#d00000' },
      { id: '2', x: 0.8, y: 0.3, color: '#e85d04' },
      { id: '3', x: 0.4, y: 0.8, color: '#ffba08' },
      { id: '4', x: 0.75, y: 0.7, color: '#dc2f02' },
    ],
    bgColor: '#1a0000',
    effects: { intensity: 75, smoothness: 70, blendMode: 'screen' },
  },
  {
    id: 'mint-chocolate',
    name: 'Mint Chocolate',
    nodes: [
      { id: '1', x: 0.25, y: 0.25, color: '#80ed99' },
      { id: '2', x: 0.7, y: 0.2, color: '#57cc99' },
      { id: '3', x: 0.4, y: 0.75, color: '#38a3a5' },
      { id: '4', x: 0.8, y: 0.7, color: '#22577a' },
    ],
    bgColor: '#1a120b',
    effects: { intensity: 70, smoothness: 75, blendMode: 'screen' },
  },
  {
    id: 'peach-sorbet',
    name: 'Peach Sorbet',
    nodes: [
      { id: '1', x: 0.2, y: 0.2, color: '#ffcdb2' },
      { id: '2', x: 0.75, y: 0.3, color: '#ffb4a2' },
      { id: '3', x: 0.5, y: 0.75, color: '#e5989b' },
      { id: '4', x: 0.15, y: 0.65, color: '#b5838d' },
    ],
    bgColor: '#fff5f0',
    effects: { intensity: 70, smoothness: 80, blendMode: 'normal' },
  },
];
