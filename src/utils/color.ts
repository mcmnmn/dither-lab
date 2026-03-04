/**
 * Convert RGB array to hex string.
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
}

/**
 * Convert hex string to RGB array.
 */
export function hexToRgb(hex: string): number[] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

/**
 * Generate evenly spaced grayscale palette.
 */
export function generateGrayscalePalette(levels: number): number[][] {
  return Array.from({ length: levels }, (_, i) => {
    const v = Math.round((i / (levels - 1)) * 255);
    return [v, v, v];
  });
}
