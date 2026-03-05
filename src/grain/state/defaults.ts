import type {
  AsciiSettings,
  HalftoneSettings,
  NoiseFieldSettings,
  PixelSortSettings,
  CrosshatchSettings,
  VhsSettings,
  ProcessingSettings,
  PostProcessingSettings,
} from './types';

export const DEFAULT_ASCII: AsciiSettings = {
  scale: 2,
  spacing: 0,
  outputWidth: 0,
  charSet: 'standard',
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hueRotation: 0,
  sharpness: 0,
  gamma: 1.0,
  colorMode: 'original',
  fgColor: '#00ff00',
  bgColor: '#000000',
  intensity: 1.0,
};

export const DEFAULT_HALFTONE: HalftoneSettings = {
  shape: 'circle',
  dotScale: 1.6,
  spacing: 5,
  angle: 45,
  invert: false,
  brightness: 21,
  contrast: 26,
  colorMode: 'original',
};

export const DEFAULT_NOISE_FIELD: NoiseFieldSettings = {
  noiseType: 'perlin',
  scale: 50,
  intensity: 30,
  octaves: 4,
  speed: 1.0,
  animate: false,
  distortOnly: true,
  brightness: 0,
  contrast: 0,
};

export const DEFAULT_PIXEL_SORT: PixelSortSettings = {
  direction: 'horizontal',
  threshold: 50,
  sortBy: 'brightness',
  randomness: 20,
  brightness: 0,
  contrast: 0,
};

export const DEFAULT_CROSSHATCH: CrosshatchSettings = {
  lineWidth: 1,
  spacing: 6,
  angle: 45,
  layers: 3,
  brightness: 0,
  contrast: 0,
  colorMode: 'original',
};

export const DEFAULT_VHS: VhsSettings = {
  tracking: 30,
  noise: 20,
  colorBleed: 40,
  distortion: 20,
  brightness: 0,
  contrast: 0,
};

export const DEFAULT_PROCESSING: ProcessingSettings = {
  invert: false,
  brightnessMap: 0.9,
  edgeEnhance: 5,
  blur: 0,
  quantizeColors: 0,
};

export const DEFAULT_POST_PROCESSING: PostProcessingSettings = {
  bloom: { enabled: false, threshold: 0.4, intensity: 1.2, radius: 15 },
  grain: { enabled: false, intensity: 25, size: 1, speed: 80 },
  chromatic: { enabled: false, offset: 6 },
  scanlines: { enabled: false, opacity: 0.1, spacing: 2 },
  vignette: { enabled: false, intensity: 0.4, radius: 0.5 },
  crtCurve: false,
};
