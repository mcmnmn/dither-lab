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
  { id: 'vhs',         label: 'RETRO',       shortLabel: 'Retro',       available: false },
  { id: 'color-extractor', label: 'PALETTE',  shortLabel: 'Palette',    available: true },
  { id: 'mesh-gradient', label: 'MESH',       shortLabel: 'Mesh',       available: true },
  { id: 'campaign-generator', label: 'COPYGEN',  shortLabel: 'CopyGen',  available: false },
  { id: 'svg-animator', label: 'SVGMOTION',  shortLabel: 'SVGMotion',  available: true },
  { id: 'screenshot-framer', label: 'IMGFRAME', shortLabel: 'ImgFrame', available: true },
  { id: 'graph-maker', label: 'GRAPHS', shortLabel: 'Graphs', available: true },
  { id: 'resources', label: 'RESOURCES', shortLabel: 'Resources', available: true },
];

const EFFECT_TOOL_IDS: Set<ToolId> = new Set([
  'ascii', 'halftone', 'vhs',
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
