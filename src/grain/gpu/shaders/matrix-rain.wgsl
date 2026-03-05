// Matrix Rain effect — animated falling characters colored by source image
// Renders digital rain (Matrix-style) with procedural characters

struct Uniforms {
  resolution: vec2f,     // 0-7
  cellSize: f32,         // 8-11
  spacing: f32,          // 12-15
  speed: f32,            // 16-19
  trailLength: f32,      // 20-23
  direction: f32,        // 24-27   0=down, 1=up, 2=left, 3=right
  glow: f32,             // 28-31
  bgOpacity: f32,        // 32-35
  brightness: f32,       // 36-39
  contrast: f32,         // 40-43
  threshold: f32,        // 44-47
  rainR: f32,            // 48-51
  rainG: f32,            // 52-55
  rainB: f32,            // 56-59
  time: f32,             // 60-63
  charSet: f32,          // 64-67
  _pad0: f32,            // 68-71
  _pad1: f32,            // 72-75
  _pad2: f32,            // 76-79
}

@group(0) @binding(0) var srcTexture: texture_2d<f32>;
@group(0) @binding(1) var srcSampler: sampler;
@group(0) @binding(2) var<uniform> u: Uniforms;

@vertex fn vs(@builtin(vertex_index) vi: u32) -> @builtin(position) vec4f {
  let pos = array<vec2f, 3>(vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0));
  return vec4f(pos[vi], 0.0, 1.0);
}

// Hash for random per-column values
fn column_hash(col: f32) -> f32 {
  return fract(sin(col * 127.1 + 311.7) * 43758.5453);
}

// Hash for character selection — changes over time for animation
fn char_hash(cell: vec2f, t: f32) -> f32 {
  let p = cell + vec2f(floor(t * 3.0), 0.0);
  return fract(sin(dot(p, vec2f(127.1, 311.7))) * 43758.5453);
}

// Simple procedural character pattern
fn rain_char(local_uv: vec2f, char_val: f32) -> f32 {
  let idx = i32(char_val * 16.0) % 16;
  let cx = local_uv.x - 0.5;
  let cy = local_uv.y - 0.5;
  let dist = sqrt(cx * cx + cy * cy);

  // Margin — keep characters within cell bounds
  let margin = 0.1;
  if (local_uv.x < margin || local_uv.x > 1.0 - margin || local_uv.y < margin || local_uv.y > 1.0 - margin) {
    return 0.0;
  }

  if (idx == 0) {
    // Vertical bar |
    return select(0.0, 1.0, abs(cx) < 0.07 && abs(cy) < 0.35);
  }
  if (idx == 1) {
    // Horizontal bar —
    return select(0.0, 1.0, abs(cy) < 0.07 && abs(cx) < 0.3);
  }
  if (idx == 2) {
    // Cross +
    let h = select(0.0, 1.0, abs(cy) < 0.06 && abs(cx) < 0.25);
    let v = select(0.0, 1.0, abs(cx) < 0.06 && abs(cy) < 0.25);
    return max(h, v);
  }
  if (idx == 3) {
    // Small dot
    return select(0.0, 1.0, dist < 0.12);
  }
  if (idx == 4) {
    // Circle ring
    return select(0.0, 1.0, abs(dist - 0.22) < 0.05);
  }
  if (idx == 5) {
    // Diagonal /
    return select(0.0, 1.0, abs(cx + cy) < 0.08 && dist < 0.35);
  }
  if (idx == 6) {
    // Diagonal backslash
    return select(0.0, 1.0, abs(cx - cy) < 0.08 && dist < 0.35);
  }
  if (idx == 7) {
    // X shape
    let d1 = abs(cx + cy);
    let d2 = abs(cx - cy);
    return select(0.0, 1.0, (d1 < 0.07 || d2 < 0.07) && dist < 0.3);
  }
  if (idx == 8) {
    // T shape
    let top = select(0.0, 1.0, abs(cy + 0.2) < 0.06 && abs(cx) < 0.25);
    let stem = select(0.0, 1.0, abs(cx) < 0.06 && cy > -0.2 && cy < 0.3);
    return max(top, stem);
  }
  if (idx == 9) {
    // L shape
    let bottom = select(0.0, 1.0, abs(cy - 0.25) < 0.06 && cx > -0.05 && cx < 0.25);
    let side = select(0.0, 1.0, abs(cx) < 0.06 && abs(cy) < 0.3);
    return max(bottom, side);
  }
  if (idx == 10) {
    // Double horizontal
    let l1 = select(0.0, 1.0, abs(cy - 0.12) < 0.05 && abs(cx) < 0.25);
    let l2 = select(0.0, 1.0, abs(cy + 0.12) < 0.05 && abs(cx) < 0.25);
    return max(l1, l2);
  }
  if (idx == 11) {
    // Hash #
    let h1 = select(0.0, 1.0, abs(cy - 0.1) < 0.04 && abs(cx) < 0.25);
    let h2 = select(0.0, 1.0, abs(cy + 0.1) < 0.04 && abs(cx) < 0.25);
    let v1 = select(0.0, 1.0, abs(cx - 0.1) < 0.04 && abs(cy) < 0.25);
    let v2 = select(0.0, 1.0, abs(cx + 0.1) < 0.04 && abs(cy) < 0.25);
    return max(max(h1, h2), max(v1, v2));
  }
  if (idx == 12) {
    // Square outline
    let edge = max(abs(cx), abs(cy));
    return select(0.0, 1.0, edge > 0.18 && edge < 0.25);
  }
  if (idx == 13) {
    // Triangle
    let ty = cy + 0.25;
    return select(0.0, 1.0, ty > 0.0 && ty < 0.45 && abs(cx) < ty * 0.7);
  }
  if (idx == 14) {
    // Asterisk *
    let h = select(0.0, 1.0, abs(cy) < 0.05 && abs(cx) < 0.2);
    let v = select(0.0, 1.0, abs(cx) < 0.05 && abs(cy) < 0.2);
    let d1 = abs(cx + cy) / 1.414;
    let d2 = abs(cx - cy) / 1.414;
    let diag = select(0.0, 1.0, (d1 < 0.05 || d2 < 0.05) && dist < 0.2);
    return max(max(h, v), diag);
  }
  // idx == 15: filled block
  return select(0.0, 1.0, abs(cx) < 0.25 && abs(cy) < 0.3);
}

// Block character set — simpler geometric shapes
fn rain_block(local_uv: vec2f, char_val: f32) -> f32 {
  let idx = i32(char_val * 8.0) % 8;
  if (idx == 0) { return select(0.0, 1.0, local_uv.y > 0.5); }
  if (idx == 1) { return select(0.0, 1.0, local_uv.x < 0.5); }
  if (idx == 2) { return select(0.0, 1.0, local_uv.x < 0.5 && local_uv.y > 0.5); }
  if (idx == 3) {
    let cx = local_uv.x - 0.5;
    let cy = local_uv.y - 0.5;
    return select(0.0, 1.0, sqrt(cx * cx + cy * cy) < 0.4);
  }
  if (idx == 4) { return 1.0; }
  if (idx == 5) {
    let gx = step(0.4, fract(local_uv.x * 2.0));
    let gy = step(0.4, fract(local_uv.y * 2.0));
    return max(1.0 - gx, 1.0 - gy);
  }
  if (idx == 6) {
    let cx = step(0.5, fract(local_uv.x * 2.0));
    let cy = step(0.5, fract(local_uv.y * 2.0));
    return abs(cx - cy);
  }
  return select(0.0, 1.0, local_uv.y > 0.25 && local_uv.y < 0.75);
}

@fragment fn fs(@builtin(position) frag_coord: vec4f) -> @location(0) vec4f {
  let uv = frag_coord.xy / u.resolution;
  let cell = u.cellSize + u.spacing;
  let time = u.time * u.speed;

  // Compute cell coordinates based on direction
  var cell_x: f32;
  var cell_y: f32;
  var local_uv: vec2f;

  // For all directions, we compute a "column" (perpendicular to rain) and "row" (along rain)
  cell_x = floor(frag_coord.x / cell);
  cell_y = floor(frag_coord.y / cell);
  local_uv = vec2f(fract(frag_coord.x / cell), fract(frag_coord.y / cell));

  let cols = ceil(u.resolution.x / cell);
  let rows = ceil(u.resolution.y / cell);

  // Column and row along the rain direction
  var rain_col: f32;  // perpendicular to rain direction
  var rain_row: f32;  // along rain direction
  var rain_rows: f32; // total rows in rain direction

  if (u.direction < 0.5) {
    // Down
    rain_col = cell_x;
    rain_row = cell_y;
    rain_rows = rows;
  } else if (u.direction < 1.5) {
    // Up
    rain_col = cell_x;
    rain_row = rows - 1.0 - cell_y;
    rain_rows = rows;
  } else if (u.direction < 2.5) {
    // Left
    rain_col = cell_y;
    rain_row = cols - 1.0 - cell_x;
    rain_rows = cols;
  } else {
    // Right
    rain_col = cell_y;
    rain_row = cell_x;
    rain_rows = cols;
  }

  // Per-column random offset and speed variation
  let col_rand = column_hash(rain_col);
  let col_speed = 0.7 + col_rand * 0.6;

  // Head position: scrolls down the column
  let head_pos = fract((time * col_speed * 0.5 + col_rand * rain_rows) / rain_rows) * rain_rows;

  // Distance behind the head (wrapping)
  var dist_behind = head_pos - rain_row;
  if (dist_behind < 0.0) {
    dist_behind += rain_rows;
  }

  // Trail fade
  let trail = u.trailLength;
  let fade = 1.0 - clamp(dist_behind / trail, 0.0, 1.0);

  // Sample source image at cell center
  let cell_center_uv = vec2f(
    (cell_x + 0.5) * cell / u.resolution.x,
    (cell_y + 0.5) * cell / u.resolution.y
  );
  let src = textureSample(srcTexture, srcSampler, cell_center_uv);
  let adjusted = adjust_brightness_contrast(src.rgb, u.brightness, u.contrast);
  let lum = luminance(adjusted);

  // Threshold: skip cells below threshold
  if (lum < u.threshold) {
    return vec4f(vec3f(0.0) * u.bgOpacity, 1.0);
  }

  // Character rendering
  let char_val = char_hash(vec2f(rain_col, rain_row), time * col_speed);
  var pattern: f32;
  if (u.charSet > 1.5) {
    pattern = rain_block(local_uv, char_val);
  } else {
    pattern = rain_char(local_uv, char_val);
  }

  // Rain color
  let rain_color = vec3f(u.rainR, u.rainG, u.rainB);

  // Character brightness modulated by source luminance and trail fade
  let char_brightness = pattern * fade * (0.3 + lum * 0.7);

  // Head character is brightest (white flash)
  let is_head = step(dist_behind, 1.0) * step(0.0, dist_behind);
  let head_flash = is_head * pattern * 0.5;

  // Glow effect — expand character brightness
  let glow_amount = u.glow * fade * lum * 0.15;

  // Compose: rain color * character + glow + head flash
  let char_color = rain_color * char_brightness + rain_color * glow_amount + vec3f(head_flash);

  // Background: dark with slight source color bleed
  let bg = adjusted * u.bgOpacity * 0.3;

  let final_color = bg + char_color;

  return vec4f(clamp(final_color, vec3f(0.0), vec3f(1.0)), 1.0);
}
