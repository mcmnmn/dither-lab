import type { WorkerRequest, WorkerResponse } from './dither.worker';
import type { EngineInput } from './dither-engine';

interface PendingJob {
  id: string;
  resolve: (result: { imageData: ImageData; duration: number }) => void;
  reject: (error: Error) => void;
}

export class WorkerPool {
  private workers: Worker[] = [];
  private pending = new Map<string, PendingJob>();
  private queue: { request: WorkerRequest; job: PendingJob }[] = [];
  private available: Worker[] = [];

  constructor(poolSize?: number) {
    const size = Math.min(
      Math.max(poolSize ?? navigator.hardwareConcurrency ?? 4, 2),
      8
    );

    for (let i = 0; i < size; i++) {
      const worker = new Worker(
        new URL('./dither.worker.ts', import.meta.url),
        { type: 'module' }
      );

      worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
        this.handleResponse(worker, e.data);
      };

      worker.onerror = (err) => {
        // Find any pending job for this worker and reject it
        for (const [id, job] of this.pending) {
          job.reject(new Error(`Worker error: ${err.message}`));
          this.pending.delete(id);
          break;
        }
        this.available.push(worker);
        this.processQueue();
      };

      this.workers.push(worker);
      this.available.push(worker);
    }
  }

  process(
    imageData: ImageData,
    settings: EngineInput['settings']
  ): Promise<{ imageData: ImageData; duration: number }> {
    return new Promise((resolve, reject) => {
      const id = `job-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const request: WorkerRequest = { id, imageData, settings };
      const job: PendingJob = { id, resolve, reject };

      if (this.available.length > 0) {
        this.dispatch(request, job);
      } else {
        this.queue.push({ request, job });
      }
    });
  }

  private dispatch(request: WorkerRequest, job: PendingJob) {
    const worker = this.available.pop()!;
    this.pending.set(request.id, job);
    worker.postMessage(request);
  }

  private handleResponse(worker: Worker, response: WorkerResponse) {
    const job = this.pending.get(response.id);
    if (!job) return;
    this.pending.delete(response.id);

    if (response.type === 'result' && response.imageData) {
      job.resolve({ imageData: response.imageData, duration: response.duration ?? 0 });
    } else {
      job.reject(new Error(response.error ?? 'Unknown worker error'));
    }

    this.available.push(worker);
    this.processQueue();
  }

  private processQueue() {
    while (this.queue.length > 0 && this.available.length > 0) {
      const next = this.queue.shift()!;
      this.dispatch(next.request, next.job);
    }
  }

  terminate() {
    for (const worker of this.workers) {
      worker.terminate();
    }
    this.workers = [];
    this.available = [];

    for (const [, job] of this.pending) {
      job.reject(new Error('Worker pool terminated'));
    }
    this.pending.clear();
    this.queue = [];
  }
}
