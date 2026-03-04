// ASCII art effect — fragment shader
// Renders the image as ASCII characters using a procedural character set

struct Uniforms {
  resolution: vec2f,     // 0-7
  cellSize: f32,         // 8-11
  spacing: f32,          // 12-15
  intensity: f32,        // 16-19
  charSet: f32,          // 20-23
  colorMode: f32,        // 24-27
  fgR: f32,              // 28-31
  fgG: f32,              // 32-35
  fgB: f32,              // 36-39
  bgR: f32,              // 40-43
  bgG: f32,              // 44-47
  bgB: f32,              // 48-51
  brightness: f32,       // 52-55
  contrast: f32,         // 56-59
  _pad: f32,             // 60-63
}

@group(0) @binding(0) var srcTexture: texture_2d<f32>;
@group(0) @binding(1) var srcSampler: sampler;
@group(0) @binding(2) var<uniform> u: Uniforms;

@vertex fn vs(@builtin(vertex_index) vi: u32) -> @builtin(position) vec4f {
  let pos = array<vec2f, 3>(vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0));
  return vec4f(pos[vi], 0.0, 1.0);
}

// Procedural character rendering — draws simple shapes for ASCII approximation
fn char_pattern(local_uv: vec2f, char_index: f32) -> f32 {
  let idx = i32(char_index);
  let cx = local_uv.x - 0.5;
  let cy = local_uv.y - 0.5;
  let dist = sqrt(cx * cx + cy * cy);

  if (idx <= 0) { return 0.0; }
  if (idx == 1) {
    return select(0.0, 1.0, dist < 0.12);
  }
  if (idx == 2) {
    let d1 = length(vec2f(cx, cy - 0.15));
    let d2 = length(vec2f(cx, cy + 0.15));
    return select(0.0, 1.0, min(d1, d2) < 0.1);
  }
  if (idx == 3) {
    return select(0.0, 1.0, abs(cy) < 0.06 && abs(cx) < 0.25);
  }
  if (idx == 4) {
    let h = select(0.0, 1.0, abs(cy) < 0.06 && abs(cx) < 0.25);
    let v = select(0.0, 1.0, abs(cx) < 0.06 && abs(cy) < 0.25);
    return max(h, v);
  }
  if (idx == 5) {
    let l1 = select(0.0, 1.0, abs(cy - 0.1) < 0.05 && abs(cx) < 0.25);
    let l2 = select(0.0, 1.0, abs(cy + 0.1) < 0.05 && abs(cx) < 0.25);
    return max(l1, l2);
  }
  if (idx == 6) {
    let h = select(0.0, 1.0, abs(cy) < 0.05 && abs(cx) < 0.2);
    let v = select(0.0, 1.0, abs(cx) < 0.05 && abs(cy) < 0.2);
    let d1_val = abs(cx + cy) / 1.414;
    let d2_val = abs(cx - cy) / 1.414;
    let diag = select(0.0, 1.0, (d1_val < 0.05 || d2_val < 0.05) && dist < 0.2);
    return max(max(h, v), diag);
  }
  if (idx == 7) {
    let gx = step(0.35, fract(local_uv.x * 3.0));
    let gy = step(0.35, fract(local_uv.y * 3.0));
    return max(1.0 - gx, 1.0 - gy) * 0.8;
  }
  if (idx == 8) {
    return smoothstep(0.35, 0.3, dist);
  }
  return 1.0;
}

fn block_pattern(local_uv: vec2f, char_index: f32) -> f32 {
  let idx = i32(char_index);
  if (idx <= 0) { return 0.0; }
  if (idx == 1) { return select(0.0, 1.0, local_uv.y > 0.75); }
  if (idx == 2) { return select(0.0, 1.0, local_uv.y > 0.5); }
  if (idx == 3) { return select(0.0, 1.0, local_uv.y > 0.25); }
  if (idx <= 5) { return select(0.0, 1.0, local_uv.x < 0.5); }
  if (idx <= 7) { return select(0.0, 1.0, local_uv.x < 0.5 || local_uv.y > 0.5); }
  if (idx == 8) {
    let cx2 = step(0.5, fract(local_uv.x * 2.0));
    let cy2 = step(0.5, fract(local_uv.y * 2.0));
    return abs(cx2 - cy2);
  }
  return 1.0;
}

@fragment fn fs(@builtin(position) frag_coord: vec4f) -> @location(0) vec4f {
  let uv = frag_coord.xy / u.resolution;

  let cell = u.cellSize + u.spacing;

  let cell_x = floor(frag_coord.x / cell);
  let cell_y = floor(frag_coord.y / cell);

  let cell_center_uv = vec2f(
    (cell_x + 0.5) * cell / u.resolution.x,
    (cell_y + 0.5) * cell / u.resolution.y
  );

  let src = textureSample(srcTexture, srcSampler, cell_center_uv);
  let adjusted = adjust_brightness_contrast(src.rgb, u.brightness, u.contrast);
  let lum = luminance(adjusted);

  let mapped_lum = clamp(lum * u.intensity * 0.1, 0.0, 1.0);
  let char_idx = mapped_lum * 9.0;

  let local_uv = vec2f(
    fract(frag_coord.x / cell),
    fract(frag_coord.y / cell)
  );

  var pattern: f32;
  if (u.charSet > 1.5) {
    pattern = block_pattern(local_uv, char_idx);
  } else {
    pattern = char_pattern(local_uv, char_idx);
  }

  let fg = vec3f(u.fgR, u.fgG, u.fgB);
  let bg = vec3f(u.bgR, u.bgG, u.bgB);

  var out_color: vec3f;
  if (u.colorMode > 0.5) {
    out_color = mix(bg, fg, pattern);
  } else {
    out_color = mix(vec3f(0.0), adjusted, pattern);
  }

  return vec4f(out_color, 1.0);
}
