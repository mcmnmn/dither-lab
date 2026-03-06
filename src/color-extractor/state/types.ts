export type PaletteOutputFormat = 'css' | 'json' | 'hex' | 'tailwind';

export interface ExtractedColor {
  rgb: [number, number, number];
  hex: string;
  locked: boolean;
  imagePosition?: { x: number; y: number }; // pixel coords in source image
}

export interface ColorExtractorState {
  sourceImage: ImageData | null;
  fileName: string;
  colors: ExtractedColor[];
  colorCount: number;
  hoveredColor: [number, number, number] | null;
  hoveredPosition: { x: number; y: number } | null;
  exportFormat: PaletteOutputFormat;
  extracting: boolean;
}

export type ColorExtractorAction =
  | { type: 'CE_SET_SOURCE'; imageData: ImageData; fileName: string }
  | { type: 'CE_SET_COLORS'; colors: ExtractedColor[] }
  | { type: 'CE_SET_COLOR_COUNT'; count: number }
  | { type: 'CE_SET_HOVERED_COLOR'; rgb: [number, number, number] | null; position: { x: number; y: number } | null }
  | { type: 'CE_ADD_PICKED_COLOR'; rgb: [number, number, number]; imagePosition: { x: number; y: number } }
  | { type: 'CE_UPDATE_COLOR'; index: number; rgb: [number, number, number]; imagePosition: { x: number; y: number } }
  | { type: 'CE_REMOVE_COLOR'; index: number }
  | { type: 'CE_TOGGLE_LOCK'; index: number }
  | { type: 'CE_SET_EXPORT_FORMAT'; format: PaletteOutputFormat }
  | { type: 'CE_SET_EXTRACTING'; extracting: boolean }
  | { type: 'CE_LOAD_STATE'; state: Partial<ColorExtractorState> };
