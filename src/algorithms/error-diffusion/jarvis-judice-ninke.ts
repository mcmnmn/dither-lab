import type { ErrorDiffusionKernel } from '../types';

export const jarvisJudiceNinke: ErrorDiffusionKernel = {
  name: 'Jarvis-Judice-Ninke',
  offset: [2, 2],
  divisor: 48,
  weights: [
    { dx: 1, dy: 0, weight: 7 },
    { dx: 2, dy: 0, weight: 5 },
    { dx: -2, dy: 1, weight: 3 },
    { dx: -1, dy: 1, weight: 5 },
    { dx: 0, dy: 1, weight: 7 },
    { dx: 1, dy: 1, weight: 5 },
    { dx: 2, dy: 1, weight: 3 },
    { dx: -2, dy: 2, weight: 1 },
    { dx: -1, dy: 2, weight: 3 },
    { dx: 0, dy: 2, weight: 5 },
    { dx: 1, dy: 2, weight: 3 },
    { dx: 2, dy: 2, weight: 1 },
  ],
};
