import type {
  AnimationPreset,
  EasingId,
  PreviewSize,
  StaggerMode,
  TransformOrigin,
  SlideDirection,
  Recipe,
  SvgAnimatorState,
} from './types';
import { SAMPLE_SVGS } from '../data/sample-svgs';

export type PresetCategory = 'entrance' | 'emphasis' | 'continuous' | 'special';

export const EASING_OPTIONS: { value: EasingId; label: string; css: string }[] = [
  { value: 'ease',          label: 'Ease',        css: 'ease' },
  { value: 'ease-in',       label: 'Ease In',     css: 'ease-in' },
  { value: 'ease-out',      label: 'Ease Out',    css: 'ease-out' },
  { value: 'ease-in-out',   label: 'Ease In Out', css: 'ease-in-out' },
  { value: 'cubic-snap',    label: 'Snap',        css: 'cubic-bezier(0.5, 0, 0.1, 1)' },
  { value: 'cubic-bounce',  label: 'Bounce',      css: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
  { value: 'cubic-smooth',  label: 'Smooth',      css: 'cubic-bezier(0.4, 0, 0.2, 1)' },
];

export const PRESET_OPTIONS: { value: AnimationPreset; label: string; description: string; category: PresetCategory }[] = [
  // Entrance
  { value: 'pop',          label: 'Pop',        description: 'Scale + fade',           category: 'entrance' },
  { value: 'bounce-in',   label: 'Bounce In',  description: 'Drop + bounce',          category: 'entrance' },
  { value: 'slide-in',    label: 'Slide In',   description: 'Slide from direction',   category: 'entrance' },
  { value: 'draw-on',     label: 'Draw On',    description: 'Stroke reveal',          category: 'entrance' },
  // Emphasis
  { value: 'wiggle',      label: 'Wiggle',     description: 'Rotate oscillation',     category: 'emphasis' },
  { value: 'pulse',       label: 'Pulse',      description: 'Opacity + subtle scale', category: 'emphasis' },
  { value: 'hover-float', label: 'Float',      description: 'Gentle Y oscillation',   category: 'emphasis' },
  // Continuous
  { value: 'spin',        label: 'Spin',       description: 'Continuous 360\u00B0',   category: 'continuous' },
  // Special
  { value: 'success',     label: 'Success',    description: 'Check-mark draw + pop',  category: 'special' },
  { value: 'loading-dots',label: 'Loading',    description: 'Staggered dot bounce',   category: 'special' },
];

export const STAGGER_MODE_OPTIONS: { value: StaggerMode; label: string }[] = [
  { value: 'sequential', label: 'Seq' },
  { value: 'reverse',    label: 'Rev' },
  { value: 'center-out', label: 'Center' },
  { value: 'random',     label: 'Rand' },
];

export const TRANSFORM_ORIGIN_OPTIONS: TransformOrigin[] = [
  'top-left', 'top-center', 'top-right',
  'center-left', 'center', 'center-right',
  'bottom-left', 'bottom-center', 'bottom-right',
];

export const SLIDE_DIRECTION_OPTIONS: { value: SlideDirection; label: string }[] = [
  { value: 'left',  label: '\u2190' },
  { value: 'right', label: '\u2192' },
  { value: 'up',    label: '\u2191' },
  { value: 'down',  label: '\u2193' },
];

export const PREVIEW_SIZE_OPTIONS: PreviewSize[] = [16, 24, 32, 48];

export const BUILT_IN_RECIPES: Recipe[] = [
  {
    id: 'quick-pop',
    name: 'Quick Pop',
    preset: 'pop',
    duration: 400,
    easing: 'cubic-bounce',
    loop: false,
    stagger: true,
    staggerDelay: 40,
    staggerMode: 'sequential',
    intensity: 6,
    transformOrigin: 'center',
    builtIn: true,
  },
  {
    id: 'smooth-draw',
    name: 'Smooth Draw',
    preset: 'draw-on',
    duration: 1200,
    easing: 'cubic-smooth',
    loop: false,
    stagger: true,
    staggerDelay: 80,
    staggerMode: 'sequential',
    intensity: 5,
    transformOrigin: 'center',
    builtIn: true,
  },
  {
    id: 'loading-loop',
    name: 'Loading Loop',
    preset: 'loading-dots',
    duration: 600,
    easing: 'ease-in-out',
    loop: true,
    stagger: true,
    staggerDelay: 100,
    staggerMode: 'sequential',
    intensity: 5,
    transformOrigin: 'center',
    builtIn: true,
  },
];

export const svgAnimatorInitialState: SvgAnimatorState = {
  svgSource: SAMPLE_SVGS.find(s => s.id === 'heart')?.svg ?? '',
  parsedSvg: null,
  parseError: null,
  preset: 'draw-on',
  duration: 2000,
  easing: 'ease-in-out',
  loop: false,
  stagger: true,
  staggerDelay: 60,
  playing: true,
  previewBg: 'light',
  previewSize: 48,
  showOutputModal: false,
  // V2
  staggerMode: 'sequential',
  intensity: 5,
  transformOrigin: 'center',
  slideDirection: 'left',
  elementOverrides: {},
  selectedElementIndex: null,
  showGridOverlay: false,
  timelinePosition: 0,
  animationGeneration: 0,
  recipes: [],
  showRecipeModal: false,
};
