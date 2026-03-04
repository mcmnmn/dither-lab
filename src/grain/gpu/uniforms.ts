/**
 * Create a uniform buffer and write data to it.
 */
export function createUniformBuffer(device: GPUDevice, data: ArrayBuffer, label = 'uniforms'): GPUBuffer {
  const buffer = device.createBuffer({
    label,
    size: Math.ceil(data.byteLength / 16) * 16, // Align to 16 bytes
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(buffer, 0, data);
  return buffer;
}

/**
 * Update an existing uniform buffer with new data.
 */
export function updateUniformBuffer(device: GPUDevice, buffer: GPUBuffer, data: ArrayBuffer): void {
  device.queue.writeBuffer(buffer, 0, data);
}

/**
 * Pack halftone settings into a Float32Array for the uniform buffer.
 * Layout matches the Uniforms struct in halftone.wgsl.
 */
export function packHalftoneUniforms(
  width: number,
  height: number,
  dotScale: number,
  spacing: number,
  angle: number,
  brightness: number,
  contrast: number,
  shapeType: number,
  invert: boolean,
  colorMode: number
): ArrayBuffer {
  const buffer = new ArrayBuffer(48); // 12 floats, padded to 48 bytes
  const f32 = new Float32Array(buffer);
  const u32 = new Uint32Array(buffer);

  f32[0] = width;       // resolution.x
  f32[1] = height;      // resolution.y
  f32[2] = dotScale;    // dotScale
  f32[3] = spacing;     // spacing
  f32[4] = angle;       // angle
  f32[5] = brightness;  // brightness
  f32[6] = contrast;    // contrast
  u32[7] = shapeType;   // shapeType (u32)
  u32[8] = invert ? 1 : 0; // invert (u32)
  u32[9] = colorMode;   // colorMode (u32)

  return buffer;
}

/**
 * Pack crosshatch settings into uniform buffer.
 * Layout matches Uniforms struct in crosshatch.wgsl.
 */
export function packCrosshatchUniforms(
  width: number,
  height: number,
  lineWidth: number,
  spacing: number,
  angle: number,
  layers: number,
  brightness: number,
  contrast: number,
  colorMode: number
): ArrayBuffer {
  const buffer = new ArrayBuffer(48);
  const f32 = new Float32Array(buffer);

  f32[0] = width;
  f32[1] = height;
  f32[2] = lineWidth;
  f32[3] = spacing;
  f32[4] = angle;
  f32[5] = layers;
  f32[6] = brightness;
  f32[7] = contrast;
  f32[8] = colorMode;
  f32[9] = 0; // _pad

  return buffer;
}

/**
 * Pack VHS settings into uniform buffer.
 * Layout matches Uniforms struct in vhs.wgsl.
 */
export function packVhsUniforms(
  width: number,
  height: number,
  tracking: number,
  noise: number,
  colorBleed: number,
  distortion: number,
  brightness: number,
  contrast: number
): ArrayBuffer {
  const buffer = new ArrayBuffer(32);
  const f32 = new Float32Array(buffer);

  f32[0] = width;
  f32[1] = height;
  f32[2] = tracking;
  f32[3] = noise;
  f32[4] = colorBleed;
  f32[5] = distortion;
  f32[6] = brightness;
  f32[7] = contrast;

  return buffer;
}

/**
 * Pack Noise Field settings into uniform buffer.
 * Layout matches Uniforms struct in noise-field.wgsl.
 */
export function packNoiseFieldUniforms(
  width: number,
  height: number,
  scale: number,
  intensity: number,
  octaves: number,
  speed: number,
  time: number,
  distortOnly: boolean,
  brightness: number,
  contrast: number,
  noiseType: number
): ArrayBuffer {
  const buffer = new ArrayBuffer(48);
  const f32 = new Float32Array(buffer);

  f32[0] = width;
  f32[1] = height;
  f32[2] = scale;
  f32[3] = intensity;
  f32[4] = octaves;
  f32[5] = speed;
  f32[6] = time;
  f32[7] = distortOnly ? 1 : 0;
  f32[8] = brightness;
  f32[9] = contrast;
  f32[10] = noiseType;
  f32[11] = 0; // _pad

  return buffer;
}

/**
 * Pack ASCII settings into uniform buffer.
 * Layout matches Uniforms struct in ascii.wgsl (all f32, no vec3f alignment issues).
 */
export function packAsciiUniforms(
  width: number,
  height: number,
  cellSize: number,
  spacing: number,
  intensity: number,
  charSet: number,
  colorMode: number,
  fgColor: [number, number, number],
  bgColor: [number, number, number],
  brightness: number,
  contrast: number
): ArrayBuffer {
  const buffer = new ArrayBuffer(64);
  const f32 = new Float32Array(buffer);

  f32[0] = width;          // resolution.x
  f32[1] = height;         // resolution.y
  f32[2] = cellSize;       // cellSize
  f32[3] = spacing;        // spacing
  f32[4] = intensity;      // intensity
  f32[5] = charSet;        // charSet
  f32[6] = colorMode;      // colorMode
  f32[7] = fgColor[0];     // fgR
  f32[8] = fgColor[1];     // fgG
  f32[9] = fgColor[2];     // fgB
  f32[10] = bgColor[0];    // bgR
  f32[11] = bgColor[1];    // bgG
  f32[12] = bgColor[2];    // bgB
  f32[13] = brightness;    // brightness
  f32[14] = contrast;      // contrast
  f32[15] = 0;             // _pad

  return buffer;
}

/**
 * Pack Pixel Sort settings into uniform buffer.
 * Layout matches Uniforms struct in pixel-sort.wgsl.
 */
export function packPixelSortUniforms(
  width: number,
  height: number,
  threshold: number,
  sortBy: number,
  direction: number,
  randomness: number,
  brightness: number,
  contrast: number
): ArrayBuffer {
  const buffer = new ArrayBuffer(32);
  const f32 = new Float32Array(buffer);

  f32[0] = width;
  f32[1] = height;
  f32[2] = threshold;
  f32[3] = sortBy;
  f32[4] = direction;
  f32[5] = randomness;
  f32[6] = brightness;
  f32[7] = contrast;

  return buffer;
}

/**
 * Parse hex color string to [r, g, b] normalized floats.
 */
export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16) / 255;
  const g = parseInt(h.substring(2, 4), 16) / 255;
  const b = parseInt(h.substring(4, 6), 16) / 255;
  return [r, g, b];
}

/**
 * Pack pre-processing settings into uniform buffer.
 * Layout matches PreUniforms struct in preprocess.wgsl.
 */
export function packPreProcessUniforms(
  width: number,
  height: number,
  invert: boolean,
  brightnessMap: number,
  edgeEnhance: number,
  blur: number,
  quantize: number
): ArrayBuffer {
  const buffer = new ArrayBuffer(32);
  const f32 = new Float32Array(buffer);

  f32[0] = width;
  f32[1] = height;
  f32[2] = invert ? 1 : 0;
  f32[3] = brightnessMap;
  f32[4] = edgeEnhance;
  f32[5] = blur;
  f32[6] = quantize;
  f32[7] = 0; // _pad

  return buffer;
}

/**
 * Pack post-processing settings into uniform buffer.
 * Layout matches PostUniforms struct in postprocess.wgsl.
 */
export function packPostProcessUniforms(
  width: number,
  height: number,
  bloom: { enabled: boolean; threshold: number; intensity: number; radius: number },
  grain: { enabled: boolean; intensity: number; size: number },
  grainTime: number,
  chromatic: { enabled: boolean; offset: number },
  scanlines: { enabled: boolean; opacity: number; spacing: number },
  vignette: { enabled: boolean; intensity: number; radius: number },
  crtCurve: boolean
): ArrayBuffer {
  const buffer = new ArrayBuffer(80); // 20 f32s = 80 bytes
  const f32 = new Float32Array(buffer);

  f32[0] = width;
  f32[1] = height;

  // Bloom
  f32[2] = bloom.enabled ? 1 : 0;
  f32[3] = bloom.threshold;
  f32[4] = bloom.intensity;
  f32[5] = bloom.radius;

  // Film grain
  f32[6] = grain.enabled ? 1 : 0;
  f32[7] = grain.intensity;
  f32[8] = grain.size;
  f32[9] = grainTime;

  // Chromatic
  f32[10] = chromatic.enabled ? 1 : 0;
  f32[11] = chromatic.offset;

  // Scanlines
  f32[12] = scanlines.enabled ? 1 : 0;
  f32[13] = scanlines.opacity;
  f32[14] = scanlines.spacing;

  // Vignette
  f32[15] = vignette.enabled ? 1 : 0;
  f32[16] = vignette.intensity;
  f32[17] = vignette.radius;

  // CRT
  f32[18] = crtCurve ? 1 : 0;
  f32[19] = 0; // _pad

  return buffer;
}

/**
 * Check if pre-processing has any active effects.
 */
export function isPreProcessActive(
  invert: boolean,
  brightnessMap: number,
  edgeEnhance: number,
  blur: number,
  quantize: number
): boolean {
  return invert || Math.abs(brightnessMap - 1.0) > 0.01 || edgeEnhance > 0.5 || blur > 0.5 || quantize > 1.5;
}

/**
 * Check if post-processing has any active effects.
 */
export function isPostProcessActive(
  bloom: { enabled: boolean },
  grain: { enabled: boolean },
  chromatic: { enabled: boolean },
  scanlines: { enabled: boolean },
  vignette: { enabled: boolean },
  crtCurve: boolean
): boolean {
  return bloom.enabled || grain.enabled || chromatic.enabled || scanlines.enabled || vignette.enabled || crtCurve;
}
