import type { SourceMediaType } from '../state/types';

const VIDEO_TYPES = ['video/mp4', 'video/webm'];

/** Detect media type from a File's MIME type and extension */
export function detectMediaType(file: File): SourceMediaType {
  if (file.name.toLowerCase().endsWith('.glb')) return 'glb';
  if (VIDEO_TYPES.includes(file.type)) return 'video';
  return 'image';
}

/** Check if a file is an accepted media type */
export function isAcceptedMedia(file: File): boolean {
  if (file.type.startsWith('image/')) return true;
  if (VIDEO_TYPES.includes(file.type)) return true;
  if (file.name.toLowerCase().endsWith('.glb')) return true;
  return false;
}

/** Load a video file and return an HTMLVideoElement ready for playback */
export function loadVideoFile(file: File): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);

    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'auto';

    video.onloadeddata = () => {
      resolve(video);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load video: ${file.name}`));
    };

    video.src = url;
  });
}

/** Capture the current frame of a video as ImageData */
export function captureVideoFrame(video: HTMLVideoElement): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(video, 0, 0);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/** Accept string for file inputs that covers all supported media types */
export const MEDIA_ACCEPT = 'image/*,video/mp4,video/webm,.glb';
