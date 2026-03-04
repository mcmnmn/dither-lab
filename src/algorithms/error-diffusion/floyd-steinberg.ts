import type { ErrorDiffusionKernel } from '../types';

export const floydSteinberg: ErrorDiffusionKernel = {
  name: 'Floyd-Steinberg',
  offset: [1, 1],
  divisor: 16,
  weights: [
    { dx: 1, dy: 0, weight: 7 },
    { dx: -1, dy: 1, weight: 3 },
    { dx: 0, dy: 1, weight: 5 },
    { dx: 1, dy: 1, weight: 1 },
  ],
};
