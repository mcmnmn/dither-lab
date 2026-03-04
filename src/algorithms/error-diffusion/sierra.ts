import type { ErrorDiffusionKernel } from '../types';

export const sierraFull: ErrorDiffusionKernel = {
  name: 'Sierra (Full)',
  offset: [2, 2],
  divisor: 32,
  weights: [
    { dx: 1, dy: 0, weight: 5 },
    { dx: 2, dy: 0, weight: 3 },
    { dx: -2, dy: 1, weight: 2 },
    { dx: -1, dy: 1, weight: 4 },
    { dx: 0, dy: 1, weight: 5 },
    { dx: 1, dy: 1, weight: 4 },
    { dx: 2, dy: 1, weight: 2 },
    { dx: -1, dy: 2, weight: 2 },
    { dx: 0, dy: 2, weight: 3 },
    { dx: 1, dy: 2, weight: 2 },
  ],
};

export const sierraTwoRow: ErrorDiffusionKernel = {
  name: 'Sierra Two-Row',
  offset: [2, 1],
  divisor: 16,
  weights: [
    { dx: 1, dy: 0, weight: 4 },
    { dx: 2, dy: 0, weight: 3 },
    { dx: -2, dy: 1, weight: 1 },
    { dx: -1, dy: 1, weight: 2 },
    { dx: 0, dy: 1, weight: 3 },
    { dx: 1, dy: 1, weight: 2 },
    { dx: 2, dy: 1, weight: 1 },
  ],
};

export const sierraLite: ErrorDiffusionKernel = {
  name: 'Sierra Lite',
  offset: [1, 1],
  divisor: 4,
  weights: [
    { dx: 1, dy: 0, weight: 2 },
    { dx: -1, dy: 1, weight: 1 },
    { dx: 0, dy: 1, weight: 1 },
  ],
};
