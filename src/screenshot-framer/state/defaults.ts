import type { SFState } from './types';

export const sfInitialState: SFState = {
  screenshotSrc: null,
  screenshotFileName: '',
  screenshotScale: 0.75,
  screenshotBorderRadius: 12,
  screenshotShadow: 40,
  screenshotOffsetX: 0,
  screenshotOffsetY: 0,

  bgType: 'gradient',
  bgSolidColor: '#1a1a2e',
  bgGradientPresetId: 'givebutter',
  bgPatternId: 'dots',
  bgPatternColor: '#ffffff',
  bgPatternBgColor: '#1a1a2e',
  bgPatternScale: 1,

  logoEnabled: false,
  logoSrc: null,
  logoPosition: 'bottom-right',
  logoScale: 0.06,
  logoOpacity: 0.8,

  outputResolution: 1080,
  outputFormat: 'png',
};
