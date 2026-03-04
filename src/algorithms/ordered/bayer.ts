/**
 * Generate a Bayer dithering matrix of size 2^n x 2^n.
 * Uses recursive definition: M(2n) = [4*M(n)+0, 4*M(n)+2; 4*M(n)+3, 4*M(n)+1]
 */
export function generateBayerMatrix(size: number): number[] {
  if (size === 2) {
    return [0, 2, 3, 1];
  }

  const halfSize = size / 2;
  const sub = generateBayerMatrix(halfSize);
  const matrix = new Array(size * size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const subX = x % halfSize;
      const subY = y % halfSize;
      const subVal = sub[subY * halfSize + subX];
      const quadrant = (y < halfSize ? 0 : 1) * 2 + (x < halfSize ? 0 : 1);
      const offsets = [0, 2, 3, 1];
      matrix[y * size + x] = 4 * subVal + offsets[quadrant];
    }
  }

  return matrix;
}

export const BAYER_2x2 = generateBayerMatrix(2);
export const BAYER_4x4 = generateBayerMatrix(4);
export const BAYER_8x8 = generateBayerMatrix(8);
