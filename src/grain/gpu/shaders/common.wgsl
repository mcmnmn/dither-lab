// ── Color Utilities ──────────────────────────────────────────

fn luminance(c: vec3f) -> f32 {
  return dot(c, vec3f(0.2126, 0.7152, 0.0722));
}

fn rgb_to_hsl(c: vec3f) -> vec3f {
  let cMax = max(c.r, max(c.g, c.b));
  let cMin = min(c.r, min(c.g, c.b));
  let delta = cMax - cMin;
  let l = (cMax + cMin) * 0.5;
  if (delta < 0.00001) {
    return vec3f(0.0, 0.0, l);
  }
  let s = select(delta / (2.0 - cMax - cMin), delta / (cMax + cMin), l < 0.5);
  var h: f32;
  if (cMax == c.r) {
    h = (c.g - c.b) / delta + select(0.0, 6.0, c.g < c.b);
  } else if (cMax == c.g) {
    h = (c.b - c.r) / delta + 2.0;
  } else {
    h = (c.r - c.g) / delta + 4.0;
  }
  h /= 6.0;
  return vec3f(h, s, l);
}

fn hue_to_rgb(p: f32, q: f32, t_in: f32) -> f32 {
  var t = t_in;
  if (t < 0.0) { t += 1.0; }
  if (t > 1.0) { t -= 1.0; }
  if (t < 1.0 / 6.0) { return p + (q - p) * 6.0 * t; }
  if (t < 1.0 / 2.0) { return q; }
  if (t < 2.0 / 3.0) { return p + (q - p) * (2.0 / 3.0 - t) * 6.0; }
  return p;
}

fn hsl_to_rgb(hsl: vec3f) -> vec3f {
  if (hsl.y < 0.00001) {
    return vec3f(hsl.z);
  }
  let q = select(hsl.z + hsl.y - hsl.z * hsl.y, hsl.z * (1.0 + hsl.y), hsl.z < 0.5);
  let p = 2.0 * hsl.z - q;
  return vec3f(
    hue_to_rgb(p, q, hsl.x + 1.0 / 3.0),
    hue_to_rgb(p, q, hsl.x),
    hue_to_rgb(p, q, hsl.x - 1.0 / 3.0)
  );
}

// ── Brightness / Contrast ───────────────────────────────────

fn adjust_brightness_contrast(c: vec3f, brightness: f32, contrast: f32) -> vec3f {
  var out = c + brightness / 100.0;
  if (contrast != 0.0) {
    let factor = (100.0 + contrast) / (100.0 - contrast);
    out = (out - 0.5) * factor + 0.5;
  }
  return clamp(out, vec3f(0.0), vec3f(1.0));
}

// ── Noise ───────────────────────────────────────────────────

fn hash21(p: vec2f) -> f32 {
  var p3 = fract(vec3f(p.x, p.y, p.x) * 0.1031);
  p3 += dot(p3, vec3f(p3.y + 33.33, p3.z + 33.33, p3.x + 33.33));
  return fract((p3.x + p3.y) * p3.z);
}

fn hash22(p: vec2f) -> vec2f {
  let n = sin(vec2f(dot(p, vec2f(127.1, 311.7)), dot(p, vec2f(269.5, 183.3))));
  return fract(n * 43758.5453);
}

// Perlin-style gradient noise
fn perlin2d(p: vec2f) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);

  let a = hash21(i);
  let b = hash21(i + vec2f(1.0, 0.0));
  let c = hash21(i + vec2f(0.0, 1.0));
  let d = hash21(i + vec2f(1.0, 1.0));

  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y) * 2.0 - 1.0;
}
