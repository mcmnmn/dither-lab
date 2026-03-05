import { useEffect, useRef } from 'react';
import { useGrainState, useGrainDispatch } from '../state/grain-context';
import { getGPUDevice } from '../gpu/device';
import { GrainPipeline } from '../gpu/pipeline';

export function useGrainEngine(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  sourceImage: ImageData | null,
  renderToken: number = 0,
  sourceVideo: HTMLVideoElement | null = null
) {
  const state = useGrainState();
  const dispatch = useGrainDispatch();
  const pipelineRef = useRef<GrainPipeline | null>(null);
  const initRef = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Initialize GPU device + pipeline
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    let destroyed = false;

    (async () => {
      try {
        const device = await getGPUDevice();
        if (destroyed || !canvasRef.current) return;

        const pipeline = new GrainPipeline(device, canvasRef.current);
        pipelineRef.current = pipeline;
        dispatch({ type: 'GRAIN_SET_GPU_READY', ready: true });
      } catch (err) {
        if (!destroyed) {
          dispatch({ type: 'GRAIN_SET_GPU_ERROR', error: (err as Error).message });
        }
      }
    })();

    return () => {
      destroyed = true;
      pipelineRef.current?.destroy();
      pipelineRef.current = null;
      initRef.current = false;
    };
  }, [canvasRef, dispatch]);

  // Upload source image when it changes (or when pipeline becomes ready)
  useEffect(() => {
    if (!pipelineRef.current || !sourceImage) return;
    pipelineRef.current.setSource(sourceImage);
  }, [sourceImage, state.gpuReady]);

  // Re-render when settings change (or when pipeline becomes ready)
  useEffect(() => {
    if (!pipelineRef.current || !sourceImage) return;

    const start = performance.now();
    pipelineRef.current.render(state);
    const elapsed = performance.now() - start;
    dispatch({ type: 'GRAIN_SET_RENDER_TIME', time: elapsed });
  }, [
    sourceImage,
    state.gpuReady,
    state.activeEffect,
    state.halftone,
    state.ascii,
    state.noiseField,
    state.pixelSort,
    state.crosshatch,
    state.vhs,
    state.processing,
    state.postProcessing,
    renderToken,
    dispatch,
  ]);

  // Video frame loop — upload video frames to GPU and render each frame
  useEffect(() => {
    if (!pipelineRef.current || !sourceVideo) return;

    let animId: number;
    let running = true;

    sourceVideo.play().catch(() => {});

    const loop = () => {
      if (!running || !pipelineRef.current) return;
      if (!sourceVideo.paused && !sourceVideo.ended) {
        pipelineRef.current.setVideoFrame(sourceVideo);
        pipelineRef.current.render(stateRef.current);
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(animId);
    };
  }, [sourceVideo, state.gpuReady]);
}
