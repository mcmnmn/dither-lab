import { useRef, useEffect, useCallback, useState } from 'react';
import { useAppState, useAppDispatch } from '../../state/app-context';
import { useZoomPan } from '../../hooks/use-zoom-pan';
import { DropZone } from '../common/DropZone';
import { VideoOverlay } from './VideoOverlay';
import { VideoControls } from '../common/VideoControls';
import { GlbViewer } from './GlbViewer';
import { loadImageFile } from '../../utils/image-io';
import { detectMediaType, loadVideoFile } from '../../utils/media-io';
import { loadSampleImage } from '../../utils/sample-image';
import { CanvasToolbar } from '../common/CanvasToolbar';

const MAX_WARN = 4096;
const MAX_REJECT = 8192;

export function PreviewCanvas() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { handleWheel, handleMouseDown, handleMouseMove, handleMouseUp } = useZoomPan();
  const [sizeWarning, setSizeWarning] = useState<string | null>(null);
  const [renderToken, setRenderToken] = useState(0);

  // Preload sample image when no source is set
  useEffect(() => {
    if (!state.sourceImage && !state.sourceVideo && !state.sourceGlbUrl) {
      loadSampleImage().then(sample => {
        dispatch({ type: 'SET_SOURCE', imageData: sample, file: null, fileName: 'sample.jpg' });
      });
    }
  }, []);

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

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Show original when Space is held (toggle mode)
    const imageData = (state.showOriginal && state.sourceImage)
      ? state.sourceImage
      : state.resultImage;

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

    ctx.fillStyle = state.bgColor;
    ctx.fillRect(x, y, drawW, drawH);
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
  }, [state.resultImage, state.sourceImage, state.zoom, state.panX, state.panY, state.showPixelGrid, state.showOriginal, state.bgColor, renderToken]);

  // Resize observer — increment renderToken to trigger redraw after canvas is cleared
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => {
      setRenderToken(t => t + 1);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const hasSource = state.sourceImage || state.sourceVideo || state.sourceGlbUrl;

  if (!hasSource) {
    return (
      <DropZone
        onFiles={handleFiles}
        className="dot-grid flex h-full cursor-pointer items-center justify-center bg-(--color-bg)"
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
      <div className="dot-grid flex h-full flex-col bg-(--color-bg)">
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
      <div className="dot-grid flex h-full flex-col bg-(--color-bg)">
        <GlbViewer glbUrl={state.sourceGlbUrl} fileName={state.fileName} />
      </div>
    );
  }

  return (
    <div className="dot-grid flex h-full flex-col bg-(--color-bg)">
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
        <canvas ref={canvasRef} className="absolute inset-0" />
        {/* Show label when holding Space to compare */}
        {state.showOriginal && state.sourceImage && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 border border-white/20 bg-black/60 px-3 py-1 text-xs text-white pointer-events-none">
            Original — release Space to return
          </div>
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

      <CanvasToolbar />
    </div>
  );
}
