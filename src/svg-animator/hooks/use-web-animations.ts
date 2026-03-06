import { useRef, useCallback, useEffect } from 'react';
import { WebAnimationEngine } from '../engine/web-animation-engine';
import type { AnimationConfig } from '../engine/animation-generator';

export function useWebAnimations(
  containerRef: React.RefObject<HTMLDivElement | null>,
  config: AnimationConfig | null,
  visibleElements: boolean[],
  playing: boolean,
  generation: number,
) {
  const engineRef = useRef<WebAnimationEngine | null>(null);

  const getEngine = useCallback(() => {
    if (!engineRef.current) {
      engineRef.current = new WebAnimationEngine();
    }
    return engineRef.current;
  }, []);

  // Apply animations when config or generation changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !config) return;

    const engine = getEngine();
    engine.apply(container, config, visibleElements);

    if (!playing) {
      engine.pause();
    }

    return () => {
      engine.dispose();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, visibleElements, generation]);

  // Sync play/pause state
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (playing) {
      engine.play();
    } else {
      engine.pause();
    }
  }, [playing]);

  const seekTo = useCallback((fraction: number) => {
    engineRef.current?.seekTo(fraction);
  }, []);

  const restart = useCallback(() => {
    engineRef.current?.restart();
  }, []);

  const stepForward = useCallback((ms = 16) => {
    engineRef.current?.stepForward(ms);
  }, []);

  const stepBackward = useCallback((ms = 16) => {
    engineRef.current?.stepBackward(ms);
  }, []);

  const getTotalDuration = useCallback(() => {
    return engineRef.current?.getTotalDuration() ?? 0;
  }, []);

  const getCurrentTime = useCallback(() => {
    return engineRef.current?.getCurrentTime() ?? 0;
  }, []);

  return { seekTo, restart, stepForward, stepBackward, getTotalDuration, getCurrentTime };
}
