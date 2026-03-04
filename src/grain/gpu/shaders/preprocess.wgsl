// Pre-processing shader: invert, brightness map, edge enhance, blur, quantize
// Applied to source image BEFORE the main effect

@group(0) @binding(0) var srcTexture: texture_2d<f32>;
@group(0) @binding(1) var srcSampler: sampler;
@group(0) @binding(2) var<uniform> u: PreUniforms;

struct PreUniforms {
  resolution: vec2f,   // 0-7
  invert: f32,         // 8-11    (0 or 1)
  brightnessMap: f32,  // 12-15   (0-2, default ~0.9)
  edgeEnhance: f32,    // 16-19   (0-20)
  blur: f32,           // 20-23   (0-10)
  quantize: f32,       // 24-27   (0-32, 0=off)
  _pad: f32,           // 28-31
}

struct VsOut {
  @builtin(position) pos: vec4f,
  @location(0) uv: vec2f,
}

@vertex fn vs(@builtin(vertex_index) vi: u32) -> VsOut {
  let positions = array<vec2f, 3>(vec2f(-1, -1), vec2f(3, -1), vec2f(-1, 3));
  let uvs = array<vec2f, 3>(vec2f(0, 1), vec2f(2, 1), vec2f(0, -1));
  var out: VsOut;
  out.pos = vec4f(positions[vi], 0, 1);
  out.uv = uvs[vi];
  return out;
}

@fragment fn fs(@location(0) uv: vec2f) -> @location(0) vec4f {
  let texel = 1.0 / u.resolution;
  var col: vec3f;

  // ── Blur (box blur approximation) ──
  if (u.blur > 0.5) {
    let radius = u.blur;
    let steps = i32(ceil(radius));
    var total = vec3f(0.0);
    var weight = 0.0;
    for (var dy = -steps; dy <= steps; dy++) {
      for (var dx = -steps; dx <= steps; dx++) {
        let offset = vec2f(f32(dx), f32(dy)) * texel;
        let d = length(vec2f(f32(dx), f32(dy)));
        let w = max(0.0, 1.0 - d / (radius + 0.5));
        total += textureSample(srcTexture, srcSampler, uv + offset).rgb * w;
        weight += w;
      }
    }
    col = total / weight;
  } else {
    col = textureSample(srcTexture, srcSampler, uv).rgb;
  }

  // ── Invert ──
  if (u.invert > 0.5) {
    col = 1.0 - col;
  }

  // ── Brightness Map ──
  if (abs(u.brightnessMap - 1.0) > 0.01) {
    col = pow(col, vec3f(1.0 / max(u.brightnessMap, 0.01)));
  }

  // ── Edge Enhance (Laplacian sharpening) ──
  if (u.edgeEnhance > 0.5) {
    let strength = u.edgeEnhance * 0.1;
    let center = col;
    let up    = textureSample(srcTexture, srcSampler, uv + vec2f(0, -texel.y)).rgb;
    let down  = textureSample(srcTexture, srcSampler, uv + vec2f(0,  texel.y)).rgb;
    let left  = textureSample(srcTexture, srcSampler, uv + vec2f(-texel.x, 0)).rgb;
    let right = textureSample(srcTexture, srcSampler, uv + vec2f( texel.x, 0)).rgb;
    let edge = center * 4.0 - up - down - left - right;
    col = clamp(col + edge * strength, vec3f(0.0), vec3f(1.0));
  }

  // ── Quantize Colors ──
  if (u.quantize > 1.5) {
    let levels = u.quantize;
    col = floor(col * levels) / (levels - 1.0);
  }

  return vec4f(clamp(col, vec3f(0.0), vec3f(1.0)), 1.0);
}
