/**
 * Load an image file into ImageData via an offscreen canvas.
 */
export function loadImageFile(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      URL.revokeObjectURL(url);
      resolve(imageData);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image: ${file.name}`));
    };

    img.src = url;
  });
}

/**
 * Downscale ImageData to fit within maxDim while preserving aspect ratio.
 */
export function downscaleImageData(imageData: ImageData, maxDim: number): ImageData {
  const { width, height } = imageData;
  if (width <= maxDim && height <= maxDim) return imageData;

  const scale = Math.min(maxDim / width, maxDim / height);
  const newW = Math.round(width * scale);
  const newH = Math.round(height * scale);

  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = width;
  srcCanvas.height = height;
  const srcCtx = srcCanvas.getContext('2d')!;
  srcCtx.putImageData(imageData, 0, 0);

  const dstCanvas = document.createElement('canvas');
  dstCanvas.width = newW;
  dstCanvas.height = newH;
  const dstCtx = dstCanvas.getContext('2d')!;
  dstCtx.drawImage(srcCanvas, 0, 0, newW, newH);

  return dstCtx.getImageData(0, 0, newW, newH);
}

/**
 * Convert ImageData to a Blob of the given format.
 */
export function imageDataToBlob(
  imageData: ImageData,
  format: 'png' | 'jpg' | 'webp' | 'gif' = 'png',
  scale: number = 1
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const { width, height } = imageData;
    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = width;
    srcCanvas.height = height;
    const srcCtx = srcCanvas.getContext('2d')!;
    srcCtx.putImageData(imageData, 0, 0);

    if (scale !== 1) {
      const outCanvas = document.createElement('canvas');
      outCanvas.width = width * scale;
      outCanvas.height = height * scale;
      const outCtx = outCanvas.getContext('2d')!;
      outCtx.imageSmoothingEnabled = false; // Nearest-neighbor for pixel art
      outCtx.drawImage(srcCanvas, 0, 0, outCanvas.width, outCanvas.height);

      const mimeType = format === 'jpg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
      const quality = format === 'jpg' ? 0.92 : 1.0;
      outCanvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('Failed to create blob')),
        mimeType,
        quality
      );
    } else {
      const mimeType = format === 'jpg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
      const quality = format === 'jpg' ? 0.92 : 1.0;
      srcCanvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('Failed to create blob')),
        mimeType,
        quality
      );
    }
  });
}

/**
 * Trigger a browser download of a Blob.
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Render ImageData onto a canvas element.
 */
export function renderToCanvas(
  canvas: HTMLCanvasElement,
  imageData: ImageData,
  zoom: number = 1,
  panX: number = 0,
  panY: number = 0
) {
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;

  const tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = imageData.width;
  tmpCanvas.height = imageData.height;
  const tmpCtx = tmpCanvas.getContext('2d')!;
  tmpCtx.putImageData(imageData, 0, 0);

  const drawW = imageData.width * zoom;
  const drawH = imageData.height * zoom;
  const x = (canvas.width - drawW) / 2 + panX;
  const y = (canvas.height - drawH) / 2 + panY;

  ctx.drawImage(tmpCanvas, x, y, drawW, drawH);
}
