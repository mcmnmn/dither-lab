let cachedDevice: GPUDevice | null = null;

export function isWebGPUSupported(): boolean {
  return typeof navigator !== 'undefined' && 'gpu' in navigator;
}

export async function getGPUDevice(): Promise<GPUDevice> {
  if (cachedDevice && !cachedDevice.lost) return cachedDevice;

  if (!isWebGPUSupported()) {
    throw new Error('WebGPU is not supported in this browser');
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw new Error('No WebGPU adapter found');
  }

  const device = await adapter.requestDevice();
  device.lost.then(() => {
    cachedDevice = null;
  });

  cachedDevice = device;
  return device;
}

export function releaseGPUDevice() {
  if (cachedDevice) {
    cachedDevice.destroy();
    cachedDevice = null;
  }
}
