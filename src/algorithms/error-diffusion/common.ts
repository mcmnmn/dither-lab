import type { ErrorDiffusionKernel } from '../types';

/**
 * Shared error-diffusion dithering loop.
 * All error-diffusion algorithms use this same loop — they just provide
 * different kernels (weight distributions).
 */
export function applyErrorDiffusion(
  imageData: ImageData,
  palette: number[][],
  kernel: ErrorDiffusionKernel,
  strength: number = 1.0
): ImageData {
  const { width, height } = imageData;
  const pixels = new Float32Array(imageData.data.length);

  // Copy to float buffer for error accumulation
  for (let i = 0; i < imageData.data.length; i++) {
    pixels[i] = imageData.data[i];
  }

  const output = new ImageData(width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      const oldR = Math.max(0, Math.min(255, pixels[idx]));
      const oldG = Math.max(0, Math.min(255, pixels[idx + 1]));
      const oldB = Math.max(0, Math.min(255, pixels[idx + 2]));

      // Find nearest palette color
      const nearest = findNearestColor(oldR, oldG, oldB, palette);

      output.data[idx] = nearest[0];
      output.data[idx + 1] = nearest[1];
      output.data[idx + 2] = nearest[2];
      output.data[idx + 3] = 255;

      // Calculate quantization error
      const errR = (oldR - nearest[0]) * strength;
      const errG = (oldG - nearest[1]) * strength;
      const errB = (oldB - nearest[2]) * strength;

      // Distribute error to neighboring pixels
      for (const { dx, dy, weight } of kernel.weights) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nIdx = (ny * width + nx) * 4;
          const factor = weight / kernel.divisor;
          pixels[nIdx] += errR * factor;
          pixels[nIdx + 1] += errG * factor;
          pixels[nIdx + 2] += errB * factor;
        }
      }
    }
  }

  return output;
}

function findNearestColor(r: number, g: number, b: number, palette: number[][]): number[] {
  let minDist = Infinity;
  let nearest = palette[0];

  for (const color of palette) {
    // Weighted Euclidean distance (human perception)
    const dr = r - color[0];
    const dg = g - color[1];
    const db = b - color[2];
    const dist = 2 * dr * dr + 4 * dg * dg + 3 * db * db;
    if (dist < minDist) {
      minDist = dist;
      nearest = color;
    }
  }

  return nearest;
}
