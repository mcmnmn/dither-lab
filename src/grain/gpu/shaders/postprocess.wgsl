// Combined post-processing shader
// Applies: bloom (glow), film grain, chromatic aberration, scanlines, vignette, CRT curve
// Uses textureSampleLevel (explicit LOD 0) throughout because CRT's early-return
// creates non-uniform control flow, which forbids implicit-LOD textureSample.

@group(0) @binding(0) var srcTexture: texture_2d<f32>;
@group(0) @binding(1) var srcSampler: sampler;
@group(0) @binding(2) var<uniform> u: PostUniforms;

struct PostUniforms {
  resolution: vec2f,      // 0-7

  // Bloom (simulated single-pass glow)
  bloomEnabled: f32,      // 8
  bloomThreshold: f32,    // 12
  bloomIntensity: f32,    // 16
  bloomRadius: f32,       // 20

  // Film grain
  grainEnabled: f32,      // 24
  grainIntensity: f32,    // 28
  grainSize: f32,         // 32
  grainTime: f32,         // 36   (frame counter for animation)

  // Chromatic aberration
  chromaticEnabled: f32,  // 40
  chromaticOffset: f32,   // 44

  // Scanlines
  scanlinesEnabled: f32,  // 48
  scanlinesOpacity: f32,  // 52
  scanlinesSpacing: f32,  // 56

  // Vignette
  vignetteEnabled: f32,   // 60
  vignetteIntensity: f32, // 64
  vignetteRadius: f32,    // 68

  // CRT
  crtEnabled: f32,        // 72
  _pad: f32,              // 76
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

// Simple hash for grain noise
fn post_hash(p: vec2f) -> f32 {
  var p3 = fract(vec3f(p.x, p.y, p.x) * 0.1031);
  p3 += dot(p3, vec3f(p3.y + 33.33, p3.z + 33.33, p3.x + 33.33));
  return fract((p3.x + p3.y) * p3.z);
}

@fragment fn fs(@location(0) uv: vec2f) -> @location(0) vec4f {
  var coord = uv;

  // ── CRT Barrel Distortion ──
  if (u.crtEnabled > 0.5) {
    let centered = coord * 2.0 - 1.0;
    let r2 = dot(centered, centered);
    let distort = 1.0 + r2 * 0.15 + r2 * r2 * 0.05;
    let curved = centered * distort;
    coord = curved * 0.5 + 0.5;

    // Black outside barrel
    if (coord.x < 0.0 || coord.x > 1.0 || coord.y < 0.0 || coord.y > 1.0) {
      return vec4f(0.0, 0.0, 0.0, 1.0);
    }
  }

  // ── Sample source ──
  var col = textureSampleLevel(srcTexture, srcSampler, coord, 0.0).rgb;

  // ── Chromatic Aberration ──
  if (u.chromaticEnabled > 0.5 && u.chromaticOffset > 0.5) {
    let offset = u.chromaticOffset / u.resolution.x;
    let dir = normalize(coord - 0.5) * offset;
    col = vec3f(
      textureSampleLevel(srcTexture, srcSampler, coord + dir, 0.0).r,
      textureSampleLevel(srcTexture, srcSampler, coord, 0.0).g,
      textureSampleLevel(srcTexture, srcSampler, coord - dir, 0.0).b
    );
  }

  // ── Bloom (single-pass glow approximation) ──
  if (u.bloomEnabled > 0.5 && u.bloomIntensity > 0.01) {
    let texel = 1.0 / u.resolution;
    var glow = vec3f(0.0);
    var totalW = 0.0;
    let steps = i32(min(u.bloomRadius, 12.0));
    for (var dy = -steps; dy <= steps; dy++) {
      for (var dx = -steps; dx <= steps; dx++) {
        let sampleOffset = vec2f(f32(dx), f32(dy)) * texel * 2.0;
        let s = textureSampleLevel(srcTexture, srcSampler, coord + sampleOffset, 0.0).rgb;
        let bright = max(s.r, max(s.g, s.b));
        if (bright > u.bloomThreshold) {
          let d = length(vec2f(f32(dx), f32(dy)));
          let w = exp(-d * d / (u.bloomRadius * 0.5 + 0.1));
          glow += (s - u.bloomThreshold) * w;
          totalW += w;
        }
      }
    }
    if (totalW > 0.0) {
      col += glow / totalW * u.bloomIntensity;
    }
  }

  // ── Film Grain ──
  if (u.grainEnabled > 0.5 && u.grainIntensity > 0.5) {
    let grainScale = max(u.grainSize, 0.5);
    let grainUv = floor(coord * u.resolution / grainScale);
    let noise = post_hash(grainUv + vec2f(u.grainTime * 17.31, u.grainTime * 43.57)) * 2.0 - 1.0;
    let strength = u.grainIntensity * 0.01;
    col += noise * strength;
  }

  // ── Scanlines ──
  if (u.scanlinesEnabled > 0.5 && u.scanlinesOpacity > 0.01) {
    let spacing = max(u.scanlinesSpacing, 1.0);
    let py = coord.y * u.resolution.y;
    let scanline = step(0.5, fract(py / spacing));
    col *= 1.0 - u.scanlinesOpacity * (1.0 - scanline);
  }

  // ── Vignette ──
  if (u.vignetteEnabled > 0.5 && u.vignetteIntensity > 0.01) {
    let centered = coord * 2.0 - 1.0;
    let dist = length(centered);
    let vig = smoothstep(u.vignetteRadius, u.vignetteRadius + 0.7, dist);
    col *= 1.0 - vig * u.vignetteIntensity;
  }

  return vec4f(clamp(col, vec3f(0.0), vec3f(1.0)), 1.0);
}
