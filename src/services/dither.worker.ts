import { processImage, type EngineInput } from './dither-engine';

export interface WorkerRequest {
  id: string;
  imageData: ImageData;
  settings: EngineInput['settings'];
}

export interface WorkerResponse {
  id: string;
  type: 'result' | 'error';
  imageData?: ImageData;
  duration?: number;
  error?: string;
}

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const { id, imageData, settings } = e.data;

  try {
    const result = processImage({ imageData, settings });
    const response: WorkerResponse = {
      id,
      type: 'result',
      imageData: result.imageData,
      duration: result.duration,
    };
    self.postMessage(response);
  } catch (err) {
    const response: WorkerResponse = {
      id,
      type: 'error',
      error: err instanceof Error ? err.message : 'Unknown error',
    };
    self.postMessage(response);
  }
};
