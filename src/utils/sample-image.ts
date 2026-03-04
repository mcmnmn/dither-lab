const FIRST_VISIT_KEY = 'dither-lab-visited';

export function isFirstVisit(): boolean {
  return !localStorage.getItem(FIRST_VISIT_KEY);
}

export function markVisited() {
  localStorage.setItem(FIRST_VISIT_KEY, '1');
}

/**
 * Generate a colorful gradient test image procedurally.
 * Creates smooth HSL hue sweep with luminance gradient.
 */
export function generateSampleImage(width = 512, height = 512): ImageData {
  const imageData = new ImageData(width, height);
  const data = imageData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const hue = (x / width) * 360;
      const lightness = 1 - y / height;
      const saturation = 1;

      const [r, g, b] = hslToRgb(hue, saturation, lightness);
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }

  return imageData;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}
