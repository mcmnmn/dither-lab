import { useCallback } from 'react';
import { useAppState, useAppDispatch } from '../../state/app-context';
import { useVideoFrameLoop } from '../../hooks/use-video-frame-loop';
import { captureVideoFrame } from '../../utils/media-io';

/**
 * Video frame capture for the Dither tool.
 * Captures each video frame as ImageData and dispatches SET_VIDEO_FRAME
 * so the dither pipeline processes it in real-time.
 * (Play/pause UI is handled separately by VideoControls.)
 */
export function VideoOverlay() {
  const state = useAppState();
  const dispatch = useAppDispatch();

  const onFrame = useCallback((v: HTMLVideoElement) => {
    const imageData = captureVideoFrame(v);
    dispatch({ type: 'SET_VIDEO_FRAME', imageData });
  }, [dispatch]);

  useVideoFrameLoop(state.sourceVideo, onFrame);

  return null;
}
