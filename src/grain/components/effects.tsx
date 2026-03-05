import { AsciiSettings } from './panels/AsciiSettings';
import { HalftoneSettings } from './panels/HalftoneSettings';
import { NoiseFieldSettings } from './panels/NoiseFieldSettings';
import { PixelSortSettings } from './panels/PixelSortSettings';
import { CrosshatchSettings } from './panels/CrosshatchSettings';
import { VhsSettings } from './panels/VhsSettings';
import type { GrainEffectId } from '../state/types';

export const EFFECTS: { id: GrainEffectId; label: string }[] = [
  { id: 'ascii', label: 'ASCII' },
  { id: 'halftone', label: 'Halftone' },
  { id: 'noise-field', label: 'Noise Field' },
  { id: 'pixel-sort', label: 'Pixel Sort' },
  { id: 'crosshatch', label: 'Crosshatch' },
  { id: 'vhs', label: 'VHS' },
];

export function EffectSettings({ effect }: { effect: GrainEffectId }) {
  switch (effect) {
    case 'ascii':
      return <AsciiSettings />;
    case 'halftone':
      return <HalftoneSettings />;
    case 'noise-field':
      return <NoiseFieldSettings />;
    case 'pixel-sort':
      return <PixelSortSettings />;
    case 'crosshatch':
      return <CrosshatchSettings />;
    case 'vhs':
      return <VhsSettings />;
  }
}
