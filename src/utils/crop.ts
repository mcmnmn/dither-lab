import type { CropAspectRatio } from '../state/types';

const RATIO_MAP: Record<CropAspectRatio, number | null> = {
  'original': null,
  '16:9': 16 / 9,
  '4:3': 4 / 3,
  '1:1': 1,
  '3:4': 3 / 4,
  '9:16': 9 / 16,
};

/**
 * Crop ImageData to the largest centered rectangle matching the given aspect ratio.
 * Returns the original ImageData unchanged if ratio is 'original'.
 */
export function cropImageData(imageData: ImageData, ratio: CropAspectRatio): ImageData {
  const targetRatio = RATIO_MAP[ratio];
  if (targetRatio === null) return imageData;

  const { width, height } = imageData;

  let cropW: number;
  let cropH: number;

  if (width / height > targetRatio) {
    cropH = height;
    cropW = Math.round(height * targetRatio);
  } else {
    cropW = width;
    cropH = Math.round(width / targetRatio);
  }

  cropW = Math.max(1, Math.min(cropW, width));
  cropH = Math.max(1, Math.min(cropH, height));

  const offsetX = Math.floor((width - cropW) / 2);
  const offsetY = Math.floor((height - cropH) / 2);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.putImageData(imageData, 0, 0);

  return ctx.getImageData(offsetX, offsetY, cropW, cropH);
}
