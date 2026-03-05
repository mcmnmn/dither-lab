import { useRef, useEffect, useCallback, useState } from 'react';
import { useAppState, useAppDispatch } from '../../state/app-context';
import { useZoomPan } from '../../hooks/use-zoom-pan';
import { ComparisonSlider } from './ComparisonSlider';
import { SideBySide } from './SideBySide';
import { DropZone } from '../common/DropZone';
import { VideoOverlay } from './VideoOverlay';
import { VideoControls } from '../common/VideoControls';
import { GlbViewer } from './GlbViewer';
import { loadImageFile } from '../../utils/image-io';
import { detectMediaType, loadVideoFile } from '../../utils/media-io';
import { isFirstVisit, markVisited, generateSampleImage } from '../../utils/sample-image';

const MAX_WARN = 4096;
const MAX_REJECT = 8192;

export function PreviewCanvas() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { handleWheel, handleMouseDown, handleMouseMove, handleMouseUp, resetView, zoomIn, zoomOut } = useZoomPan();
  const [sizeWarning, setSizeWarning] = useState<string | null>(null);

  // Load sample image on first visit
  useEffect(() => {
    if (!state.sourceImage && isFirstVisit()) {
      const sample = generateSampleImage();
      dispatch({ type: 'SET_SOURCE', imageData: sample, file: null, fileName: 'sample-gradient.png' });
      markVisited();
    }
  }, [state.sourceImage, dispatch]);

  const handleFiles = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    const mediaType = detectMediaType(file);

    if (mediaType === 'video') {
      setSizeWarning(null);
      const videoElement = await loadVideoFile(file);
      dispatch({ type: 'SET_VIDEO_SOURCE', videoElement, file, fileName: file.name });
      return;
    }

    if (mediaType === 'glb') {
      setSizeWarning(null);
      const glbUrl = URL.createObjectURL(file);
      dispatch({ type: 'SET_GLB_SOURCE', glbUrl, file, fileName: file.name });
      return;
    }

    const imageData = await loadImageFile(file);

    // Size check
    if (imageData.width > MAX_REJECT || imageData.height > MAX_REJECT) {
      setSizeWarning(`Image is ${imageData.width}x${imageData.height} — maximum supported size is ${MAX_REJECT}x${MAX_REJECT}. This image cannot be loaded.`);
      return;
    }
    if (imageData.width > MAX_WARN || imageData.height > MAX_WARN) {
      setSizeWarning(`Image is ${imageData.width}x${imageData.height} — preview may be slow for images larger than ${MAX_WARN}x${MAX_WARN}.`);
    } else {
      setSizeWarning(null);
    }

    dispatch({ type: 'SET_SOURCE', imageData, file, fileName: file.name });
  }, [dispatch]);

  // Handle clipboard paste
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/') || item.type.startsWith('video/')) {
          const file = item.getAsFile();
          if (file) handleFiles([file]);
          return;
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleFiles]);

  // Draw canvas (for toggle mode and default)
  useEffect(() => {
    if (state.comparisonMode === 'slider' || state.comparisonMode === 'side-by-side') return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let imageData: ImageData | null;
    if (state.comparisonMode === 'toggle' && state.showOriginal && state.sourceImage) {
      imageData = state.sourceImage;
    } else {
      imageData = state.resultImage;
    }

    if (!imageData) return;

    ctx.imageSmoothingEnabled = false;
    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = imageData.width;
    tmpCanvas.height = imageData.height;
    const tmpCtx = tmpCanvas.getContext('2d')!;
    tmpCtx.putImageData(imageData, 0, 0);

    const drawW = imageData.width * state.zoom;
    const drawH = imageData.height * state.zoom;
    const x = (canvas.width - drawW) / 2 + state.panX;
    const y = (canvas.height - drawH) / 2 + state.panY;

    ctx.drawImage(tmpCanvas, x, y, drawW, drawH);

    // Pixel grid at high zoom
    if (state.showPixelGrid && state.zoom >= 4) {
      ctx.strokeStyle = 'rgba(128,128,128,0.3)';
      ctx.lineWidth = 0.5;
      const pixelSize = state.zoom;
      for (let px = 0; px <= imageData.width; px++) {
        ctx.beginPath();
        ctx.moveTo(x + px * pixelSize, y);
        ctx.lineTo(x + px * pixelSize, y + drawH);
        ctx.stroke();
      }
      for (let py = 0; py <= imageData.height; py++) {
        ctx.beginPath();
        ctx.moveTo(x, y + py * pixelSize);
        ctx.lineTo(x + drawW, y + py * pixelSize);
        ctx.stroke();
      }
    }
  }, [state.resultImage, state.sourceImage, state.zoom, state.panX, state.panY, state.showPixelGrid, state.comparisonMode, state.showOriginal]);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const hasSource = state.sourceImage || state.sourceVideo || state.sourceGlbUrl;

  if (!hasSource) {
    return (
      <DropZone
        onFiles={handleFiles}
        className="flex h-full cursor-pointer items-center justify-center bg-(--color-bg)"
      >
        <div className="text-center">
          <div className="mb-3 text-2xl text-(--color-border)">[ + ]</div>
          <p className="text-xs text-(--color-text-secondary)">
            Drop a file here, click to browse, or paste from clipboard
          </p>
          <p className="mt-1 text-xs text-(--color-text-secondary) opacity-60">
            PNG, JPG, WebP, GIF, MP4, WebM, GLB
          </p>
        </div>
      </DropZone>
    );
  }

  // Video source — show video overlay with dither frame capture
  if (state.sourceMediaType === 'video' && state.sourceVideo) {
    return (
      <div className="flex h-full flex-col bg-(--color-bg)">
        <div ref={containerRef} className="relative flex-1 overflow-hidden">
          <canvas ref={canvasRef} className="absolute inset-0" />
          <VideoOverlay />
          <VideoControls video={state.sourceVideo} />
        </div>
      </div>
    );
  }

  // GLB source — show 3D viewer
  if (state.sourceMediaType === 'glb' && state.sourceGlbUrl) {
    return (
      <div className="flex h-full flex-col bg-(--color-bg)">
        <GlbViewer glbUrl={state.sourceGlbUrl} fileName={state.fileName} />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-(--color-bg)">
      {/* Size warning banner */}
      {sizeWarning && (
        <div className="flex items-center justify-between bg-amber-500/10 border-b border-amber-500/30 px-4 py-2">
          <span className="text-xs text-(--color-text)">{sizeWarning}</span>
          <button onClick={() => setSizeWarning(null)} className="ml-3 text-xs text-(--color-text) hover:opacity-70">Dismiss</button>
        </div>
      )}

      {/* Canvas area */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden cursor-grab active:cursor-grabbing"
        onWheel={handleWheel as unknown as React.WheelEventHandler<HTMLDivElement>}
        onMouseDown={handleMouseDown as unknown as React.MouseEventHandler<HTMLDivElement>}
        onMouseMove={handleMouseMove as unknown as React.MouseEventHandler<HTMLDivElement>}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {state.comparisonMode === 'slider' && state.sourceImage && state.resultImage ? (
          <ComparisonSlider
            original={state.sourceImage}
            result={state.resultImage}
            zoom={state.zoom}
            panX={state.panX}
            panY={state.panY}
          />
        ) : state.comparisonMode === 'side-by-side' && state.sourceImage && state.resultImage ? (
          <SideBySide
            original={state.sourceImage}
            result={state.resultImage}
            zoom={state.zoom}
            panX={state.panX}
            panY={state.panY}
          />
        ) : (
          <>
            <canvas ref={canvasRef} className="absolute inset-0" />
            {/* Toggle mode: hold-to-compare overlay + mouse hold support */}
            {state.comparisonMode === 'toggle' && state.sourceImage && state.resultImage && (
              <div
                className="absolute inset-0"
                onMouseDown={(e) => { e.stopPropagation(); dispatch({ type: 'SET_SHOW_ORIGINAL', show: true }); }}
                onMouseUp={() => dispatch({ type: 'SET_SHOW_ORIGINAL', show: false })}
                onMouseLeave={() => dispatch({ type: 'SET_SHOW_ORIGINAL', show: false })}
                onTouchStart={(e) => { e.stopPropagation(); dispatch({ type: 'SET_SHOW_ORIGINAL', show: true }); }}
                onTouchEnd={() => dispatch({ type: 'SET_SHOW_ORIGINAL', show: false })}
                style={{ cursor: 'pointer' }}
              >
                <div className="absolute top-2 left-1/2 -translate-x-1/2 border border-white/20 bg-black/60 px-3 py-1 text-xs text-white pointer-events-none">
                  {state.showOriginal ? 'Original' : 'Dithered'} — hold Space or click to compare
                </div>
              </div>
            )}
          </>
        )}

        {/* Loading skeleton */}
        {state.processing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
            <div className="flex items-center gap-3 border border-(--color-border) bg-(--color-bg-secondary) px-5 py-3">
              <div className="h-4 w-4 animate-spin border-2 border-(--color-accent) border-t-transparent" />
              <span className="text-xs font-medium text-(--color-text)">[ PROCESSING... ]</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom toolbar */}
      <div className="flex items-center justify-between border-t border-(--color-border) bg-(--color-bg-secondary) px-3 py-2">
        <div className="flex items-center gap-0 border border-(--color-border)">
          {(['slider', 'side-by-side', 'toggle'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => dispatch({ type: 'SET_COMPARISON_MODE', mode })}
              className={`px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                state.comparisonMode === mode
                  ? 'bg-(--color-accent) text-(--color-accent-text)'
                  : 'text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-tertiary)'
              }`}
            >
              {mode === 'side-by-side' ? 'Side by Side' : mode}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_PIXEL_GRID' })}
            className={`border border-(--color-border) px-2 py-1 text-xs transition-colors ${
              state.showPixelGrid
                ? 'bg-(--color-accent) text-(--color-accent-text) border-(--color-accent)'
                : 'text-(--color-text-secondary) hover:text-(--color-text)'
            }`}
            title="Toggle pixel grid"
          >
            Grid
          </button>
          <button onClick={zoomOut} className="border border-(--color-border) px-1.5 py-0.5 text-xs text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-tertiary)">-</button>
          <span className="min-w-[3rem] text-center text-xs tabular-nums text-(--color-text-secondary)">
            {Math.round(state.zoom * 100)}%
          </span>
          <button onClick={zoomIn} className="border border-(--color-border) px-1.5 py-0.5 text-xs text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-tertiary)">+</button>
          <button onClick={resetView} className="border border-(--color-border) px-2 py-1 text-xs text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-tertiary)">
            Fit
          </button>
        </div>
      </div>
    </div>
  );
}
