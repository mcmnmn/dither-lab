import type { ErrorDiffusionKernel } from '../types';

export const stucki: ErrorDiffusionKernel = {
  name: 'Stucki',
  offset: [2, 2],
  divisor: 42,
  weights: [
    { dx: 1, dy: 0, weight: 8 },
    { dx: 2, dy: 0, weight: 4 },
    { dx: -2, dy: 1, weight: 2 },
    { dx: -1, dy: 1, weight: 4 },
    { dx: 0, dy: 1, weight: 8 },
    { dx: 1, dy: 1, weight: 4 },
    { dx: 2, dy: 1, weight: 2 },
    { dx: -2, dy: 2, weight: 1 },
    { dx: -1, dy: 2, weight: 2 },
    { dx: 0, dy: 2, weight: 4 },
    { dx: 1, dy: 2, weight: 2 },
    { dx: 2, dy: 2, weight: 1 },
  ],
};
