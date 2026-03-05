import { useRef, useEffect, useCallback, useState } from 'react';
import { useGrainState } from '../state/grain-context';
import { useAppState, useAppDispatch } from '../../state/app-context';
import { isWebGPUSupported } from '../gpu/device';
import { useGrainEngine } from '../hooks/use-grain-engine';
import { DropZone } from '../../components/common/DropZone';
import { VideoControls } from '../../components/common/VideoControls';
import { GlbViewer } from '../../components/canvas/GlbViewer';
import { loadImageFile } from '../../utils/image-io';
import { detectMediaType, loadVideoFile } from '../../utils/media-io';

interface GrainCanvasProps {
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
}

export function GrainCanvas({ canvasRef: externalCanvasRef }: GrainCanvasProps = {}) {
  const grainState = useGrainState();
  const appState = useAppState();
  const appDispatch = useAppDispatch();
  const internalCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = externalCanvasRef ?? internalCanvasRef;
  const containerRef = useRef<HTMLDivElement>(null);
  const [gpuSupported] = useState(() => isWebGPUSupported());
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number } | null>(null);
  const [renderToken, setRenderToken] = useState(0);

  // Initialize the GPU engine (only runs when canvas is in DOM and GPU is available)
  useGrainEngine(gpuSupported ? canvasRef : { current: null }, appState.sourceImage, renderToken, appState.sourceVideo);

  // Resize canvas — fit source image aspect ratio within container
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const recalc = () => {
      const { width: cw, height: ch } = container.getBoundingClientRect();
      if (cw <= 0 || ch <= 0) return;

      let fitW = cw;
      let fitH = ch;

      // Get source dimensions from image or video
      const srcW = appState.sourceImage?.width ?? appState.sourceVideo?.videoWidth;
      const srcH = appState.sourceImage?.height ?? appState.sourceVideo?.videoHeight;

      if (srcW && srcH) {
        const imgW = srcW;
        const imgH = srcH;
        const containerAspect = cw / ch;
        const imageAspect = imgW / imgH;

        if (imageAspect > containerAspect) {
          fitW = cw;
          fitH = cw / imageAspect;
        } else {
          fitH = ch;
          fitW = ch * imageAspect;
        }
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
  }, [appState.sourceImage, appState.sourceVideo]);

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
  }, []);

  const handleFiles = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    const mediaType = detectMediaType(file);
    if (mediaType === 'video') {
      const videoElement = await loadVideoFile(file);
      appDispatch({ type: 'SET_VIDEO_SOURCE', videoElement, file, fileName: file.name });
    } else if (mediaType === 'glb') {
      const glbUrl = URL.createObjectURL(file);
      appDispatch({ type: 'SET_GLB_SOURCE', glbUrl, file, fileName: file.name });
    } else {
      const imageData = await loadImageFile(file);
      appDispatch({ type: 'SET_SOURCE', imageData, file, fileName: file.name });
    }
  }, [appDispatch]);

  // WebGPU not supported fallback
  if (!gpuSupported) {
    return (
      <div className="flex h-full items-center justify-center bg-(--color-bg)">
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

  const hasSource = appState.sourceImage || appState.sourceVideo || appState.sourceGlbUrl;

  // GLB source — show 3D viewer (separate from GPU canvas)
  if (appState.sourceMediaType === 'glb' && appState.sourceGlbUrl) {
    return (
      <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-(--color-bg)">
        <GlbViewer glbUrl={appState.sourceGlbUrl} fileName={appState.fileName} />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-(--color-bg)">
      {/* WebGPU canvas — always mounted for GPU init, centered with aspect ratio */}
      <canvas
        ref={canvasRef}
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${hasSource ? '' : 'hidden'}`}
        style={canvasSize ? { width: canvasSize.width, height: canvasSize.height } : undefined}
      />

      {/* Video controls overlay */}
      {appState.sourceVideo && (
        <VideoControls video={appState.sourceVideo} />
      )}

      {/* Drop zone overlay when no source */}
      {!hasSource && (
        <DropZone onFiles={handleFiles} className="absolute inset-0 flex cursor-pointer items-center justify-center">
          <div className="text-center">
            <div className="mb-1 font-mono text-lg text-(--color-border)">[ &nbsp;+ &nbsp;]</div>
            <p className="font-mono text-xs text-(--color-text-secondary)">
              Drop a file here, click to browse, or paste from clipboard
            </p>
            <p className="mt-1 font-mono text-[10px] text-(--color-text-secondary)/60">
              PNG, JPG, WebP, GIF, MP4, WebM, GLB
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
  );
}
