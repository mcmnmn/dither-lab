import type { ToolId } from './types';

export interface ToolDefinition {
  id: ToolId;
  label: string;
  shortLabel: string;
  available: boolean;
}

export const TOOLS: ToolDefinition[] = [
  { id: 'dither',   label: 'DITHER',     shortLabel: 'Dither',   available: true  },
  { id: 'grain',    label: 'EFFECTOR',   shortLabel: 'Effector', available: true  },
  { id: 'gradient', label: 'GRADIENT',   shortLabel: 'Gradient', available: false },
];

export function getToolById(id: ToolId): ToolDefinition {
  return TOOLS.find(t => t.id === id)!;
}
