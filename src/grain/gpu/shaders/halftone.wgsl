struct Uniforms {
  resolution: vec2f,
  dotScale: f32,
  spacing: f32,
  angle: f32,
  brightness: f32,
  contrast: f32,
  shapeType: u32,   // 0=circle, 1=diamond, 2=square
  invert: u32,
  colorMode: u32,   // 0=original, 1=mono
}

@group(0) @binding(0) var srcTexture: texture_2d<f32>;
@group(0) @binding(1) var srcSampler: sampler;
@group(0) @binding(2) var<uniform> params: Uniforms;

@vertex fn vs(@builtin(vertex_index) vi: u32) -> @builtin(position) vec4f {
  // Fullscreen triangle
  let pos = array<vec2f, 3>(vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0));
  return vec4f(pos[vi], 0.0, 1.0);
}

@fragment fn fs(@builtin(position) fragPos: vec4f) -> @location(0) vec4f {
  let uv = fragPos.xy / params.resolution;
  let color = textureSample(srcTexture, srcSampler, uv);
  var rgb = color.rgb;

  // Apply brightness/contrast
  rgb = adjust_brightness_contrast(rgb, params.brightness, params.contrast);

  let lum = luminance(rgb);

  // Rotate coordinates by angle
  let rad = params.angle * 3.14159265 / 180.0;
  let cosA = cos(rad);
  let sinA = sin(rad);
  let centered = fragPos.xy - params.resolution * 0.5;
  let rotated = vec2f(
    centered.x * cosA - centered.y * sinA,
    centered.x * sinA + centered.y * cosA
  );

  // Grid cell
  let cellSize = params.spacing + params.dotScale;
  let cell = floor(rotated / cellSize);
  let cellCenter = (cell + 0.5) * cellSize;
  let offset = rotated - cellCenter;

  // Normalized distance from cell center
  var dist: f32;
  if (params.shapeType == 0u) {
    // Circle
    dist = length(offset) / (cellSize * 0.5);
  } else if (params.shapeType == 1u) {
    // Diamond
    dist = (abs(offset.x) + abs(offset.y)) / (cellSize * 0.5);
  } else {
    // Square
    dist = max(abs(offset.x), abs(offset.y)) / (cellSize * 0.5);
  }

  // Threshold based on luminance
  var threshold = select(lum, 1.0 - lum, params.invert != 0u);
  let dotRadius = threshold * params.dotScale / cellSize;
  let aa = 1.0 / cellSize; // antialiasing width
  let mask = 1.0 - smoothstep(dotRadius - aa, dotRadius + aa, dist);

  // Output color
  var outColor: vec3f;
  if (params.colorMode == 1u) {
    // Mono mode
    outColor = vec3f(mask);
  } else {
    // Original color mode
    outColor = rgb * mask;
  }

  if (params.invert != 0u) {
    outColor = 1.0 - outColor;
  }

  return vec4f(outColor, color.a);
}
