import { useEffect, useRef } from 'react';

/**
 * Runs a requestAnimationFrame loop while a video is playing.
 * Calls the callback with the video element each frame.
 */
export function useVideoFrameLoop(
  video: HTMLVideoElement | null,
  callback: (video: HTMLVideoElement) => void
) {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    if (!video) return;

    let animId: number;
    let running = true;

    const loop = () => {
      if (!running) return;
      if (!video.paused && !video.ended) {
        cbRef.current(video);
      }
      animId = requestAnimationFrame(loop);
    };

    // Start playback and loop
    video.play().catch(() => {});
    animId = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(animId);
    };
  }, [video]);
}
