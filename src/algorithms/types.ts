export interface ErrorDiffusionKernel {
  name: string;
  offset: [number, number]; // [dx, dy] offsets for each weight
  weights: { dx: number; dy: number; weight: number }[];
  divisor: number;
}

export interface OrderedMatrix {
  name: string;
  size: number;
  matrix: number[];
}

export interface CustomMatrix {
  id: string;
  name: string;
  size: number;
  weights: number[];
  createdAt: number;
}

export type AlgorithmCategory = 'error-diffusion' | 'ordered' | 'other';

export interface AlgorithmDefinition {
  id: string;
  name: string;
  category: AlgorithmCategory;
  description: string;
}

export interface DitherSettings {
  algorithmId: string;
  palette: number[][];    // Array of [r, g, b] colors
  colorCount: number;
  strength: number;       // 0-1, for error diffusion strength
  threshold: number;      // 0-255, for threshold algorithm
  customMatrix?: CustomMatrix;
}

export interface DitherResult {
  imageData: ImageData;
  duration: number;
}
