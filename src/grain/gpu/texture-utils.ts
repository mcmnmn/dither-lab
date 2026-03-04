/**
 * Upload an ImageData to a GPUTexture.
 */
export function imageDataToTexture(
  device: GPUDevice,
  imageData: ImageData,
  label = 'source'
): GPUTexture {
  const texture = device.createTexture({
    label,
    size: { width: imageData.width, height: imageData.height },
    format: 'rgba8unorm',
    usage:
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.COPY_SRC |
      GPUTextureUsage.RENDER_ATTACHMENT,
  });

  device.queue.writeTexture(
    { texture },
    imageData.data,
    { bytesPerRow: imageData.width * 4, rowsPerImage: imageData.height },
    { width: imageData.width, height: imageData.height }
  );

  return texture;
}

/**
 * Create an empty GPUTexture for intermediate rendering.
 */
export function createRenderTexture(
  device: GPUDevice,
  width: number,
  height: number,
  label = 'render'
): GPUTexture {
  return device.createTexture({
    label,
    size: { width, height },
    format: 'rgba8unorm',
    usage:
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.COPY_SRC |
      GPUTextureUsage.RENDER_ATTACHMENT |
      GPUTextureUsage.STORAGE_BINDING,
  });
}

/**
 * Read a GPUTexture back to an ImageData (for export).
 */
export async function textureToImageData(
  device: GPUDevice,
  texture: GPUTexture,
  width: number,
  height: number
): Promise<ImageData> {
  const bytesPerRow = Math.ceil((width * 4) / 256) * 256;
  const bufferSize = bytesPerRow * height;

  const buffer = device.createBuffer({
    size: bufferSize,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  });

  const encoder = device.createCommandEncoder();
  encoder.copyTextureToBuffer(
    { texture },
    { buffer, bytesPerRow },
    { width, height }
  );
  device.queue.submit([encoder.finish()]);

  await buffer.mapAsync(GPUMapMode.READ);
  const mapped = new Uint8Array(buffer.getMappedRange());

  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let row = 0; row < height; row++) {
    const srcOffset = row * bytesPerRow;
    const dstOffset = row * width * 4;
    pixels.set(mapped.subarray(srcOffset, srcOffset + width * 4), dstOffset);
  }

  buffer.unmap();
  buffer.destroy();

  return new ImageData(pixels, width, height);
}
