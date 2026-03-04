/**
 * Simple threshold dithering.
 * Each pixel is compared against a threshold value — no error diffusion.
 */
export function applyThreshold(
  imageData: ImageData,
  palette: number[][],
  threshold: number = 128
): ImageData {
  const { width, height } = imageData;
  const output = new ImageData(width, height);
  const data = imageData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Luminance
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      // For multi-color palette, quantize based on threshold bands
      if (palette.length === 2) {
        const color = lum >= threshold ? palette[1] : palette[0];
        output.data[idx] = color[0];
        output.data[idx + 1] = color[1];
        output.data[idx + 2] = color[2];
      } else {
        const nearest = findNearestColor(r, g, b, palette);
        output.data[idx] = nearest[0];
        output.data[idx + 1] = nearest[1];
        output.data[idx + 2] = nearest[2];
      }
      output.data[idx + 3] = 255;
    }
  }

  return output;
}

function findNearestColor(r: number, g: number, b: number, palette: number[][]): number[] {
  let minDist = Infinity;
  let nearest = palette[0];

  for (const color of palette) {
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
