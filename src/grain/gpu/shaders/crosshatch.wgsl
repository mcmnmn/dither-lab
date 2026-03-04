// Crosshatch effect — fragment shader
// Draws hatching lines at multiple angles based on luminance

struct Uniforms {
  resolution: vec2f,
  lineWidth: f32,
  spacing: f32,
  angle: f32,
  layers: f32,
  brightness: f32,
  contrast: f32,
  colorMode: f32,   // 0 = original, 1 = mono
  _pad: f32,
}

@group(0) @binding(0) var srcTexture: texture_2d<f32>;
@group(0) @binding(1) var srcSampler: sampler;
@group(0) @binding(2) var<uniform> u: Uniforms;

@vertex fn vs(@builtin(vertex_index) vi: u32) -> @builtin(position) vec4f {
  let pos = array<vec2f, 3>(vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0));
  return vec4f(pos[vi], 0.0, 1.0);
}

fn hatch_line(p: vec2f, angle_rad: f32, line_width: f32, gap: f32) -> f32 {
  let c = cos(angle_rad);
  let s = sin(angle_rad);
  let rotated = p.x * c + p.y * s;
  let period = gap;
  let d = abs(fract(rotated / period + 0.5) - 0.5) * period;
  return smoothstep(line_width * 0.5, line_width * 0.5 + 1.0, d);
}

@fragment fn fs(@builtin(position) frag_coord: vec4f) -> @location(0) vec4f {
  let uv = frag_coord.xy / u.resolution;
  let src = textureSample(srcTexture, srcSampler, uv);
  let adjusted = adjust_brightness_contrast(src.rgb, u.brightness, u.contrast);
  let lum = luminance(adjusted);

  let base_angle = u.angle * 3.14159265 / 180.0;
  let layer_count = i32(u.layers);
  let gap = u.spacing;
  let lw = u.lineWidth;

  // Start with white background
  var ink = 1.0;

  // Each layer adds hatching at a different angle for darker luminance levels
  // Layer 0: lightest areas get hatched (lum < 0.8)
  // Layer 1: mid-tones (lum < 0.6)
  // Layer 2: darker mid-tones (lum < 0.4)
  // Layer 3: darkest areas (lum < 0.2)
  let thresholds = array<f32, 4>(0.8, 0.6, 0.4, 0.2);
  let angle_offsets = array<f32, 4>(0.0, 1.5708, 0.7854, 2.3562); // 0°, 90°, 45°, 135°

  for (var i = 0; i < layer_count; i++) {
    let thresh = thresholds[i];
    if (lum < thresh) {
      let a = base_angle + angle_offsets[i];
      let h = hatch_line(frag_coord.xy, a, lw, gap);
      ink = min(ink, h);
    }
  }

  var out_color: vec3f;
  if (u.colorMode > 0.5) {
    // Mono mode: black ink on white paper
    out_color = vec3f(ink);
  } else {
    // Original color mode: tint the ink with source color
    let paper = vec3f(1.0);
    out_color = mix(adjusted, paper, ink);
  }

  return vec4f(out_color, 1.0);
}
