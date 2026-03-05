import { hslToHex } from '../../utils/color';
import type { HarmonyRule } from '../state/types';

export function generateHarmonyColors(rule: HarmonyRule, count: number): string[] {
  const baseHue = Math.random() * 360;
  let hues: number[];

  switch (rule) {
    case 'analogous':
      hues = Array.from({ length: count }, (_, i) =>
        (baseHue + (i / Math.max(count - 1, 1)) * 60 - 30 + 360) % 360,
      );
      break;

    case 'complementary':
      hues = Array.from({ length: count }, (_, i) =>
        (baseHue + (i % 2 === 0 ? 0 : 180) + Math.random() * 20 - 10 + 360) % 360,
      );
      break;

    case 'split-complementary': {
      const splits = [baseHue, (baseHue + 150) % 360, (baseHue + 210) % 360];
      hues = Array.from({ length: count }, (_, i) =>
        (splits[i % splits.length] + Math.random() * 15 - 7.5 + 360) % 360,
      );
      break;
    }

    case 'triadic': {
      const triads = [baseHue, (baseHue + 120) % 360, (baseHue + 240) % 360];
      hues = Array.from({ length: count }, (_, i) =>
        (triads[i % triads.length] + Math.random() * 15 - 7.5 + 360) % 360,
      );
      break;
    }

    case 'tetradic': {
      const quads = [0, 90, 180, 270].map(offset => (baseHue + offset) % 360);
      hues = Array.from({ length: count }, (_, i) =>
        (quads[i % quads.length] + Math.random() * 15 - 7.5 + 360) % 360,
      );
      break;
    }

    case 'random':
    default:
      hues = Array.from({ length: count }, () => Math.random() * 360);
      break;
  }

  return hues.map(h => {
    const s = 60 + Math.random() * 30;
    const l = 40 + Math.random() * 30;
    return hslToHex(h, s, l);
  });
}
