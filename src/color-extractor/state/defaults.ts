import type { ColorExtractorState } from './types';

export const DEFAULT_COLOR_COUNT = 5;

export const colorExtractorInitialState: ColorExtractorState = {
  sourceImage: null,
  fileName: '',
  colors: [],
  colorCount: DEFAULT_COLOR_COUNT,
  hoveredColor: null,
  hoveredPosition: null,
  exportFormat: 'hex',
  extracting: false,
};
