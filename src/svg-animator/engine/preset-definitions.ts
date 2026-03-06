import type { AnimationPreset, SlideDirection } from '../state/types';

export interface PresetKeyframeConfig {
  intensity: number;
  slideDirection?: SlideDirection;
  pathLength?: number;
}

export function getWebAnimationKeyframes(
  preset: AnimationPreset,
  config: PresetKeyframeConfig,
): Keyframe[] {
  const t = config.intensity / 10;

  switch (preset) {
    case 'pop':
      return [
        { transform: 'scale(0)', opacity: 0, offset: 0 },
        { transform: 'scale(1)', opacity: 1, offset: 1 },
      ];

    case 'draw-on': {
      const len = config.pathLength ?? 1000;
      return [
        { strokeDashoffset: len, offset: 0 },
        { strokeDashoffset: 0, offset: 1 },
      ];
    }

    case 'wiggle': {
      const deg = 2 + t * 18;
      return [
        { transform: 'rotate(0deg)', offset: 0 },
        { transform: `rotate(-${deg}deg)`, offset: 0.25 },
        { transform: 'rotate(0deg)', offset: 0.5 },
        { transform: `rotate(${deg}deg)`, offset: 0.75 },
        { transform: 'rotate(0deg)', offset: 1 },
      ];
    }

    case 'spin':
      return [
        { transform: 'rotate(0deg)', offset: 0 },
        { transform: 'rotate(360deg)', offset: 1 },
      ];

    case 'bounce-in': {
      const dropPx = 10 + t * 40;
      const overshoot = t * 0.2;
      return [
        { transform: `translateY(-${dropPx}px) scale(0.8)`, opacity: 0, offset: 0 },
        { transform: `translateY(0) scale(${1 + overshoot})`, opacity: 1, offset: 0.6 },
        { transform: `translateY(0) scale(${1 - overshoot * 0.3})`, offset: 0.8 },
        { transform: 'translateY(0) scale(1)', opacity: 1, offset: 1 },
      ];
    }

    case 'slide-in': {
      const distance = 10 + t * 90;
      const dir = config.slideDirection ?? 'left';
      const from =
        dir === 'left' ? `translate(-${distance}px, 0)` :
        dir === 'right' ? `translate(${distance}px, 0)` :
        dir === 'up' ? `translate(0, -${distance}px)` :
        `translate(0, ${distance}px)`;
      return [
        { transform: from, opacity: 0, offset: 0 },
        { transform: 'translate(0, 0)', opacity: 1, offset: 1 },
      ];
    }

    case 'hover-float': {
      const floatPx = 2 + t * 12;
      return [
        { transform: 'translateY(0)', offset: 0 },
        { transform: `translateY(-${floatPx}px)`, offset: 0.5 },
        { transform: 'translateY(0)', offset: 1 },
      ];
    }

    case 'success': {
      const len = config.pathLength ?? 1000;
      return [
        { strokeDashoffset: len, opacity: 0.5, transform: 'scale(1)', offset: 0 },
        { strokeDashoffset: 0, opacity: 1, transform: 'scale(1)', offset: 0.7 },
        { strokeDashoffset: 0, opacity: 1, transform: 'scale(1.1)', offset: 0.85 },
        { strokeDashoffset: 0, opacity: 1, transform: 'scale(1)', offset: 1 },
      ];
    }

    case 'loading-dots': {
      const bouncePx = 4 + t * 16;
      return [
        { transform: 'translateY(0)', offset: 0 },
        { transform: `translateY(-${bouncePx}px)`, offset: 0.5 },
        { transform: 'translateY(0)', offset: 1 },
      ];
    }

    case 'pulse': {
      const scaleMax = 1 + t * 0.15;
      const opacityMin = 1 - t * 0.4;
      return [
        { transform: 'scale(1)', opacity: 1, offset: 0 },
        { transform: `scale(${scaleMax})`, opacity: opacityMin, offset: 0.5 },
        { transform: 'scale(1)', opacity: 1, offset: 1 },
      ];
    }
  }
}

export function isAlwaysLooping(preset: AnimationPreset): boolean {
  return preset === 'spin' || preset === 'hover-float' || preset === 'loading-dots' || preset === 'pulse';
}

export function isAlwaysLinear(preset: AnimationPreset): boolean {
  return preset === 'spin';
}

export function needsStroke(preset: AnimationPreset): boolean {
  return preset === 'draw-on' || preset === 'success';
}
