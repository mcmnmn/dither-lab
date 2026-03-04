import type { ErrorDiffusionKernel } from '../types';

export const atkinson: ErrorDiffusionKernel = {
  name: 'Atkinson',
  offset: [2, 2],
  divisor: 8,
  weights: [
    { dx: 1, dy: 0, weight: 1 },
    { dx: 2, dy: 0, weight: 1 },
    { dx: -1, dy: 1, weight: 1 },
    { dx: 0, dy: 1, weight: 1 },
    { dx: 1, dy: 1, weight: 1 },
    { dx: 0, dy: 2, weight: 1 },
  ],
};
