import { useState, useCallback, useEffect } from 'react';

interface VideoControlsProps {
  video: HTMLVideoElement;
}

/** Simple play/pause overlay for video sources */
export function VideoControls({ video }: VideoControlsProps) {
  const [paused, setPaused] = useState(video.paused);

  useEffect(() => {
    const onPlay = () => setPaused(false);
    const onPause = () => setPaused(true);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
    };
  }, [video]);

  const toggle = useCallback(() => {
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [video]);

  return (
    <button
      onClick={toggle}
      className="absolute bottom-14 left-1/2 -translate-x-1/2 z-10 border border-(--color-border) bg-(--color-bg-secondary)/90 px-4 py-1.5 text-xs font-medium uppercase text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-tertiary) transition-colors"
    >
      {paused ? '[ Play ]' : '[ Pause ]'}
    </button>
  );
}
