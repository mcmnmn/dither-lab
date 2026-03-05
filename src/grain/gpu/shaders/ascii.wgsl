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
  saturation: f32,       // 60-63
  hueRotation: f32,      // 64-67
  sharpness: f32,        // 68-71
  gamma: f32,            // 72-75
  _pad0: f32,            // 76-79
  _pad1: f32,            // 80-83 (align to 96)
}

@group(0) @binding(0) var srcTexture: texture_2d<f32>;
@group(0) @binding(1) var srcSampler: sampler;
@group(0) @binding(2) var<uniform> u: Uniforms;

@vertex fn vs(@builtin(vertex_index) vi: u32) -> @builtin(position) vec4f {
  let pos = array<vec2f, 3>(vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0));
  return vec4f(pos[vi], 0.0, 1.0);
}

// ── Adjustment Functions ──────────────────────────────────────

fn adjust_saturation(c: vec3f, amount: f32) -> vec3f {
  let lum = luminance(c);
  let gray = vec3f(lum);
  // amount: -100 to +100 mapped to 0..2
  let factor = (amount + 100.0) / 100.0;
  return clamp(mix(gray, c, factor), vec3f(0.0), vec3f(1.0));
}

fn adjust_hue_rotation(c: vec3f, degrees: f32) -> vec3f {
  let hsl = rgb_to_hsl(c);
  let new_h = fract(hsl.x + degrees / 360.0);
  return hsl_to_rgb(vec3f(new_h, hsl.y, hsl.z));
}

fn adjust_gamma(c: vec3f, gamma: f32) -> vec3f {
  let g = max(gamma, 0.01);
  let inv = 1.0 / g;
  return vec3f(pow(c.r, inv), pow(c.g, inv), pow(c.b, inv));
}

fn apply_sharpness(base_uv: vec2f, center: vec3f, amount: f32) -> vec3f {
  if (amount < 0.01) { return center; }
  let texel = 1.0 / u.resolution;
  let top    = textureSample(srcTexture, srcSampler, base_uv + vec2f(0.0, -texel.y)).rgb;
  let bottom = textureSample(srcTexture, srcSampler, base_uv + vec2f(0.0, texel.y)).rgb;
  let left   = textureSample(srcTexture, srcSampler, base_uv + vec2f(-texel.x, 0.0)).rgb;
  let right  = textureSample(srcTexture, srcSampler, base_uv + vec2f(texel.x, 0.0)).rgb;
  let blur = (top + bottom + left + right) * 0.25;
  let sharp = center + (center - blur) * amount * 0.1;
  return clamp(sharp, vec3f(0.0), vec3f(1.0));
}

// ── Character Pattern Functions ───────────────────────────────

// 0: Standard — dots, lines, crosses, grids, circles
fn char_standard(local_uv: vec2f, char_index: f32) -> f32 {
  let idx = i32(char_index);
  let cx = local_uv.x - 0.5;
  let cy = local_uv.y - 0.5;
  let dist = sqrt(cx * cx + cy * cy);

  if (idx <= 0) { return 0.0; }
  if (idx == 1) { return select(0.0, 1.0, dist < 0.12); }
  if (idx == 2) {
    let d1 = length(vec2f(cx, cy - 0.15));
    let d2 = length(vec2f(cx, cy + 0.15));
    return select(0.0, 1.0, min(d1, d2) < 0.1);
  }
  if (idx == 3) { return select(0.0, 1.0, abs(cy) < 0.06 && abs(cx) < 0.25); }
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
  if (idx == 8) { return smoothstep(0.35, 0.3, dist); }
  return 1.0;
}

// 1: Blocks — block elements
fn char_blocks(local_uv: vec2f, char_index: f32) -> f32 {
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

// 2: Binary — 0 and 1 shapes
fn char_binary(local_uv: vec2f, char_index: f32) -> f32 {
  let idx = i32(char_index);
  let cx = local_uv.x - 0.5;
  let cy = local_uv.y - 0.5;
  let dist = sqrt(cx * cx + cy * cy);

  if (idx <= 0) { return 0.0; }
  if (idx <= 3) {
    let ring = abs(dist - 0.15 * f32(idx)) < 0.04;
    return select(0.0, 1.0, ring);
  }
  if (idx <= 6) {
    let bar_w = 0.04 + 0.02 * f32(idx - 3);
    let bar = abs(cx) < bar_w && abs(cy) < 0.3;
    let serif = abs(cy + 0.3) < 0.04 && abs(cx) < 0.1;
    return select(0.0, 1.0, bar || serif);
  }
  if (idx <= 8) {
    let bar = abs(cx - 0.1) < 0.03 && abs(cy) < 0.25;
    let ring = abs(length(vec2f(cx + 0.1, cy)) - 0.15) < 0.04;
    return select(0.0, 1.0, bar || ring);
  }
  return 1.0;
}

// 3: Detailed — dense, complex patterns
fn char_detailed(local_uv: vec2f, char_index: f32) -> f32 {
  let idx = i32(char_index);
  let cx = local_uv.x - 0.5;
  let cy = local_uv.y - 0.5;
  let dist = sqrt(cx * cx + cy * cy);

  if (idx <= 0) { return 0.0; }
  if (idx == 1) { return select(0.0, 0.4, dist < 0.08); }
  if (idx == 2) {
    let dots = select(0.0, 1.0, dist < 0.1);
    let ring = select(0.0, 0.3, abs(dist - 0.25) < 0.03);
    return max(dots, ring);
  }
  if (idx == 3) {
    let h = select(0.0, 1.0, abs(cy) < 0.04 && abs(cx) < 0.3);
    let v = select(0.0, 1.0, abs(cx) < 0.04 && abs(cy) < 0.3);
    let dots = select(0.0, 0.5, dist < 0.08);
    return max(max(h, v), dots);
  }
  if (idx == 4) {
    let g = fract(local_uv * 4.0);
    let gx = step(0.4, g.x) * (1.0 - step(0.6, g.x));
    let gy = step(0.4, g.y) * (1.0 - step(0.6, g.y));
    return max(gx, gy) * 0.6;
  }
  if (idx == 5) {
    let h = select(0.0, 1.0, abs(cy) < 0.04);
    let v = select(0.0, 1.0, abs(cx) < 0.04);
    let d1 = abs(cx + cy) / 1.414;
    let d2 = abs(cx - cy) / 1.414;
    let diag = select(0.0, 0.7, d1 < 0.04 || d2 < 0.04);
    return max(max(h, v), diag);
  }
  if (idx == 6) {
    let g = fract(local_uv * 3.0);
    let gx = 1.0 - step(0.3, g.x);
    let gy = 1.0 - step(0.3, g.y);
    return max(gx, gy) * 0.8;
  }
  if (idx == 7) {
    let g = fract(local_uv * 4.0);
    let fill = 1.0 - step(0.5, g.x) * step(0.5, g.y);
    return fill * 0.7;
  }
  if (idx == 8) { return smoothstep(0.4, 0.0, dist); }
  return 1.0;
}

// 4: Minimal — sparse, clean patterns
fn char_minimal(local_uv: vec2f, char_index: f32) -> f32 {
  let idx = i32(char_index);
  let cx = local_uv.x - 0.5;
  let cy = local_uv.y - 0.5;
  let dist = sqrt(cx * cx + cy * cy);

  if (idx <= 0) { return 0.0; }
  if (idx == 1) { return select(0.0, 1.0, dist < 0.06); }
  if (idx == 2) { return select(0.0, 1.0, abs(cy) < 0.03 && abs(cx) < 0.15); }
  if (idx == 3) { return select(0.0, 1.0, abs(cx) < 0.03 && abs(cy) < 0.2); }
  if (idx == 4) {
    let h = select(0.0, 1.0, abs(cy) < 0.03 && abs(cx) < 0.15);
    let v = select(0.0, 1.0, abs(cx) < 0.03 && abs(cy) < 0.15);
    return max(h, v);
  }
  if (idx == 5) {
    let d = abs(cx - cy) / 1.414;
    return select(0.0, 1.0, d < 0.03 && dist < 0.25);
  }
  if (idx == 6) {
    let d1 = abs(cx + cy) / 1.414;
    let d2 = abs(cx - cy) / 1.414;
    return select(0.0, 1.0, (d1 < 0.03 || d2 < 0.03) && dist < 0.25);
  }
  if (idx == 7) { return select(0.0, 1.0, abs(dist - 0.2) < 0.03); }
  if (idx == 8) { return select(0.0, 1.0, dist < 0.25); }
  return 1.0;
}

// 5: Alphabetic — letter-like shapes
fn char_alphabetic(local_uv: vec2f, char_index: f32) -> f32 {
  let idx = i32(char_index);
  let cx = local_uv.x - 0.5;
  let cy = local_uv.y - 0.5;
  let dist = sqrt(cx * cx + cy * cy);

  if (idx <= 0) { return 0.0; }
  if (idx == 1) { return select(0.0, 1.0, dist < 0.08); }
  if (idx == 2) {
    let ring = abs(dist - 0.18) < 0.04;
    let cut = cx > 0.08 && abs(cy) < 0.1;
    return select(0.0, 1.0, ring && !cut);
  }
  if (idx == 3) { return select(0.0, 1.0, abs(dist - 0.18) < 0.04); }
  if (idx == 4) {
    let d1 = abs(cx + cy) / 1.414;
    let d2 = abs(cx - cy) / 1.414;
    return select(0.0, 1.0, (d1 < 0.04 || d2 < 0.04) && dist < 0.22);
  }
  if (idx == 5) {
    let vl = abs(cx + 0.15) < 0.04 && abs(cy) < 0.25;
    let vr = abs(cx - 0.15) < 0.04 && abs(cy) < 0.25;
    let h  = abs(cy) < 0.04 && abs(cx) < 0.15;
    return select(0.0, 1.0, vl || vr || h);
  }
  if (idx == 6) {
    let l1 = abs(cx + 0.2 + cy * 0.5) < 0.04 && cy > -0.05;
    let l2 = abs(cx - cy * 0.5) < 0.04 && cy > -0.05;
    let l3 = abs(cx - 0.2 + cy * 0.5) < 0.04 && cy > -0.05;
    let top = abs(cy + 0.25) < 0.04 && abs(cx) < 0.25;
    return select(0.0, 1.0, l1 || l2 || l3 || top);
  }
  if (idx == 7) {
    let vl = abs(cx + 0.2) < 0.04 && abs(cy) < 0.25;
    let vr = abs(cx - 0.2) < 0.04 && abs(cy) < 0.25;
    let d1 = abs(cx + 0.1 - cy * 0.3) < 0.04 && cy < 0.1;
    let d2 = abs(cx - 0.1 + cy * 0.3) < 0.04 && cy < 0.1;
    return select(0.0, 1.0, vl || vr || d1 || d2);
  }
  if (idx == 8) {
    let outer = abs(dist - 0.28) < 0.03;
    let inner = abs(dist - 0.15) < 0.03;
    let bar = cx > 0.1 && abs(cy) < 0.03;
    return select(0.0, 1.0, outer || inner || bar);
  }
  return 1.0;
}

// 6: Numeric — number-like shapes
fn char_numeric(local_uv: vec2f, char_index: f32) -> f32 {
  let idx = i32(char_index);
  let cx = local_uv.x - 0.5;
  let cy = local_uv.y - 0.5;
  let dist = sqrt(cx * cx + cy * cy);

  if (idx <= 0) { return 0.0; }
  if (idx == 1) { return select(0.0, 1.0, abs(cx) < 0.04 && abs(cy) < 0.25); }
  if (idx == 2) {
    let top = abs(cy - 0.22) < 0.04 && abs(cx) < 0.15;
    let diag = abs(cx - 0.05 - cy * 0.3) < 0.04 && cy < 0.22;
    return select(0.0, 1.0, top || diag);
  }
  if (idx == 3) {
    let v = abs(cx - 0.1) < 0.04 && abs(cy) < 0.25;
    let h = abs(cy) < 0.04 && cx < 0.12 && cx > -0.2;
    let sl = abs(cx + 0.1) < 0.04 && cy > -0.02 && cy < 0.25;
    return select(0.0, 1.0, v || h || sl);
  }
  if (idx == 4) {
    let top_arc = abs(length(vec2f(cx, cy - 0.12)) - 0.13) < 0.04 && cx > -0.05;
    let bot_arc = abs(length(vec2f(cx, cy + 0.12)) - 0.13) < 0.04 && cx > -0.05;
    return select(0.0, 1.0, top_arc || bot_arc);
  }
  if (idx == 5) {
    let top = abs(cy - 0.22) < 0.04 && abs(cx) < 0.15;
    let mid_v = abs(cx + 0.15) < 0.04 && cy > 0.0 && cy < 0.25;
    let mid_h = abs(cy) < 0.04 && abs(cx) < 0.15;
    let arc = abs(length(vec2f(cx, cy + 0.12)) - 0.13) < 0.04 && cx > -0.05;
    return select(0.0, 1.0, top || mid_v || mid_h || arc);
  }
  if (idx == 6) {
    let ring = abs(length(vec2f(cx, cy + 0.08)) - 0.15) < 0.04;
    let stem = abs(cx + 0.15) < 0.04 && cy > -0.08 && cy < 0.25;
    let top = abs(cy - 0.22) < 0.04 && cx > -0.18 && cx < 0.1;
    return select(0.0, 1.0, ring || stem || top);
  }
  if (idx == 7) {
    let top_ring = abs(length(vec2f(cx, cy - 0.12)) - 0.12) < 0.04;
    let bot_ring = abs(length(vec2f(cx, cy + 0.12)) - 0.12) < 0.04;
    return select(0.0, 1.0, top_ring || bot_ring);
  }
  if (idx == 8) {
    let ew = 0.15;
    let eh = 0.25;
    let ex = cx / ew;
    let ey = cy / eh;
    let e_dist = sqrt(ex * ex + ey * ey);
    return select(0.0, 1.0, abs(e_dist - 1.0) < 0.2);
  }
  return 1.0;
}

// 7: Math — mathematical symbols
fn char_math(local_uv: vec2f, char_index: f32) -> f32 {
  let idx = i32(char_index);
  let cx = local_uv.x - 0.5;
  let cy = local_uv.y - 0.5;
  let dist = sqrt(cx * cx + cy * cy);

  if (idx <= 0) { return 0.0; }
  if (idx == 1) { return select(0.0, 1.0, dist < 0.06); }
  if (idx == 2) { return select(0.0, 1.0, abs(cy) < 0.04 && abs(cx) < 0.18); }
  if (idx == 3) {
    let h = abs(cy) < 0.04 && abs(cx) < 0.18;
    let v = abs(cx) < 0.04 && abs(cy) < 0.18;
    return select(0.0, 1.0, h || v);
  }
  if (idx == 4) {
    let d1 = abs(cx + cy) / 1.414;
    let d2 = abs(cx - cy) / 1.414;
    return select(0.0, 1.0, (d1 < 0.04 || d2 < 0.04) && dist < 0.2);
  }
  if (idx == 5) {
    let h = abs(cy) < 0.04 && abs(cx) < 0.18;
    let d1 = length(vec2f(cx, cy - 0.15)) < 0.05;
    let d2 = length(vec2f(cx, cy + 0.15)) < 0.05;
    return select(0.0, 1.0, h || d1 || d2);
  }
  if (idx == 6) {
    let l1 = abs(cy - 0.08) < 0.04 && abs(cx) < 0.18;
    let l2 = abs(cy + 0.08) < 0.04 && abs(cx) < 0.18;
    return select(0.0, 1.0, l1 || l2);
  }
  if (idx == 7) {
    let l1 = abs(cy - 0.12) < 0.03 && abs(cx) < 0.18;
    let l2 = abs(cy) < 0.03 && abs(cx) < 0.18;
    let l3 = abs(cy + 0.12) < 0.03 && abs(cx) < 0.18;
    return select(0.0, 1.0, l1 || l2 || l3);
  }
  if (idx == 8) {
    let d1 = abs(length(vec2f(cx - 0.12, cy)) - 0.12) < 0.04;
    let d2 = abs(length(vec2f(cx + 0.12, cy)) - 0.12) < 0.04;
    return select(0.0, 1.0, d1 || d2);
  }
  return 1.0;
}

// 8: Symbols — special characters
fn char_symbols(local_uv: vec2f, char_index: f32) -> f32 {
  let idx = i32(char_index);
  let cx = local_uv.x - 0.5;
  let cy = local_uv.y - 0.5;
  let dist = sqrt(cx * cx + cy * cy);

  if (idx <= 0) { return 0.0; }
  if (idx == 1) { return select(0.0, 1.0, length(vec2f(cx, cy + 0.2)) < 0.06); }
  if (idx == 2) {
    let d1 = length(vec2f(cx, cy - 0.12)) < 0.06;
    let d2 = length(vec2f(cx, cy + 0.12)) < 0.06;
    return select(0.0, 1.0, d1 || d2);
  }
  if (idx == 3) {
    let h = abs(cy) < 0.03 && abs(cx) < 0.15;
    let d1 = abs(cx + cy) / 1.414 < 0.03 && dist < 0.15;
    let d2 = abs(cx - cy) / 1.414 < 0.03 && dist < 0.15;
    return select(0.0, 1.0, h || d1 || d2);
  }
  if (idx == 4) {
    let v1 = abs(cx - 0.08) < 0.03;
    let v2 = abs(cx + 0.08) < 0.03;
    let h1 = abs(cy - 0.08) < 0.03;
    let h2 = abs(cy + 0.08) < 0.03;
    return select(0.0, 1.0, (v1 || v2 || h1 || h2) && dist < 0.28);
  }
  if (idx == 5) {
    let ring = abs(dist - 0.18) < 0.04;
    let v = abs(cx) < 0.03 && abs(cy) < 0.28;
    return select(0.0, 1.0, ring || v);
  }
  if (idx == 6) {
    let top = abs(length(vec2f(cx + 0.05, cy - 0.1)) - 0.12) < 0.04;
    let bot = abs(length(vec2f(cx, cy + 0.08)) - 0.15) < 0.04;
    let tail = cx > 0.05 && abs(cy + 0.18 - cx * 0.5) < 0.04;
    return select(0.0, 1.0, top || bot || tail);
  }
  if (idx == 7) {
    let outer = abs(dist - 0.25) < 0.03;
    let inner = abs(dist - 0.12) < 0.03;
    let conn = cx > 0.08 && abs(cy) < 0.04;
    return select(0.0, 1.0, outer || inner || conn);
  }
  if (idx == 8) { return select(0.0, 1.0, abs(cx) < 0.3 && abs(cy) < 0.3); }
  return 1.0;
}

// ── Pattern Dispatcher ────────────────────────────────────────

fn get_pattern(local_uv: vec2f, char_index: f32, char_set: f32) -> f32 {
  let cs = i32(char_set);
  if (cs == 1) { return char_blocks(local_uv, char_index); }
  if (cs == 2) { return char_binary(local_uv, char_index); }
  if (cs == 3) { return char_detailed(local_uv, char_index); }
  if (cs == 4) { return char_minimal(local_uv, char_index); }
  if (cs == 5) { return char_alphabetic(local_uv, char_index); }
  if (cs == 6) { return char_numeric(local_uv, char_index); }
  if (cs == 7) { return char_math(local_uv, char_index); }
  if (cs == 8) { return char_symbols(local_uv, char_index); }
  return char_standard(local_uv, char_index);
}

@fragment fn fs(@builtin(position) frag_coord: vec4f) -> @location(0) vec4f {
  let cell = u.cellSize + u.spacing;

  let cell_x = floor(frag_coord.x / cell);
  let cell_y = floor(frag_coord.y / cell);

  let cell_center_uv = vec2f(
    (cell_x + 0.5) * cell / u.resolution.x,
    (cell_y + 0.5) * cell / u.resolution.y
  );

  let src = textureSample(srcTexture, srcSampler, cell_center_uv);

  // Apply adjustments
  var color = src.rgb;
  color = apply_sharpness(cell_center_uv, color, u.sharpness);
  color = adjust_brightness_contrast(color, u.brightness, u.contrast);
  color = adjust_saturation(color, u.saturation);
  if (abs(u.hueRotation) > 0.5) {
    color = adjust_hue_rotation(color, u.hueRotation);
  }
  if (abs(u.gamma - 1.0) > 0.01) {
    color = adjust_gamma(color, u.gamma);
  }

  let lum = luminance(color);
  let mapped_lum = clamp(lum * u.intensity, 0.0, 1.0);
  let char_idx = mapped_lum * 9.0;

  let local_uv = vec2f(
    fract(frag_coord.x / cell),
    fract(frag_coord.y / cell)
  );

  let pattern = get_pattern(local_uv, char_idx, u.charSet);

  let fg = vec3f(u.fgR, u.fgG, u.fgB);
  let bg = vec3f(u.bgR, u.bgG, u.bgB);

  var out_color: vec3f;
  if (u.colorMode > 0.5) {
    out_color = mix(bg, fg, pattern);
  } else {
    out_color = mix(bg, color, pattern);
  }

  return vec4f(out_color, 1.0);
}
