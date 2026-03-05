import type { CustomMatrix } from '../algorithms/types';
import type { PaletteMode } from '../palette/types';

export type ComparisonMode = 'slider' | 'side-by-side' | 'toggle';
export type AppMode = 'single' | 'batch';
export type ExportFormat = 'png' | 'jpg' | 'gif' | 'webp';
export type ThemeId = 'butterlite' | 'noir' | 'vt320' | 'cassette';
export type ToolId = 'dither' | 'grain' | 'gradient';
export type SourceMediaType = 'image' | 'video' | 'glb';
export type CropAspectRatio = 'original' | '16:9' | '4:3' | '1:1' | '3:4' | '9:16';

export interface BatchItem {
  id: string;
  file: File;
  status: 'queued' | 'processing' | 'done' | 'error';
  result?: ImageData;
  error?: string;
  thumbnailUrl?: string;
  previewUrl?: string;
}

export interface AppState {
  // Mode
  mode: AppMode;

  // Source media
  sourceMediaType: SourceMediaType;
  sourceImage: ImageData | null;
  sourceVideo: HTMLVideoElement | null;
  sourceGlbUrl: string | null;
  sourceFile: File | null;
  fileName: string;

  // Dither settings
  algorithmId: string;
  paletteMode: PaletteMode;
  presetId: string;
  manualColors: number[][];
  colorCount: number;
  strength: number;
  threshold: number;
  customMatrix: CustomMatrix | null;

  // Preview
  comparisonMode: ComparisonMode;
  showOriginal: boolean; // toggle mode: true = show original, false = show dithered
  zoom: number;
  panX: number;
  panY: number;
  showPixelGrid: boolean;
  cropAspectRatio: CropAspectRatio;
  bgColor: string;

  // Result
  resultImage: ImageData | null;
  processing: boolean;
  processingTime: number;

  // Batch
  batchQueue: BatchItem[];
  batchProcessing: boolean;
  batchProgress: number;

  // Export
  exportFormat: ExportFormat;
  exportScale: number;

  // Theme
  theme: ThemeId;

  // Active tool
  activeTool: ToolId;

  // Undo/redo
  history: SettingsSnapshot[];
  historyIndex: number;
}

export interface SettingsSnapshot {
  algorithmId: string;
  paletteMode: PaletteMode;
  presetId: string;
  manualColors: number[][];
  colorCount: number;
  strength: number;
  threshold: number;
}

export type AppAction =
  | { type: 'SET_SOURCE'; imageData: ImageData; file: File | null; fileName: string }
  | { type: 'SET_VIDEO_SOURCE'; videoElement: HTMLVideoElement; file: File; fileName: string }
  | { type: 'SET_GLB_SOURCE'; glbUrl: string; file: File; fileName: string }
  | { type: 'SET_VIDEO_FRAME'; imageData: ImageData }
  | { type: 'SET_RESULT'; imageData: ImageData; duration: number }
  | { type: 'SET_PROCESSING'; processing: boolean }
  | { type: 'SET_ALGORITHM'; algorithmId: string }
  | { type: 'SET_PALETTE_MODE'; mode: PaletteMode }
  | { type: 'SET_PRESET'; presetId: string }
  | { type: 'SET_MANUAL_COLORS'; colors: number[][] }
  | { type: 'SET_COLOR_COUNT'; count: number }
  | { type: 'SET_STRENGTH'; strength: number }
  | { type: 'SET_THRESHOLD'; threshold: number }
  | { type: 'SET_CUSTOM_MATRIX'; matrix: CustomMatrix | null }
  | { type: 'SET_COMPARISON_MODE'; mode: ComparisonMode }
  | { type: 'SET_SHOW_ORIGINAL'; show: boolean }
  | { type: 'SET_ZOOM'; zoom: number }
  | { type: 'SET_PAN'; x: number; y: number }
  | { type: 'TOGGLE_PIXEL_GRID' }
  | { type: 'SET_MODE'; mode: AppMode }
  | { type: 'SET_EXPORT_FORMAT'; format: ExportFormat }
  | { type: 'SET_EXPORT_SCALE'; scale: number }
  | { type: 'SET_THEME'; theme: ThemeId }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'ADD_BATCH_ITEMS'; items: BatchItem[] }
  | { type: 'UPDATE_BATCH_ITEM'; id: string; updates: Partial<BatchItem> }
  | { type: 'CLEAR_BATCH' }
  | { type: 'SET_BATCH_PROCESSING'; processing: boolean }
  | { type: 'SET_BATCH_PROGRESS'; progress: number }
  | { type: 'SET_ACTIVE_TOOL'; tool: ToolId }
  | { type: 'SET_CROP_ASPECT_RATIO'; ratio: CropAspectRatio }
  | { type: 'SET_BG_COLOR'; color: string }
  | { type: 'LOAD_STATE'; state: Partial<AppState> };
