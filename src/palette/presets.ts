import type { PalettePreset } from './types';

export const PALETTE_PRESETS: PalettePreset[] = [
  {
    id: 'bw-dither',
    name: 'Black & White',
    colors: [[0, 0, 0], [255, 255, 255]],
  },
  {
    id: 'rgb-dither',
    name: 'RGB',
    colors: [
      [0, 0, 0], [255, 0, 0], [0, 255, 0], [0, 0, 255], [255, 255, 255],
    ],
  },
  {
    id: 'cmyk-dither',
    name: 'CMYK',
    colors: [
      [0, 0, 0], [255, 255, 0], [0, 255, 255], [255, 0, 255], [255, 255, 255],
    ],
  },
  {
    id: '3bit-dither',
    name: '3 Bit',
    colors: [
      [0, 0, 0], [255, 255, 255], [0, 255, 0], [255, 0, 0],
      [0, 0, 255], [255, 255, 0], [255, 0, 255], [0, 255, 255],
    ],
  },
  {
    id: 'gameboy',
    name: 'GameBoy',
    colors: [
      [15, 56, 15], [48, 98, 48], [139, 172, 15], [155, 188, 15],
    ],
  },
  {
    id: 'teletext',
    name: 'Teletext',
    colors: [
      [0, 0, 0], [255, 255, 255], [0, 255, 0], [255, 0, 0],
      [0, 0, 255], [255, 255, 0], [255, 0, 255], [0, 255, 255],
    ],
  },
  {
    id: 'apple-ii',
    name: 'Apple II',
    colors: [
      [0, 0, 0], [67, 195, 0], [182, 61, 255], [234, 93, 21],
      [16, 164, 227], [255, 255, 255],
    ],
  },
  {
    id: 'commodore-64',
    name: 'Commodore 64',
    colors: [
      [0, 0, 0], [255, 255, 255], [136, 57, 50], [103, 182, 189],
      [139, 63, 150], [85, 160, 73], [64, 49, 141], [191, 206, 114],
      [139, 84, 41], [87, 66, 0], [184, 105, 98], [80, 80, 80],
      [120, 120, 120], [148, 224, 137], [120, 105, 196], [159, 159, 159],
    ],
  },
  {
    id: 'zx-spectrum',
    name: 'ZX Spectrum',
    colors: [
      [0, 0, 0], [0, 0, 255], [255, 0, 0], [255, 0, 255],
      [0, 255, 0], [0, 255, 255], [255, 255, 0], [255, 255, 255],
      [0, 0, 215], [215, 0, 0], [215, 0, 215],
      [0, 215, 0], [0, 215, 215], [215, 215, 0], [215, 215, 215],
    ],
  },
  {
    id: '6bit-rgb',
    name: '6 Bit RGB',
    colors: (() => {
      // 4 levels per channel: 0x00, 0x55, 0xAA, 0xFF
      const levels = [0x00, 0x55, 0xAA, 0xFF];
      const colors: number[][] = [];
      for (let r = 0; r < 4; r++)
        for (let g = 0; g < 4; g++)
          for (let b = 0; b < 4; b++)
            colors.push([levels[r], levels[g], levels[b]]);
      return colors;
    })(),
  },
  {
    id: 'vaporwave',
    name: 'Vaporwave',
    colors: [
      [254, 49, 153], [53, 25, 144], [245, 233, 97],
      [210, 179, 207], [255, 173, 92], [108, 255, 185],
    ],
  },
  {
    id: 'hacker',
    name: 'Hacker',
    colors: [[0, 0, 0], [0, 255, 0]],
  },
];
