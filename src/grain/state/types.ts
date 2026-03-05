// ── Effect IDs ──────────────────────────────────────────────
export type GrainEffectId = 'ascii' | 'halftone' | 'noise-field' | 'pixel-sort' | 'crosshatch' | 'vhs';
export type GrainExportFormat = 'png' | 'jpeg' | 'gif';

// ── Per-Effect Settings ─────────────────────────────────────
export type AsciiCharSet = 'standard' | 'blocks' | 'binary' | 'detailed' | 'minimal' | 'alphabetic' | 'numeric' | 'math' | 'symbols';

export interface AsciiSettings {
  // ASCII
  scale: number;
  spacing: number;
  outputWidth: number;
  charSet: AsciiCharSet;
  // Adjustments
  brightness: number;
  contrast: number;
  saturation: number;
  hueRotation: number;
  sharpness: number;
  gamma: number;
  // Color
  colorMode: 'original' | 'mono';
  fgColor: string;
  bgColor: string;
  intensity: number;
}

export interface HalftoneSettings {
  shape: 'circle' | 'diamond' | 'square';
  dotScale: number;
  spacing: number;
  angle: number;
  invert: boolean;
  brightness: number;
  contrast: number;
  colorMode: 'original' | 'mono';
}

export interface NoiseFieldSettings {
  noiseType: 'perlin' | 'simplex';
  scale: number;
  intensity: number;
  octaves: number;
  speed: number;
  animate: boolean;
  distortOnly: boolean;
  brightness: number;
  contrast: number;
}

export interface PixelSortSettings {
  direction: 'horizontal' | 'vertical';
  threshold: number;
  sortBy: 'brightness' | 'hue' | 'saturation';
  randomness: number;
  brightness: number;
  contrast: number;
}

export interface CrosshatchSettings {
  lineWidth: number;
  spacing: number;
  angle: number;
  layers: number;
  brightness: number;
  contrast: number;
  colorMode: 'original' | 'mono';
}

export interface VhsSettings {
  tracking: number;
  noise: number;
  colorBleed: number;
  distortion: number;
  brightness: number;
  contrast: number;
}

// ── Shared Processing ───────────────────────────────────────
export interface ProcessingSettings {
  invert: boolean;
  brightnessMap: number;
  edgeEnhance: number;
  blur: number;
  quantizeColors: number;
}

export interface BloomSettings {
  enabled: boolean;
  threshold: number;
  intensity: number;
  radius: number;
}

export interface GrainNoiseSettings {
  enabled: boolean;
  intensity: number;
  size: number;
  speed: number;
}

export interface ChromaticSettings {
  enabled: boolean;
  offset: number;
}

export interface ScanlineSettings {
  enabled: boolean;
  opacity: number;
  spacing: number;
}

export interface VignetteSettings {
  enabled: boolean;
  intensity: number;
  radius: number;
}

export interface PostProcessingSettings {
  bloom: BloomSettings;
  grain: GrainNoiseSettings;
  chromatic: ChromaticSettings;
  scanlines: ScanlineSettings;
  vignette: VignetteSettings;
  crtCurve: boolean;
}

// ── Main State ──────────────────────────────────────────────
export interface GrainState {
  // Active effect
  activeEffect: GrainEffectId;

  // Per-effect settings
  ascii: AsciiSettings;
  halftone: HalftoneSettings;
  noiseField: NoiseFieldSettings;
  pixelSort: PixelSortSettings;
  crosshatch: CrosshatchSettings;
  vhs: VhsSettings;

  // Shared processing
  processing: ProcessingSettings;
  postProcessing: PostProcessingSettings;

  // Export
  exportFormat: GrainExportFormat;

  // GPU state
  gpuReady: boolean;
  gpuError: string | null;
  renderTime: number;
}

// ── Actions ─────────────────────────────────────────────────
export type GrainAction =
  | { type: 'GRAIN_SET_EFFECT'; effect: GrainEffectId }
  | { type: 'GRAIN_UPDATE_ASCII'; settings: Partial<AsciiSettings> }
  | { type: 'GRAIN_UPDATE_HALFTONE'; settings: Partial<HalftoneSettings> }
  | { type: 'GRAIN_UPDATE_NOISE_FIELD'; settings: Partial<NoiseFieldSettings> }
  | { type: 'GRAIN_UPDATE_PIXEL_SORT'; settings: Partial<PixelSortSettings> }
  | { type: 'GRAIN_UPDATE_CROSSHATCH'; settings: Partial<CrosshatchSettings> }
  | { type: 'GRAIN_UPDATE_VHS'; settings: Partial<VhsSettings> }
  | { type: 'GRAIN_UPDATE_PROCESSING'; settings: Partial<ProcessingSettings> }
  | { type: 'GRAIN_UPDATE_POST_PROCESSING'; settings: Partial<PostProcessingSettings> }
  | { type: 'GRAIN_SET_EXPORT_FORMAT'; format: GrainExportFormat }
  | { type: 'GRAIN_SET_GPU_READY'; ready: boolean }
  | { type: 'GRAIN_SET_GPU_ERROR'; error: string | null }
  | { type: 'GRAIN_SET_RENDER_TIME'; time: number }
  | { type: 'GRAIN_LOAD_STATE'; state: Partial<GrainState> };
