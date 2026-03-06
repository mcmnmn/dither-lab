import type {
  AnimationPreset,
  EasingId,
  StaggerMode,
  SlideDirection,
  TransformOrigin,
  ElementAnimationConfig,
} from '../state/types';
import { EASING_OPTIONS } from '../state/defaults';

export interface AnimationConfig {
  preset: AnimationPreset;
  duration: number;
  easing: EasingId;
  loop: boolean;
  stagger: boolean;
  staggerDelay: number;
  staggerMode: StaggerMode;
  intensity: number;
  transformOrigin: TransformOrigin;
  slideDirection: SlideDirection;
  elementOverrides: Record<number, ElementAnimationConfig>;
  totalElements: number;
}

export interface AnimationOutput {
  keyframesCSS: string;
  getElementStyle: (index: number, pathLength?: number) => string;
  className: string;
}

function easingToCSS(id: EasingId): string {
  return EASING_OPTIONS.find(e => e.value === id)?.css ?? 'ease';
}

function transformOriginToCSS(origin: TransformOrigin): string {
  return origin.replace('-', ' ').replace('center center', 'center');
}

export function calculateStaggerDelay(
  index: number,
  total: number,
  baseDelay: number,
  mode: StaggerMode,
): number {
  switch (mode) {
    case 'sequential':
      return index * baseDelay;
    case 'reverse':
      return (total - 1 - index) * baseDelay;
    case 'center-out': {
      const center = (total - 1) / 2;
      return Math.abs(index - center) * baseDelay;
    }
    case 'random':
      // Use deterministic pseudo-random based on index for consistency
      return ((Math.sin(index * 9301 + 49297) % 1 + 1) % 1) * total * baseDelay;
  }
}

function getIntensityAmplitude(intensity: number, preset: AnimationPreset) {
  const t = intensity / 10;
  switch (preset) {
    case 'wiggle':
      return { degrees: 2 + t * 18 };
    case 'pop':
      return { overshoot: t * 0.3 };
    case 'bounce-in':
      return { dropPx: 10 + t * 40, overshoot: t * 0.2 };
    case 'slide-in':
      return { distance: 10 + t * 90 };
    case 'hover-float':
      return { floatPx: 2 + t * 12 };
    case 'pulse':
      return { scaleMax: 1 + t * 0.15, opacityMin: 1 - t * 0.4 };
    case 'loading-dots':
      return { bouncePx: 4 + t * 16 };
    case 'spin':
      return {};
    case 'draw-on':
    case 'success':
      return {};
    default:
      return {};
  }
}

function resolveElementConfig(
  index: number,
  globalConfig: AnimationConfig,
): {
  preset: AnimationPreset;
  duration: number;
  easing: EasingId;
  intensity: number;
  transformOrigin: TransformOrigin;
  slideDirection: SlideDirection;
  delay: number;
} {
  const override = globalConfig.elementOverrides[index];
  const preset = override?.preset ?? globalConfig.preset;
  const duration = override?.duration ?? globalConfig.duration;
  const easing = override?.easing ?? globalConfig.easing;
  const intensity = override?.intensity ?? globalConfig.intensity;
  const transformOrigin = override?.transformOrigin ?? globalConfig.transformOrigin;
  const slideDirection = override?.slideDirection ?? globalConfig.slideDirection;
  const baseDelay = globalConfig.stagger
    ? calculateStaggerDelay(index, globalConfig.totalElements, globalConfig.staggerDelay, globalConfig.staggerMode)
    : 0;
  const delay = override?.delay ?? baseDelay;
  return { preset, duration, easing, intensity, transformOrigin, slideDirection, delay };
}

export function generateAnimation(config: AnimationConfig): AnimationOutput {
  const allKeyframes = new Set<string>();
  const presetSet = new Set<AnimationPreset>([config.preset]);
  // Gather all presets used (global + overrides)
  for (const override of Object.values(config.elementOverrides)) {
    if (override.preset) presetSet.add(override.preset);
  }
  for (const p of presetSet) {
    allKeyframes.add(getKeyframesForPreset(p, config.intensity));
  }

  return {
    keyframesCSS: Array.from(allKeyframes).join('\n\n'),
    getElementStyle: (index: number, pathLength?: number) => {
      const resolved = resolveElementConfig(index, config);
      return buildElementStyle(resolved, pathLength, config.loop);
    },
    className: `sa-${config.preset}`,
  };
}

function getKeyframesForPreset(preset: AnimationPreset, intensity: number): string {
  const amp = getIntensityAmplitude(intensity, preset);
  switch (preset) {
    case 'draw-on':
      return `@keyframes sa-draw-on {
  from { stroke-dashoffset: var(--sa-len); }
  to { stroke-dashoffset: 0; }
}`;
    case 'pop':
      return `@keyframes sa-pop {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}`;
    case 'wiggle': {
      const deg = (amp as { degrees: number }).degrees;
      return `@keyframes sa-wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-${deg}deg); }
  75% { transform: rotate(${deg}deg); }
}`;
    }
    case 'spin':
      return `@keyframes sa-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}`;
    case 'bounce-in': {
      const a = amp as { dropPx: number; overshoot: number };
      return `@keyframes sa-bounce-in {
  0% { transform: translateY(-${a.dropPx}px) scale(0.8); opacity: 0; }
  60% { transform: translateY(0) scale(${1 + a.overshoot}); opacity: 1; }
  80% { transform: translateY(0) scale(${1 - a.overshoot * 0.3}); }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}`;
    }
    case 'slide-in':
      // Keyframes use CSS custom properties for direction
      return `@keyframes sa-slide-in {
  from { transform: var(--sa-slide-from); opacity: 0; }
  to { transform: translate(0, 0); opacity: 1; }
}`;
    case 'hover-float': {
      const a = amp as { floatPx: number };
      return `@keyframes sa-hover-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-${a.floatPx}px); }
}`;
    }
    case 'success':
      return `@keyframes sa-success {
  0% { stroke-dashoffset: var(--sa-len); opacity: 0.5; }
  70% { stroke-dashoffset: 0; opacity: 1; }
  85% { transform: scale(1.1); }
  100% { stroke-dashoffset: 0; transform: scale(1); opacity: 1; }
}`;
    case 'loading-dots': {
      const a = amp as { bouncePx: number };
      return `@keyframes sa-loading-dots {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-${a.bouncePx}px); }
}`;
    }
    case 'pulse': {
      const a = amp as { scaleMax: number; opacityMin: number };
      return `@keyframes sa-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(${a.scaleMax}); opacity: ${a.opacityMin}; }
}`;
    }
  }
}

function buildElementStyle(
  resolved: ReturnType<typeof resolveElementConfig>,
  pathLength: number | undefined,
  globalLoop: boolean,
): string {
  const { preset, duration, easing, intensity, transformOrigin, slideDirection, delay } = resolved;
  const originCSS = transformOriginToCSS(transformOrigin);
  const easingCSS = (preset === 'spin') ? 'linear' : easingToCSS(easing);
  const isLooping = preset === 'spin' || preset === 'hover-float' || preset === 'loading-dots' || globalLoop;
  const iteration = isLooping ? 'infinite' : '1';
  const fill = (preset === 'spin') ? 'none' : 'both';

  switch (preset) {
    case 'draw-on': {
      const len = pathLength ?? 1000;
      return `--sa-len: ${len}; stroke-dasharray: ${len}; stroke-dashoffset: ${len}; transform-origin: ${originCSS}; animation: sa-draw-on ${duration}ms ${easingCSS} ${delay}ms ${iteration} ${fill};`;
    }
    case 'pop':
      return `transform-origin: ${originCSS}; animation: sa-pop ${duration}ms ${easingCSS} ${delay}ms ${iteration} ${fill};`;
    case 'wiggle':
      return `transform-origin: ${originCSS}; animation: sa-wiggle ${duration}ms ${easingCSS} ${delay}ms ${iteration} ${fill};`;
    case 'spin':
      return `transform-origin: ${originCSS}; animation: sa-spin ${duration}ms linear ${delay}ms infinite;`;
    case 'bounce-in':
      return `transform-origin: ${originCSS}; animation: sa-bounce-in ${duration}ms ${easingCSS} ${delay}ms ${iteration} ${fill};`;
    case 'slide-in': {
      const amp = getIntensityAmplitude(intensity, 'slide-in') as { distance: number };
      const d = amp.distance;
      const slideFrom =
        slideDirection === 'left' ? `translate(-${d}px, 0)` :
        slideDirection === 'right' ? `translate(${d}px, 0)` :
        slideDirection === 'up' ? `translate(0, -${d}px)` :
        `translate(0, ${d}px)`;
      return `--sa-slide-from: ${slideFrom}; transform-origin: ${originCSS}; animation: sa-slide-in ${duration}ms ${easingCSS} ${delay}ms ${iteration} ${fill};`;
    }
    case 'hover-float':
      return `transform-origin: ${originCSS}; animation: sa-hover-float ${duration}ms ${easingCSS} ${delay}ms infinite ${fill};`;
    case 'success': {
      const len = pathLength ?? 1000;
      return `--sa-len: ${len}; stroke-dasharray: ${len}; stroke-dashoffset: ${len}; transform-origin: ${originCSS}; animation: sa-success ${duration}ms ${easingCSS} ${delay}ms ${iteration} ${fill};`;
    }
    case 'loading-dots':
      return `transform-origin: ${originCSS}; animation: sa-loading-dots ${duration}ms ${easingCSS} ${delay}ms infinite ${fill};`;
    case 'pulse':
      return `transform-origin: ${originCSS}; animation: sa-pulse ${duration}ms ${easingCSS} ${delay}ms infinite ${fill};`;
  }
}
