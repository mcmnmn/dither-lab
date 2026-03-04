// Pixel Sort effect — fragment shader
// Simulates pixel sorting by shifting pixels within sortable spans
// Uses textureSampleLevel (explicit LOD 0) throughout because early-return
// and loop breaks create non-uniform control flow, which forbids implicit-LOD textureSample.

struct Uniforms {
  resolution: vec2f,
  threshold: f32,
  sortBy: f32,        // 0 = brightness, 1 = hue, 2 = saturation
  direction: f32,     // 0 = horizontal, 1 = vertical
  randomness: f32,
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

fn get_sort_value(color: vec3f) -> f32 {
  if (u.sortBy < 0.5) {
    return luminance(color);
  } else if (u.sortBy < 1.5) {
    let hsl = rgb_to_hsl(color);
    return hsl.x;
  } else {
    let hsl = rgb_to_hsl(color);
    return hsl.y;
  }
}

@fragment fn fs(@builtin(position) frag_coord: vec4f) -> @location(0) vec4f {
  let uv = frag_coord.xy / u.resolution;

  let src = textureSampleLevel(srcTexture, srcSampler, uv, 0.0);
  let adjusted_src = adjust_brightness_contrast(src.rgb, u.brightness, u.contrast);
  let sort_val = get_sort_value(adjusted_src);
  let thresh = u.threshold * 0.01;

  let pixel_size = vec2f(1.0 / u.resolution.x, 1.0 / u.resolution.y);
  var dir: vec2f;
  if (u.direction < 0.5) {
    dir = vec2f(pixel_size.x, 0.0);
  } else {
    dir = vec2f(0.0, pixel_size.y);
  }

  // If pixel is below threshold, return original
  if (sort_val < thresh) {
    return vec4f(adjusted_src, 1.0);
  }

  // Find span boundaries (search backward and forward for span edges)
  var span_back = 0;
  for (var i = 1; i < 100; i++) {
    let check_uv = uv - dir * f32(i);
    if (check_uv.x < 0.0 || check_uv.y < 0.0 || check_uv.x > 1.0 || check_uv.y > 1.0) {
      span_back = i;
      break;
    }
    let c = textureSampleLevel(srcTexture, srcSampler, check_uv, 0.0);
    if (get_sort_value(c.rgb) < thresh) {
      span_back = i;
      break;
    }
    if (i == 99) { span_back = 100; }
  }

  var span_fwd = 0;
  for (var i = 1; i < 100; i++) {
    let check_uv = uv + dir * f32(i);
    if (check_uv.x < 0.0 || check_uv.y < 0.0 || check_uv.x > 1.0 || check_uv.y > 1.0) {
      span_fwd = i;
      break;
    }
    let c = textureSampleLevel(srcTexture, srcSampler, check_uv, 0.0);
    if (get_sort_value(c.rgb) < thresh) {
      span_fwd = i;
      break;
    }
    if (i == 99) { span_fwd = 100; }
  }

  let total_span = span_back + span_fwd;
  if (total_span <= 2) {
    return vec4f(adjusted_src, 1.0);
  }

  // Calculate where in the span this pixel sits and where it "should" go
  let my_pos = f32(span_back) / f32(total_span);
  let rand = hash21(frag_coord.xy + vec2f(0.1, 0.7)) * u.randomness * 0.01;
  let target_pos = sort_val + rand;

  // Shift: sample from the position this pixel would have come from after sorting
  let shift_pixels = (target_pos - my_pos) * f32(total_span);
  let sample_uv = uv - dir * shift_pixels;
  let clamped_uv = clamp(sample_uv, vec2f(0.001), vec2f(0.999));

  let sampled = textureSampleLevel(srcTexture, srcSampler, clamped_uv, 0.0);
  let result = adjust_brightness_contrast(sampled.rgb, u.brightness, u.contrast);

  return vec4f(result, 1.0);
}
