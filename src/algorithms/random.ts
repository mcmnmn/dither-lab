/**
 * Random / noise dithering.
 * Adds random noise to each pixel before quantizing to the palette.
 * Produces a film-grain aesthetic.
 */
export function applyRandomDither(
  imageData: ImageData,
  palette: number[][],
  strength: number = 1.0
): ImageData {
  const { width, height } = imageData;
  const output = new ImageData(width, height);
  const data = imageData.data;
  const noiseRange = 128 * strength;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const noise = (Math.random() - 0.5) * noiseRange;

      const r = Math.max(0, Math.min(255, data[idx] + noise));
      const g = Math.max(0, Math.min(255, data[idx + 1] + noise));
      const b = Math.max(0, Math.min(255, data[idx + 2] + noise));

      const nearest = findNearestColor(r, g, b, palette);
      output.data[idx] = nearest[0];
      output.data[idx + 1] = nearest[1];
      output.data[idx + 2] = nearest[2];
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
