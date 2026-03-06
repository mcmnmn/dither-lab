export type AnimationPreset =
  | 'draw-on' | 'pop' | 'wiggle' | 'spin'
  | 'bounce-in' | 'slide-in' | 'hover-float'
  | 'success' | 'loading-dots' | 'pulse';

export type EasingId =
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'cubic-snap'
  | 'cubic-bounce'
  | 'cubic-smooth';

export type PreviewBackground = 'light' | 'dark' | 'checker';
export type PreviewSize = 16 | 24 | 32 | 48;
export type StaggerMode = 'sequential' | 'reverse' | 'center-out' | 'random';
export type SlideDirection = 'left' | 'right' | 'up' | 'down';
export type TransformOrigin =
  | 'top-left' | 'top-center' | 'top-right'
  | 'center-left' | 'center' | 'center-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface ParsedElement {
  index: number;
  tag: string;
  name: string;
  id: string | null;
  visible: boolean;
  pathLength?: number;
}

export interface ParsedSvgInfo {
  svgString: string;
  viewBox: string | null;
  width: string | null;
  height: string | null;
  elementCount: number;
  pathCount: number;
  hasStrokes: boolean;
  animatableCount: number;
  elements: ParsedElement[];
}

export interface ElementAnimationConfig {
  preset?: AnimationPreset;
  duration?: number;
  easing?: EasingId;
  delay?: number;
  intensity?: number;
  transformOrigin?: TransformOrigin;
  slideDirection?: SlideDirection;
  visible?: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  preset: AnimationPreset;
  duration: number;
  easing: EasingId;
  loop: boolean;
  stagger: boolean;
  staggerDelay: number;
  staggerMode: StaggerMode;
  intensity: number;
  transformOrigin: TransformOrigin;
  slideDirection?: SlideDirection;
  builtIn: boolean;
}

export interface SvgAnimatorState {
  // V1
  svgSource: string;
  parsedSvg: ParsedSvgInfo | null;
  parseError: string | null;
  preset: AnimationPreset;
  duration: number;
  easing: EasingId;
  loop: boolean;
  stagger: boolean;
  staggerDelay: number;
  playing: boolean;
  previewBg: PreviewBackground;
  previewSize: PreviewSize;
  showExportModal: boolean;
  // V2
  staggerMode: StaggerMode;
  intensity: number;
  transformOrigin: TransformOrigin;
  slideDirection: SlideDirection;
  elementOverrides: Record<number, ElementAnimationConfig>;
  selectedElementIndex: number | null;
  showGridOverlay: boolean;
  timelinePosition: number;
  animationGeneration: number;
  recipes: Recipe[];
  showRecipeModal: boolean;
}

export type SvgAnimatorAction =
  | { type: 'SA_SET_SVG_SOURCE'; source: string }
  | { type: 'SA_SET_PARSED_SVG'; parsed: ParsedSvgInfo | null; error: string | null }
  | { type: 'SA_SET_PRESET'; preset: AnimationPreset }
  | { type: 'SA_SET_DURATION'; duration: number }
  | { type: 'SA_SET_EASING'; easing: EasingId }
  | { type: 'SA_TOGGLE_LOOP' }
  | { type: 'SA_TOGGLE_STAGGER' }
  | { type: 'SA_SET_STAGGER_DELAY'; delay: number }
  | { type: 'SA_TOGGLE_PLAYING' }
  | { type: 'SA_SET_PLAYING'; playing: boolean }
  | { type: 'SA_SET_PREVIEW_BG'; bg: PreviewBackground }
  | { type: 'SA_SET_PREVIEW_SIZE'; size: PreviewSize }
  | { type: 'SA_TOGGLE_EXPORT_MODAL' }
  | { type: 'SA_LOAD_STATE'; state: Partial<SvgAnimatorState> }
  // V2
  | { type: 'SA_SET_STAGGER_MODE'; mode: StaggerMode }
  | { type: 'SA_SET_INTENSITY'; intensity: number }
  | { type: 'SA_SET_TRANSFORM_ORIGIN'; origin: TransformOrigin }
  | { type: 'SA_SET_SLIDE_DIRECTION'; direction: SlideDirection }
  | { type: 'SA_SET_ELEMENT_OVERRIDE'; index: number; config: Partial<ElementAnimationConfig> }
  | { type: 'SA_CLEAR_ELEMENT_OVERRIDE'; index: number }
  | { type: 'SA_SET_SELECTED_ELEMENT'; index: number | null }
  | { type: 'SA_REORDER_ELEMENTS'; fromIndex: number; toIndex: number }
  | { type: 'SA_RENAME_ELEMENT'; index: number; name: string }
  | { type: 'SA_TOGGLE_ELEMENT_VISIBILITY'; index: number }
  | { type: 'SA_TOGGLE_GRID_OVERLAY' }
  | { type: 'SA_SET_TIMELINE_POSITION'; position: number }
  | { type: 'SA_SAVE_RECIPE'; recipe: Recipe }
  | { type: 'SA_DELETE_RECIPE'; id: string }
  | { type: 'SA_APPLY_RECIPE'; recipe: Recipe }
  | { type: 'SA_TOGGLE_RECIPE_MODAL' }
  | { type: 'SA_RESTART_ANIMATION' };
