/**
 * Median-cut color quantization.
 * Extracts a representative palette of N colors from an image.
 */
export function medianCut(imageData: ImageData, colorCount: number): number[][] {
  const pixels = extractPixels(imageData);
  if (pixels.length === 0) return [[0, 0, 0]];
  if (colorCount <= 1) return [averageColor(pixels)];

  let buckets: number[][][] = [pixels];

  while (buckets.length < colorCount) {
    // Find the bucket with the largest range in any channel
    let maxRange = -1;
    let maxIdx = 0;

    for (let i = 0; i < buckets.length; i++) {
      const range = channelRange(buckets[i]);
      if (range.maxRange > maxRange) {
        maxRange = range.maxRange;
        maxIdx = i;
      }
    }

    const bucket = buckets[maxIdx];
    if (bucket.length <= 1) break;

    const range = channelRange(bucket);
    const channel = range.channel;

    // Sort by the widest channel
    bucket.sort((a, b) => a[channel] - b[channel]);

    const mid = Math.floor(bucket.length / 2);
    const left = bucket.slice(0, mid);
    const right = bucket.slice(mid);

    buckets.splice(maxIdx, 1, left, right);
  }

  return buckets.map(averageColor);
}

function extractPixels(imageData: ImageData): number[][] {
  const { data, width, height } = imageData;
  const pixels: number[][] = [];
  const step = Math.max(1, Math.floor((width * height) / 10000)); // Sample for perf

  for (let i = 0; i < data.length; i += 4 * step) {
    if (data[i + 3] > 128) { // Skip transparent
      pixels.push([data[i], data[i + 1], data[i + 2]]);
    }
  }

  return pixels;
}

function channelRange(pixels: number[][]): { channel: number; maxRange: number } {
  let minR = 255, maxR = 0, minG = 255, maxG = 0, minB = 255, maxB = 0;

  for (const [r, g, b] of pixels) {
    if (r < minR) minR = r;
    if (r > maxR) maxR = r;
    if (g < minG) minG = g;
    if (g > maxG) maxG = g;
    if (b < minB) minB = b;
    if (b > maxB) maxB = b;
  }

  const ranges = [maxR - minR, maxG - minG, maxB - minB];
  let channel = 0;
  let maxRange = ranges[0];
  if (ranges[1] > maxRange) { channel = 1; maxRange = ranges[1]; }
  if (ranges[2] > maxRange) { channel = 2; maxRange = ranges[2]; }

  return { channel, maxRange };
}

function averageColor(pixels: number[][]): number[] {
  if (pixels.length === 0) return [0, 0, 0];

  let r = 0, g = 0, b = 0;
  for (const [pr, pg, pb] of pixels) {
    r += pr;
    g += pg;
    b += pb;
  }
  const n = pixels.length;
  return [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
}
