import type { ErrorDiffusionKernel } from '../types';

export const burkes: ErrorDiffusionKernel = {
  name: 'Burkes',
  offset: [2, 1],
  divisor: 32,
  weights: [
    { dx: 1, dy: 0, weight: 8 },
    { dx: 2, dy: 0, weight: 4 },
    { dx: -2, dy: 1, weight: 2 },
    { dx: -1, dy: 1, weight: 4 },
    { dx: 0, dy: 1, weight: 8 },
    { dx: 1, dy: 1, weight: 4 },
    { dx: 2, dy: 1, weight: 2 },
  ],
};
