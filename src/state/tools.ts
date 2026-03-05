import type { ToolId } from './types';
import type { GrainEffectId } from '../grain/state/types';

export interface ToolDefinition {
  id: ToolId;
  label: string;
  shortLabel: string;
  available: boolean;
}

export const TOOLS: ToolDefinition[] = [
  { id: 'dither',      label: 'DITHER',      shortLabel: 'Dither',      available: true },
  { id: 'ascii',       label: 'ASCII',       shortLabel: 'ASCII',       available: true },
  { id: 'halftone',    label: 'HALFTONE',    shortLabel: 'Halftone',    available: true },
  { id: 'noise-field', label: 'NOISE FIELD', shortLabel: 'Noise Field', available: true },
  { id: 'pixel-sort',  label: 'PIXEL SORT',  shortLabel: 'Pixel Sort',  available: true },
  { id: 'crosshatch',  label: 'CROSSHATCH',  shortLabel: 'Crosshatch',  available: true },
  { id: 'vhs',         label: 'VHS',         shortLabel: 'VHS',         available: true },
  { id: 'matrix-rain', label: 'MATRIX RAIN', shortLabel: 'Matrix Rain', available: true },
];

const EFFECT_TOOL_IDS: Set<ToolId> = new Set([
  'ascii', 'halftone', 'noise-field', 'pixel-sort', 'crosshatch', 'vhs', 'matrix-rain',
]);

export function getToolById(id: ToolId): ToolDefinition {
  return TOOLS.find(t => t.id === id)!;
}

export function isEffectTool(id: ToolId): boolean {
  return EFFECT_TOOL_IDS.has(id);
}

export function toGrainEffectId(id: ToolId): GrainEffectId {
  return id as unknown as GrainEffectId;
}
