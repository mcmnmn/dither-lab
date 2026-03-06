import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { useGrainState } from '../state/grain-context';
import { useAppState, useAppDispatch } from '../../state/app-context';
import { useZoomPan } from '../../hooks/use-zoom-pan';
import { isWebGPUSupported } from '../gpu/device';
import { useGrainEngine } from '../hooks/use-grain-engine';
import { DropZone } from '../../components/common/DropZone';
import { loadImageFile } from '../../utils/image-io';
import { CanvasToolbar } from '../../components/common/CanvasToolbar';
import { cropImageData } from '../../utils/crop';

interface GrainCanvasProps {
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
}

export function GrainCanvas({ canvasRef: externalCanvasRef }: GrainCanvasProps = {}) {
  const grainState = useGrainState();
  const appState = useAppState();
  const appDispatch = useAppDispatch();
  const { handleWheel, handleMouseDown, handleMouseMove, handleMouseUp } = useZoomPan();
  const internalCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = externalCanvasRef ?? internalCanvasRef;
  const containerRef = useRef<HTMLDivElement>(null);
  const [gpuSupported] = useState(() => isWebGPUSupported());
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number } | null>(null);
  const [renderToken, setRenderToken] = useState(0);

  // Initialize the GPU engine (only runs when canvas is in DOM and GPU is available)
  useGrainEngine(gpuSupported ? canvasRef : { current: null }, appState.sourceImage, renderToken);

  // Compute cropped dimensions for aspect-ratio fitting
  const croppedDims = useMemo(() => {
    if (appState.sourceImage) {
      const cropped = cropImageData(appState.sourceImage, appState.cropAspectRatio);
      return { width: cropped.width, height: cropped.height };
    }
    return null;
  }, [appState.sourceImage, appState.cropAspectRatio]);

  // Resize canvas — fit cropped image aspect ratio within container
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const recalc = () => {
      const { width: cw, height: ch } = container.getBoundingClientRect();
      if (cw <= 0 || ch <= 0) return;

      let fitW = cw;
      let fitH = ch;

      if (croppedDims) {
        const imageAspect = croppedDims.width / croppedDims.height;
        // Always fill container width
        fitW = cw;
        fitH = cw / imageAspect;
      }

      const pw = Math.floor(fitW * devicePixelRatio);
      const ph = Math.floor(fitH * devicePixelRatio);
      if (pw > 0 && ph > 0) {
        canvas.width = pw;
        canvas.height = ph;
        setCanvasSize({ width: fitW, height: fitH });
        setRenderToken(t => t + 1);
      }
    };

    const observer = new ResizeObserver(() => recalc());
    observer.observe(container);
    recalc(); // Initial calculation

    return () => observer.disconnect();
  }, [croppedDims]);

  // Handle clipboard paste
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) handleFiles([file]);
          return;
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleFiles = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    const imageData = await loadImageFile(file);
    appDispatch({ type: 'SET_SOURCE', imageData, file, fileName: file.name });
  }, [appDispatch]);

  // WebGPU not supported fallback
  if (!gpuSupported) {
    return (
      <div className="dot-grid flex h-full items-center justify-center bg-(--color-bg)">
        <div className="max-w-sm text-center">
          <div className="mb-2 font-mono text-2xl text-(--color-border)">[ ! ]</div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-(--color-text)">
            WebGPU Not Available
          </h2>
          <p className="mt-2 text-xs text-(--color-text-secondary)">
            The Effector tool requires WebGPU, which is available in Chrome, Edge, and Firefox (latest versions).
          </p>
        </div>
      </div>
    );
  }

  const hasSource = !!appState.sourceImage;

  // Compute canvas style with zoom/pan
  const canvasStyle: React.CSSProperties | undefined = canvasSize ? {
    width: canvasSize.width,
    height: canvasSize.height,
    transform: `translate(-50%, -50%) translate(${appState.panX}px, ${appState.panY}px) scale(${appState.zoom})`,
    transformOrigin: 'center center',
  } : undefined;

  return (
    <div className="dot-grid flex h-full flex-col bg-(--color-bg)">
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden cursor-grab active:cursor-grabbing"
        onWheel={handleWheel as unknown as React.WheelEventHandler<HTMLDivElement>}
        onMouseDown={handleMouseDown as unknown as React.MouseEventHandler<HTMLDivElement>}
        onMouseMove={handleMouseMove as unknown as React.MouseEventHandler<HTMLDivElement>}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* WebGPU canvas — always mounted for GPU init, centered with aspect ratio */}
        <canvas
          ref={canvasRef}
          className={`absolute left-1/2 top-1/2 ${hasSource ? '' : 'hidden'}`}
          style={canvasStyle}
        />

        {/* Drop zone overlay when no source */}
        {!hasSource && (
          <DropZone onFiles={handleFiles} className="absolute inset-0 flex cursor-pointer items-center justify-center">
            <div className="text-center">
              <div className="mb-1 font-mono text-lg text-(--color-border)">[ &nbsp;+ &nbsp;]</div>
              <p className="font-mono text-xs text-(--color-text-secondary)">
                Drop a file here, click to browse, or paste from clipboard
              </p>
              <p className="mt-1 font-mono text-[10px] text-(--color-text-secondary)/60">
                PNG, JPG, WebP, GIF
              </p>
            </div>
          </DropZone>
        )}

        {/* GPU error banner */}
        {grainState.gpuError && (
          <div className="absolute inset-x-0 bottom-0 bg-red-900/80 px-4 py-2 text-xs text-red-200">
            GPU Error: {grainState.gpuError}
          </div>
        )}

        {/* Render time indicator */}
        {hasSource && grainState.renderTime > 0 && (
          <div className="pointer-events-none absolute bottom-2 right-2 font-mono text-[10px] text-(--color-text-secondary)/50">
            {grainState.renderTime.toFixed(1)}ms
          </div>
        )}
      </div>

      <CanvasToolbar />
    </div>
  );
}
