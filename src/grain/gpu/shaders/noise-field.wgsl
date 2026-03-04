// Noise Field effect — fragment shader
// Applies Perlin noise displacement and overlay to the image

struct Uniforms {
  resolution: vec2f,
  scale: f32,
  intensity: f32,
  octaves: f32,
  speed: f32,
  time: f32,
  distortOnly: f32,  // 0 = blend noise, 1 = distort only
  brightness: f32,
  contrast: f32,
  noiseType: f32,     // 0 = perlin, 1 = simplex (both use perlin2d for now)
  _pad: f32,
}

@group(0) @binding(0) var srcTexture: texture_2d<f32>;
@group(0) @binding(1) var srcSampler: sampler;
@group(0) @binding(2) var<uniform> u: Uniforms;

@vertex fn vs(@builtin(vertex_index) vi: u32) -> @builtin(position) vec4f {
  let pos = array<vec2f, 3>(vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0));
  return vec4f(pos[vi], 0.0, 1.0);
}

fn fbm(p: vec2f, octaves: i32) -> f32 {
  var value = 0.0;
  var amplitude = 0.5;
  var freq = 1.0;
  var pos = p;
  for (var i = 0; i < octaves; i++) {
    value += amplitude * perlin2d(pos * freq);
    freq *= 2.0;
    amplitude *= 0.5;
    pos += vec2f(1.7, 9.2);
  }
  return value;
}

@fragment fn fs(@builtin(position) frag_coord: vec4f) -> @location(0) vec4f {
  let uv = frag_coord.xy / u.resolution;

  let noise_scale = u.scale * 0.01;
  let noise_uv = uv * u.resolution / 100.0 * noise_scale + vec2f(u.time * u.speed * 0.1);

  let oct = i32(u.octaves);

  // Two channels of noise for displacement
  let nx = fbm(noise_uv, oct);
  let ny = fbm(noise_uv + vec2f(5.2, 1.3), oct);

  let disp_strength = u.intensity * 0.01;
  let displaced_uv = uv + vec2f(nx, ny) * disp_strength;
  let clamped_uv = clamp(displaced_uv, vec2f(0.0), vec2f(1.0));

  let src = textureSample(srcTexture, srcSampler, clamped_uv);

  var color = src.rgb;

  // If not distort-only, blend noise pattern into the image
  if (u.distortOnly < 0.5) {
    let noise_val = fbm(noise_uv * 2.0, oct) * 0.5 + 0.5;
    let noise_color = vec3f(noise_val);
    color = mix(color, noise_color, u.intensity * 0.005);
  }

  color = adjust_brightness_contrast(color, u.brightness, u.contrast);

  return vec4f(clamp(color, vec3f(0.0), vec3f(1.0)), 1.0);
}
