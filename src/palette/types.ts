export interface PalettePreset {
  id: string;
  name: string;
  colors: number[][];
}

export type PaletteMode = 'auto' | 'manual' | 'preset';
