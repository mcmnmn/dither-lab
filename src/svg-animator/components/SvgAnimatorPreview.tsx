import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useSvgAnimatorState, useSvgAnimatorDispatch } from '../state/context';
import type { AnimationConfig } from '../engine/animation-generator';
import { useWebAnimations } from '../hooks/use-web-animations';

const CHECKER_BG = 'repeating-conic-gradient(#d1d5db 0% 25%, #fff 0% 50%) 0 0 / 16px 16px';

export function SvgAnimatorPreview() {
  const state = useSvgAnimatorState();
  const dispatch = useSvgAnimatorDispatch();
  const {
    parsedSvg, preset, duration, easing, loop, stagger, staggerDelay, playing, previewBg, previewSize,
    staggerMode, intensity, transformOrigin, slideDirection, elementOverrides, showGridOverlay,
    animationGeneration,
  } = state;
  const containerRef = useRef<HTMLDivElement>(null);

  const totalElements = parsedSvg?.animatableCount ?? 0;

  // Build animation config
  const animConfig: AnimationConfig | null = useMemo(() => {
    if (!parsedSvg) return null;
    return {
      preset, duration, easing, loop, stagger, staggerDelay,
      staggerMode, intensity, transformOrigin, slideDirection, elementOverrides, totalElements,
    };
  }, [preset, duration, easing, loop, stagger, staggerDelay, staggerMode, intensity, transformOrigin, slideDirection, elementOverrides, totalElements, parsedSvg]);

  // Build visibility array
  const visibleElements = useMemo(() => {
    if (!parsedSvg) return [];
    return parsedSvg.elements.map(el => el.visible);
  }, [parsedSvg]);

  // Combined generation: increments on config change, SVG change, or explicit restart
  const [localGen, setLocalGen] = useState(0);
  useEffect(() => {
    setLocalGen(g => g + 1);
  }, [animConfig, parsedSvg?.svgString]);
  const generation = localGen + animationGeneration;

  // Web Animations API engine
  useWebAnimations(containerRef, animConfig, visibleElements, playing, generation);

  const handleReplay = useCallback(() => {
    dispatch({ type: 'SA_RESTART_ANIMATION' });
  }, [dispatch]);

  const displaySize = previewSize * 4;

  const bgStyle: React.CSSProperties = previewBg === 'checker'
    ? { background: CHECKER_BG }
    : { backgroundColor: previewBg === 'dark' ? '#1a1a1a' : '#ffffff' };

  // Build the SVG markup (no animation classes — Web Animations API handles it)
  const svgHtml = useMemo(() => {
    if (!parsedSvg) return '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(parsedSvg.svgString, 'image/svg+xml');
    const svg = doc.documentElement;
    svg.setAttribute('width', String(displaySize));
    svg.setAttribute('height', String(displaySize));
    const serializer = new XMLSerializer();
    return serializer.serializeToString(svg);
  }, [parsedSvg, displaySize]);

  if (!parsedSvg) {
    return (
      <div className="dot-grid flex flex-1 items-center justify-center bg-(--color-bg)" style={bgStyle}>
        <div className="flex flex-col items-center gap-3 text-(--color-text-secondary)">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-30">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
            <circle cx="9" cy="9" r="2"/>
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
          </svg>
          <p className="text-[10px] uppercase tracking-wider">Paste SVG code or upload a .svg file</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dot-grid relative flex flex-1 items-center justify-center overflow-hidden" style={bgStyle}>
      {/* Grid overlay + center crosshair */}
      {showGridOverlay && (
        <>
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-red-400/30" />
          <div className="pointer-events-none absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-red-400/30" />
        </>
      )}

      {/* SVG container */}
      <div
        ref={containerRef}
        dangerouslySetInnerHTML={{ __html: svgHtml }}
        style={{ color: previewBg === 'dark' ? '#ffffff' : '#1a1a1a' }}
      />

      {/* Play/Pause + Replay controls */}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1">
        <button
          onClick={() => dispatch({ type: 'SA_TOGGLE_PLAYING' })}
          className="border border-black/20 bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-700 shadow-sm backdrop-blur hover:bg-white"
        >
          {playing ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={handleReplay}
          className="border border-black/20 bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-700 shadow-sm backdrop-blur hover:bg-white"
        >
          Replay
        </button>
      </div>
    </div>
  );
}
