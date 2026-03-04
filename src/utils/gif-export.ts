import { GIFEncoder, quantize, applyPalette } from 'gifenc';

/**
 * Export ImageData as a GIF blob using gifenc.
 * Applies quantization and palette mapping for indexed color output.
 */
export function imageDataToGifBlob(
  imageData: ImageData,
  scale: number = 1
): Blob {
  const { width, height, data } = imageData;

  // Upscale with nearest-neighbor if needed
  let srcData: Uint8ClampedArray | Uint8Array = data;
  let srcW = width;
  let srcH = height;

  if (scale > 1) {
    srcW = width * scale;
    srcH = height * scale;
    const scaled = new Uint8Array(srcW * srcH * 4);
    for (let y = 0; y < srcH; y++) {
      const srcY = Math.floor(y / scale);
      for (let x = 0; x < srcW; x++) {
        const srcX = Math.floor(x / scale);
        const si = (srcY * width + srcX) * 4;
        const di = (y * srcW + x) * 4;
        scaled[di] = data[si];
        scaled[di + 1] = data[si + 1];
        scaled[di + 2] = data[si + 2];
        scaled[di + 3] = data[si + 3];
      }
    }
    srcData = scaled;
  }

  // Convert RGBA to RGB for gifenc
  const rgba = new Uint8Array(srcW * srcH * 4);
  for (let i = 0; i < srcW * srcH * 4; i++) {
    rgba[i] = srcData[i];
  }

  // Quantize to 256 colors max
  const palette = quantize(rgba, 256);
  const index = applyPalette(rgba, palette);

  const gif = GIFEncoder();
  gif.writeFrame(index, srcW, srcH, { palette });
  gif.finish();

  const bytes = gif.bytesView();
  return new Blob([bytes.buffer as ArrayBuffer], { type: 'image/gif' });
}
