// VHS effect — fragment shader
// Simulates VHS tape artifacts: tracking lines, noise, color bleed, distortion

struct Uniforms {
  resolution: vec2f,
  tracking: f32,
  noise: f32,
  colorBleed: f32,
  distortion: f32,
  brightness: f32,
  contrast: f32,
}

@group(0) @binding(0) var srcTexture: texture_2d<f32>;
@group(0) @binding(1) var srcSampler: sampler;
@group(0) @binding(2) var<uniform> u: Uniforms;

@vertex fn vs(@builtin(vertex_index) vi: u32) -> @builtin(position) vec4f {
  let pos = array<vec2f, 3>(vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0));
  return vec4f(pos[vi], 0.0, 1.0);
}

fn vhs_noise(p: vec2f) -> f32 {
  return fract(sin(dot(p, vec2f(12.9898, 78.233))) * 43758.5453);
}

@fragment fn fs(@builtin(position) frag_coord: vec4f) -> @location(0) vec4f {
  var uv = frag_coord.xy / u.resolution;

  // Horizontal distortion — waviness
  let dist_amount = u.distortion * 0.01;
  let wave1 = sin(uv.y * 13.0 + 0.5) * dist_amount;
  let wave2 = sin(uv.y * 47.0 + 2.3) * dist_amount * 0.5;
  let wave3 = sin(uv.y * 113.0 + 5.7) * dist_amount * 0.25;
  uv.x += wave1 + wave2 + wave3;

  // Tracking lines — horizontal bands that shift
  let track_amount = u.tracking * 0.01;
  let line_y = fract(uv.y * 10.0 + 0.3);
  let tracking_band = smoothstep(0.0, 0.05, line_y) * smoothstep(0.1, 0.05, line_y);
  uv.x += tracking_band * track_amount * 0.5;

  // Chromatic / color bleed — offset R and B channels horizontally
  let bleed = u.colorBleed * 0.003;
  let r = textureSample(srcTexture, srcSampler, vec2f(uv.x + bleed, uv.y)).r;
  let g = textureSample(srcTexture, srcSampler, uv).g;
  let b = textureSample(srcTexture, srcSampler, vec2f(uv.x - bleed, uv.y)).b;
  var color = vec3f(r, g, b);

  // Static noise overlay
  let noise_amount = u.noise * 0.01;
  let n = vhs_noise(frag_coord.xy * 0.5 + vec2f(0.7, 3.1));
  color = mix(color, vec3f(n), noise_amount);

  // Scanline darkening
  let scanline = 0.95 + 0.05 * sin(frag_coord.y * 3.14159);
  color *= scanline;

  // Slight color desaturation (VHS look)
  let lum = luminance(color);
  color = mix(vec3f(lum), color, 0.85);

  // Brightness / contrast
  color = adjust_brightness_contrast(color, u.brightness, u.contrast);

  // Tracking line overlay — bright white band
  let track_line = smoothstep(0.0, 0.01, abs(fract(uv.y * 3.0 + 0.15) - 0.5) - 0.48);
  color = mix(color, vec3f(1.0), track_line * track_amount);

  return vec4f(clamp(color, vec3f(0.0), vec3f(1.0)), 1.0);
}
