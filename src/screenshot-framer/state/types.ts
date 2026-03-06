export type SFBackgroundType = 'gradient' | 'solid' | 'pattern';
export type SFPatternId = 'dots' | 'grid' | 'diagonal' | 'crosses' | 'waves' | 'triangles';
export type SFOutputResolution = 1080 | 2048;
export type SFOutputFormat = 'png' | 'jpg';
export type SFLogoPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface SFState {
  // Screenshot
  screenshotSrc: string | null;
  screenshotFileName: string;
  screenshotScale: number;
  screenshotBorderRadius: number;
  screenshotShadow: number;
  screenshotOffsetX: number;
  screenshotOffsetY: number;

  // Background
  bgType: SFBackgroundType;
  bgSolidColor: string;
  bgGradientPresetId: string;
  bgPatternId: SFPatternId;
  bgPatternColor: string;
  bgPatternBgColor: string;
  bgPatternScale: number;

  // Logo
  logoEnabled: boolean;
  logoSrc: string | null;
  logoPosition: SFLogoPosition;
  logoScale: number;
  logoOpacity: number;

  // Output
  outputResolution: SFOutputResolution;
  outputFormat: SFOutputFormat;
}

export type SFAction =
  | { type: 'SF_SET_SCREENSHOT'; src: string; fileName: string }
  | { type: 'SF_CLEAR_SCREENSHOT' }
  | { type: 'SF_SET_SCREENSHOT_SCALE'; scale: number }
  | { type: 'SF_SET_BORDER_RADIUS'; radius: number }
  | { type: 'SF_SET_SHADOW'; shadow: number }
  | { type: 'SF_SET_OFFSET'; x: number; y: number }
  | { type: 'SF_SET_BG_TYPE'; bgType: SFBackgroundType }
  | { type: 'SF_SET_BG_SOLID_COLOR'; color: string }
  | { type: 'SF_SET_BG_GRADIENT_PRESET'; presetId: string }
  | { type: 'SF_SET_BG_PATTERN'; patternId: SFPatternId }
  | { type: 'SF_SET_BG_PATTERN_COLOR'; color: string }
  | { type: 'SF_SET_BG_PATTERN_BG_COLOR'; color: string }
  | { type: 'SF_SET_BG_PATTERN_SCALE'; scale: number }
  | { type: 'SF_SET_LOGO'; src: string }
  | { type: 'SF_CLEAR_LOGO' }
  | { type: 'SF_TOGGLE_LOGO' }
  | { type: 'SF_SET_LOGO_POSITION'; position: SFLogoPosition }
  | { type: 'SF_SET_LOGO_SCALE'; scale: number }
  | { type: 'SF_SET_LOGO_OPACITY'; opacity: number }
  | { type: 'SF_SET_OUTPUT_FORMAT'; format: SFOutputFormat }
  | { type: 'SF_SET_OUTPUT_RESOLUTION'; resolution: SFOutputResolution }
  | { type: 'SF_LOAD_STATE'; state: Partial<SFState> };
