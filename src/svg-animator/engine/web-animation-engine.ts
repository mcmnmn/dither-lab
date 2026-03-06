import type { EasingId, TransformOrigin } from '../state/types';
import type { AnimationConfig } from './animation-generator';
import { calculateStaggerDelay } from './animation-generator';
import { getWebAnimationKeyframes, isAlwaysLooping, isAlwaysLinear, needsStroke } from './preset-definitions';
import { EASING_OPTIONS } from '../state/defaults';

const ANIMATABLE_SELECTOR = 'path, circle, rect, line, polyline, polygon, ellipse';

function easingToCSS(id: EasingId): string {
  return EASING_OPTIONS.find(e => e.value === id)?.css ?? 'ease';
}

function transformOriginToCSS(origin: TransformOrigin): string {
  return origin.replace('-', ' ').replace('center center', 'center');
}

export class WebAnimationEngine {
  private animations: Animation[] = [];
  private totalDuration = 0;

  apply(
    container: HTMLElement,
    config: AnimationConfig,
    visibleElements: boolean[],
  ): void {
    this.dispose();

    const elements = container.querySelectorAll(ANIMATABLE_SELECTOR);
    let maxEnd = 0;

    elements.forEach((el, i) => {
      const svgEl = el as SVGElement;

      // Handle visibility
      if (!visibleElements[i]) {
        svgEl.style.display = 'none';
        return;
      }
      svgEl.style.display = '';

      // Resolve per-element config
      const override = config.elementOverrides[i];
      const preset = override?.preset ?? config.preset;
      const duration = override?.duration ?? config.duration;
      const easing = override?.easing ?? config.easing;
      const intensity = override?.intensity ?? config.intensity;
      const transformOrigin = override?.transformOrigin ?? config.transformOrigin;
      const slideDirection = override?.slideDirection ?? config.slideDirection;
      const baseDelay = config.stagger
        ? calculateStaggerDelay(i, config.totalElements, config.staggerDelay, config.staggerMode)
        : 0;
      const delay = override?.delay ?? baseDelay;

      // Set transform origin on the element
      svgEl.style.transformOrigin = transformOriginToCSS(transformOrigin);

      // Measure path length for stroke-based presets
      let pathLength: number | undefined;
      if (needsStroke(preset) && el.tagName.toLowerCase() === 'path') {
        try {
          pathLength = (el as SVGPathElement).getTotalLength();
          svgEl.style.strokeDasharray = String(pathLength);
          svgEl.style.strokeDashoffset = String(pathLength);
        } catch { /* not all paths support getTotalLength */ }
      }

      // Get keyframes
      const keyframes = getWebAnimationKeyframes(preset, {
        intensity,
        slideDirection,
        pathLength,
      });

      const isLooping = isAlwaysLooping(preset) || config.loop;
      const easingCSS = isAlwaysLinear(preset) ? 'linear' : easingToCSS(easing);
      const fill: FillMode = preset === 'spin' ? 'none' : 'both';

      const anim = svgEl.animate(keyframes, {
        duration,
        delay,
        easing: easingCSS,
        iterations: isLooping ? Infinity : 1,
        fill,
      });

      this.animations.push(anim);
      maxEnd = Math.max(maxEnd, delay + duration);
    });

    this.totalDuration = maxEnd;
  }

  seekTo(fraction: number): void {
    const t = fraction * this.totalDuration;
    for (const anim of this.animations) {
      anim.currentTime = t;
    }
  }

  play(): void {
    for (const anim of this.animations) {
      anim.play();
    }
  }

  pause(): void {
    for (const anim of this.animations) {
      anim.pause();
    }
  }

  restart(): void {
    for (const anim of this.animations) {
      anim.currentTime = 0;
      anim.play();
    }
  }

  stepForward(ms = 16): void {
    for (const anim of this.animations) {
      anim.pause();
      anim.currentTime = ((anim.currentTime as number) ?? 0) + ms;
    }
  }

  stepBackward(ms = 16): void {
    for (const anim of this.animations) {
      anim.pause();
      anim.currentTime = Math.max(0, ((anim.currentTime as number) ?? 0) - ms);
    }
  }

  getTotalDuration(): number {
    return this.totalDuration;
  }

  getCurrentTime(): number {
    if (this.animations.length === 0) return 0;
    return (this.animations[0].currentTime as number) ?? 0;
  }

  isPlaying(): boolean {
    return this.animations.some(a => a.playState === 'running');
  }

  dispose(): void {
    for (const anim of this.animations) {
      anim.cancel();
    }
    this.animations = [];
    this.totalDuration = 0;
  }
}
