import { useRef, useEffect, useCallback, useState } from 'react';
import { useSFState, useSFDispatch } from '../state/context';
import { renderFrameSync, preloadPattern } from '../engine/frame-renderer';

const PREVIEW_SIZE = 600;

export function ScreenshotFramerCanvas() {
  const state = useSFState();
  const dispatch = useSFDispatch();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const screenshotRef = useRef<HTMLImageElement | null>(null);
  const logoRef = useRef<HTMLImageElement | null>(null);
  const patternRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rafRef = useRef<number>(0);
  const [loaded, setLoaded] = useState(0);
  const [canvasSize, setCanvasSize] = useState(PREVIEW_SIZE);

  // Load sample image on mount if no screenshot
  useEffect(() => {
    if (state.screenshotSrc) return;
    fetch(`${import.meta.env.BASE_URL}sample.jpg`)
      .then(r => { if (!r.ok) throw new Error('fetch failed'); return r.blob(); })
      .then(blob => {
        const reader = new FileReader();
        reader.onload = () => {
          dispatch({ type: 'SF_SET_SCREENSHOT', src: reader.result as string, fileName: 'sample.jpg' });
        };
        reader.readAsDataURL(blob);
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Measure container and track resizes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const rect = container.getBoundingClientRect();
      const s = Math.min(rect.width, rect.height);
      if (s > 0) setCanvasSize(s);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Load screenshot image
  useEffect(() => {
    if (!state.screenshotSrc) {
      screenshotRef.current = null;
      setLoaded(v => v + 1);
      return;
    }
    const img = new Image();
    img.onload = () => {
      screenshotRef.current = img;
      setLoaded(v => v + 1);
    };
    img.src = state.screenshotSrc;
  }, [state.screenshotSrc]);

  // Load logo image
  useEffect(() => {
    if (!state.logoSrc) {
      logoRef.current = null;
      setLoaded(v => v + 1);
      return;
    }
    const img = new Image();
    img.onload = () => {
      logoRef.current = img;
      setLoaded(v => v + 1);
    };
    img.src = state.logoSrc;
  }, [state.logoSrc]);

  // Load pattern image
  useEffect(() => {
    if (state.bgType !== 'pattern') {
      patternRef.current = null;
      return;
    }
    preloadPattern(state.bgPatternId, state.bgPatternColor, state.bgPatternScale).then(img => {
      patternRef.current = img;
      setLoaded(v => v + 1);
    });
  }, [state.bgType, state.bgPatternId, state.bgPatternColor, state.bgPatternScale]);

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const dpr = window.devicePixelRatio || 1;
      const backing = Math.round(canvasSize * dpr);
      canvas.width = backing;
      canvas.height = backing;
      const ctx = canvas.getContext('2d')!;
      renderFrameSync(ctx, backing, state, screenshotRef.current, logoRef.current, patternRef.current);
    });

    return () => cancelAnimationFrame(rafRef.current);
  }, [state, loaded, canvasSize]);

  const handleClick = useCallback(() => {
    if (!state.screenshotSrc) {
      fileInputRef.current?.click();
    }
  }, [state.screenshotSrc]);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      dispatch({ type: 'SF_SET_SCREENSHOT', src: reader.result as string, fileName: file.name });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [dispatch]);

  return (
    <div className="flex flex-1 items-center justify-center bg-(--color-bg) p-4 overflow-auto">
      <div
        ref={containerRef}
        className="relative"
        style={{ width: `min(${PREVIEW_SIZE}px, 100%)`, maxHeight: 'calc(100vh - 120px)', aspectRatio: '1 / 1' }}
      >
        <canvas
          ref={canvasRef}
          className={!state.screenshotSrc ? 'cursor-pointer' : ''}
          style={{ width: '100%', height: '100%', display: 'block' }}
          onClick={handleClick}
        />
        {!state.screenshotSrc && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-(--color-text-secondary)">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span className="text-xs uppercase tracking-wider opacity-60">Click to upload screenshot</span>
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
