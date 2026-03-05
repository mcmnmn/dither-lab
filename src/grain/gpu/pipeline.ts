import { imageDataToTexture } from './texture-utils';
import {
  createUniformBuffer,
  updateUniformBuffer,
  packHalftoneUniforms,
  packCrosshatchUniforms,
  packVhsUniforms,
  packNoiseFieldUniforms,
  packAsciiUniforms,
  packPixelSortUniforms,
  packPreProcessUniforms,
  packPostProcessUniforms,
  isPreProcessActive,
  isPostProcessActive,
  hexToRgb,
} from './uniforms';
import type { GrainState, GrainEffectId } from '../state/types';

import commonShader from './shaders/common.wgsl?raw';
import halftoneShader from './shaders/halftone.wgsl?raw';
import crosshatchShader from './shaders/crosshatch.wgsl?raw';
import vhsShader from './shaders/vhs.wgsl?raw';
import noiseFieldShader from './shaders/noise-field.wgsl?raw';
import asciiShader from './shaders/ascii.wgsl?raw';
import pixelSortShader from './shaders/pixel-sort.wgsl?raw';
import preprocessShader from './shaders/preprocess.wgsl?raw';
import postprocessShader from './shaders/postprocess.wgsl?raw';

const SHAPE_MAP: Record<string, number> = { circle: 0, diamond: 1, square: 2 };
const COLOR_MODE_MAP: Record<string, number> = { original: 0, mono: 1 };
const CHAR_SET_MAP: Record<string, number> = {
  standard: 0, blocks: 1, binary: 2, detailed: 3, minimal: 4,
  alphabetic: 5, numeric: 6, math: 7, symbols: 8,
};
const SORT_BY_MAP: Record<string, number> = { brightness: 0, hue: 1, saturation: 2 };
const DIRECTION_MAP: Record<string, number> = { horizontal: 0, vertical: 1 };
const NOISE_TYPE_MAP: Record<string, number> = { perlin: 0, simplex: 1 };

interface EffectPipeline {
  pipeline: GPURenderPipeline;
  uniformBuffer: GPUBuffer | null;
}

export class GrainPipeline {
  private device: GPUDevice;
  private context: GPUCanvasContext;
  private format: GPUTextureFormat;

  private sourceTexture: GPUTexture | null = null;
  private sampler: GPUSampler;

  // Per-effect pipelines (all target this.format for both canvas and intermediates)
  private effects: Partial<Record<GrainEffectId, EffectPipeline>> = {};

  // Pre-processing pipeline (always targets intermediate format)
  private preprocessPipeline: GPURenderPipeline | null = null;
  private preprocessUniformBuffer: GPUBuffer | null = null;

  // Post-processing pipeline (always targets canvas format)
  private postprocessPipeline: GPURenderPipeline | null = null;
  private postprocessUniformBuffer: GPUBuffer | null = null;

  // Intermediate textures for multi-pass rendering (ping-pong)
  private intermediateA: GPUTexture | null = null;
  private intermediateB: GPUTexture | null = null;
  private intermediateWidth = 0;
  private intermediateHeight = 0;

  // Frame counter for animated effects
  private frameCount = 0;

  constructor(device: GPUDevice, canvas: HTMLCanvasElement) {
    this.device = device;
    this.context = canvas.getContext('webgpu')!;
    this.format = navigator.gpu.getPreferredCanvasFormat();

    this.context.configure({
      device,
      format: this.format,
      alphaMode: 'premultiplied',
    });

    this.sampler = device.createSampler({
      magFilter: 'linear',
      minFilter: 'linear',
    });

    this.initPipelines();
  }

  /** Create a pipeline from raw shader code (no common.wgsl prefix) targeting a specific format */
  private createRawPipeline(label: string, shaderCode: string, format: GPUTextureFormat): GPURenderPipeline {
    const module = this.device.createShaderModule({ label, code: shaderCode });

    return this.device.createRenderPipeline({
      label,
      layout: 'auto',
      vertex: { module, entryPoint: 'vs' },
      fragment: {
        module,
        entryPoint: 'fs',
        targets: [{ format }],
      },
      primitive: { topology: 'triangle-list' },
    });
  }

  /** Create an effect pipeline targeting a specific format */
  private createEffectPipelineForFormat(label: string, shaderCode: string, format: GPUTextureFormat): GPURenderPipeline {
    const fullCode = commonShader + '\n' + shaderCode;
    return this.createRawPipeline(label, fullCode, format);
  }

  private initPipelines() {
    // Create all effect pipelines (all use this.format since intermediates share the same format)
    const effectShaders: [GrainEffectId, string][] = [
      ['halftone', halftoneShader],
      ['crosshatch', crosshatchShader],
      ['vhs', vhsShader],
      ['noise-field', noiseFieldShader],
      ['ascii', asciiShader],
      ['pixel-sort', pixelSortShader],
    ];

    for (const [id, shader] of effectShaders) {
      this.effects[id] = {
        pipeline: this.createEffectPipelineForFormat(id, shader, this.format),
        uniformBuffer: null,
      };
    }

    // Pre-processing pipeline (renders to intermediate texture, same format as canvas)
    this.preprocessPipeline = this.createRawPipeline('preprocess', preprocessShader, this.format);

    // Post-processing pipeline (self-contained shader, no common.wgsl needed)
    this.postprocessPipeline = this.createRawPipeline('postprocess', postprocessShader, this.format);
  }

  /** Ensure intermediate textures exist and match the needed size */
  private ensureIntermediateTextures(width: number, height: number) {
    if (this.intermediateWidth === width && this.intermediateHeight === height && this.intermediateA && this.intermediateB) {
      return;
    }

    this.intermediateA?.destroy();
    this.intermediateB?.destroy();

    const desc: GPUTextureDescriptor = {
      size: { width, height },
      format: this.format,
      usage:
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.RENDER_ATTACHMENT |
        GPUTextureUsage.COPY_SRC |
        GPUTextureUsage.COPY_DST,
    };

    this.intermediateA = this.device.createTexture({ ...desc, label: 'intermediate-A' });
    this.intermediateB = this.device.createTexture({ ...desc, label: 'intermediate-B' });
    this.intermediateWidth = width;
    this.intermediateHeight = height;
  }

  setSource(imageData: ImageData) {
    if (this.sourceTexture) {
      this.sourceTexture.destroy();
    }
    this.sourceTexture = imageDataToTexture(this.device, imageData, 'source');
  }

  /** Upload a video frame directly to the source texture (zero-copy GPU path) */
  setVideoFrame(video: HTMLVideoElement) {
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (w === 0 || h === 0) return;

    // Recreate texture if dimensions changed
    if (!this.sourceTexture || this.sourceTexture.width !== w || this.sourceTexture.height !== h) {
      this.sourceTexture?.destroy();
      this.sourceTexture = this.device.createTexture({
        label: 'source-video',
        size: { width: w, height: h },
        format: 'rgba8unorm',
        usage:
          GPUTextureUsage.TEXTURE_BINDING |
          GPUTextureUsage.COPY_DST |
          GPUTextureUsage.COPY_SRC |
          GPUTextureUsage.RENDER_ATTACHMENT,
      });
    }

    this.device.queue.copyExternalImageToTexture(
      { source: video },
      { texture: this.sourceTexture },
      { width: w, height: h }
    );
  }

  render(state: GrainState) {
    if (!this.sourceTexture) return;

    this.frameCount++;

    const canvasTexture = this.context.getCurrentTexture();
    const w = canvasTexture.width;
    const h = canvasTexture.height;
    const encoder = this.device.createCommandEncoder();

    const proc = state.processing;
    const post = state.postProcessing;
    const needsPreProcess = isPreProcessActive(proc.invert, proc.brightnessMap, proc.edgeEnhance, proc.blur, proc.quantizeColors);
    const needsPostProcess = isPostProcessActive(post.bloom, post.grain, post.chromatic, post.scanlines, post.vignette, post.crtCurve);

    // Determine the pipeline flow:
    // Case 1: No pre or post → source → effect → canvas
    // Case 2: Pre only → source → pre(→intA) → effect(intA→canvas)
    // Case 3: Post only → source → effect(→intA) → post(intA→canvas)
    // Case 4: Pre+Post → source → pre(→intA) → effect(intA→intB) → post(intB→canvas)

    const effect = this.effects[state.activeEffect];
    if (!effect) return;

    if (!needsPreProcess && !needsPostProcess) {
      // Simple path: source → effect → canvas
      const uniformData = this.packEffectUniforms(state, w, h);
      this.renderEffectPass(encoder, this.sourceTexture, canvasTexture, effect, uniformData);
    } else {
      this.ensureIntermediateTextures(w, h);
      const intA = this.intermediateA!;
      const intB = this.intermediateB!;

      if (needsPreProcess && needsPostProcess) {
        // source → pre → intA, intA → effect → intB, intB → post → canvas
        this.renderPreProcess(encoder, this.sourceTexture, intA, state, w, h);
        const uniformData = this.packEffectUniforms(state, w, h);
        this.renderEffectPass(encoder, intA, intB, effect, uniformData);
        this.renderPostProcess(encoder, intB, canvasTexture, state, w, h);
      } else if (needsPreProcess) {
        // source → pre → intA, intA → effect → canvas
        this.renderPreProcess(encoder, this.sourceTexture, intA, state, w, h);
        const uniformData = this.packEffectUniforms(state, w, h);
        this.renderEffectPass(encoder, intA, canvasTexture, effect, uniformData);
      } else {
        // source → effect → intA, intA → post → canvas
        const uniformData = this.packEffectUniforms(state, w, h);
        this.renderEffectPass(encoder, this.sourceTexture, intA, effect, uniformData);
        this.renderPostProcess(encoder, intA, canvasTexture, state, w, h);
      }
    }

    this.device.queue.submit([encoder.finish()]);
  }

  private packEffectUniforms(state: GrainState, w: number, h: number): ArrayBuffer {
    switch (state.activeEffect) {
      case 'halftone': {
        const s = state.halftone;
        return packHalftoneUniforms(
          w, h, s.dotScale, s.spacing, s.angle, s.brightness, s.contrast,
          SHAPE_MAP[s.shape] ?? 0, s.invert, COLOR_MODE_MAP[s.colorMode] ?? 0
        );
      }
      case 'crosshatch': {
        const s = state.crosshatch;
        return packCrosshatchUniforms(
          w, h, s.lineWidth, s.spacing, s.angle, s.layers,
          s.brightness, s.contrast, COLOR_MODE_MAP[s.colorMode] ?? 0
        );
      }
      case 'vhs': {
        const s = state.vhs;
        return packVhsUniforms(
          w, h, s.tracking, s.noise, s.colorBleed, s.distortion,
          s.brightness, s.contrast
        );
      }
      case 'noise-field': {
        const s = state.noiseField;
        return packNoiseFieldUniforms(
          w, h, s.scale, s.intensity, s.octaves, s.speed, 0,
          s.distortOnly, s.brightness, s.contrast,
          NOISE_TYPE_MAP[s.noiseType] ?? 0
        );
      }
      case 'ascii': {
        const s = state.ascii;
        return packAsciiUniforms(
          w, h, s.scale, s.spacing, s.intensity,
          CHAR_SET_MAP[s.charSet] ?? 0, COLOR_MODE_MAP[s.colorMode] ?? 0,
          hexToRgb(s.fgColor), hexToRgb(s.bgColor),
          s.brightness, s.contrast, s.saturation, s.hueRotation,
          s.sharpness, s.gamma
        );
      }
      case 'pixel-sort': {
        const s = state.pixelSort;
        return packPixelSortUniforms(
          w, h, s.threshold, SORT_BY_MAP[s.sortBy] ?? 0,
          DIRECTION_MAP[s.direction] ?? 0, s.randomness,
          s.brightness, s.contrast
        );
      }
      default:
        return new ArrayBuffer(0);
    }
  }

  /** Render an effect from a source texture to a target texture or canvas */
  private renderEffectPass(
    encoder: GPUCommandEncoder,
    source: GPUTexture,
    target: GPUTexture,
    effect: EffectPipeline,
    uniformData: ArrayBuffer
  ) {
    if (!effect.uniformBuffer) {
      effect.uniformBuffer = createUniformBuffer(this.device, uniformData, 'effect-uniforms');
    } else {
      updateUniformBuffer(this.device, effect.uniformBuffer, uniformData);
    }

    const bindGroup = this.device.createBindGroup({
      layout: effect.pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: source.createView() },
        { binding: 1, resource: this.sampler },
        { binding: 2, resource: { buffer: effect.uniformBuffer } },
      ],
    });

    const pass = encoder.beginRenderPass({
      colorAttachments: [{
        view: target.createView(),
        loadOp: 'clear',
        storeOp: 'store',
        clearValue: { r: 0, g: 0, b: 0, a: 1 },
      }],
    });

    pass.setPipeline(effect.pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.draw(3);
    pass.end();
  }

  /** Render pre-processing pass: source → intermediate texture */
  private renderPreProcess(
    encoder: GPUCommandEncoder,
    source: GPUTexture,
    target: GPUTexture,
    state: GrainState,
    w: number,
    h: number
  ) {
    if (!this.preprocessPipeline) return;

    const proc = state.processing;
    const uniformData = packPreProcessUniforms(
      w, h, proc.invert, proc.brightnessMap, proc.edgeEnhance, proc.blur, proc.quantizeColors
    );

    if (!this.preprocessUniformBuffer) {
      this.preprocessUniformBuffer = createUniformBuffer(this.device, uniformData, 'preprocess-uniforms');
    } else {
      updateUniformBuffer(this.device, this.preprocessUniformBuffer, uniformData);
    }

    const bindGroup = this.device.createBindGroup({
      layout: this.preprocessPipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: source.createView() },
        { binding: 1, resource: this.sampler },
        { binding: 2, resource: { buffer: this.preprocessUniformBuffer } },
      ],
    });

    const pass = encoder.beginRenderPass({
      colorAttachments: [{
        view: target.createView(),
        loadOp: 'clear',
        storeOp: 'store',
        clearValue: { r: 0, g: 0, b: 0, a: 1 },
      }],
    });

    pass.setPipeline(this.preprocessPipeline);
    pass.setBindGroup(0, bindGroup);
    pass.draw(3);
    pass.end();
  }

  /** Render post-processing pass: intermediate → canvas */
  private renderPostProcess(
    encoder: GPUCommandEncoder,
    source: GPUTexture,
    target: GPUTexture,
    state: GrainState,
    w: number,
    h: number
  ) {
    if (!this.postprocessPipeline) return;

    const post = state.postProcessing;
    const uniformData = packPostProcessUniforms(
      w, h,
      post.bloom,
      post.grain,
      this.frameCount,
      post.chromatic,
      post.scanlines,
      post.vignette,
      post.crtCurve
    );

    if (!this.postprocessUniformBuffer) {
      this.postprocessUniformBuffer = createUniformBuffer(this.device, uniformData, 'postprocess-uniforms');
    } else {
      updateUniformBuffer(this.device, this.postprocessUniformBuffer, uniformData);
    }

    const bindGroup = this.device.createBindGroup({
      layout: this.postprocessPipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: source.createView() },
        { binding: 1, resource: this.sampler },
        { binding: 2, resource: { buffer: this.postprocessUniformBuffer } },
      ],
    });

    const pass = encoder.beginRenderPass({
      colorAttachments: [{
        view: target.createView(),
        loadOp: 'clear',
        storeOp: 'store',
        clearValue: { r: 0, g: 0, b: 0, a: 1 },
      }],
    });

    pass.setPipeline(this.postprocessPipeline);
    pass.setBindGroup(0, bindGroup);
    pass.draw(3);
    pass.end();
  }

  destroy() {
    this.sourceTexture?.destroy();
    this.intermediateA?.destroy();
    this.intermediateB?.destroy();
    this.preprocessUniformBuffer?.destroy();
    this.postprocessUniformBuffer?.destroy();
    for (const effect of Object.values(this.effects)) {
      effect?.uniformBuffer?.destroy();
    }
    this.effects = {};
    this.sourceTexture = null;
    this.intermediateA = null;
    this.intermediateB = null;
  }
}
