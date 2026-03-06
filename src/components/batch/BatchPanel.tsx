import { useCallback, useEffect, useRef } from 'react';
import { useAppState, useAppDispatch } from '../../state/app-context';
import { DropZone } from '../common/DropZone';
import { loadImageFile } from '../../utils/image-io';
import { PALETTE_PRESETS } from '../../palette/presets';
import { exportBatchAsZip } from '../../utils/output';
import { WorkerPool } from '../../services/worker-pool';
import { useBatchPreview } from '../../hooks/use-batch-preview';

export function BatchPanel() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const poolRef = useRef<WorkerPool | null>(null);
  useBatchPreview();

  useEffect(() => {
    poolRef.current = new WorkerPool();
    return () => {
      poolRef.current?.terminate();
      poolRef.current = null;
    };
  }, []);

  const handleFiles = useCallback((files: File[]) => {
    const items = files.map(file => ({
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      status: 'queued' as const,
    }));
    dispatch({ type: 'ADD_BATCH_ITEMS', items });

    // Generate thumbnails
    for (const item of items) {
      generateThumbnail(item.file).then(url => {
        if (url) {
          dispatch({ type: 'UPDATE_BATCH_ITEM', id: item.id, updates: { thumbnailUrl: url } });
        }
      });
    }
  }, [dispatch]);

  const handleProcess = useCallback(async () => {
    const pool = poolRef.current;
    if (!pool) return;

    dispatch({ type: 'SET_BATCH_PROCESSING', processing: true });

    const items = state.batchQueue.filter(i => i.status === 'queued');
    let completed = 0;

    let presetColors: number[][] | undefined;
    if (state.paletteMode === 'preset') {
      const preset = PALETTE_PRESETS.find(p => p.id === state.presetId);
      presetColors = preset?.colors;
    }

    const settings = {
      algorithmId: state.algorithmId,
      paletteMode: state.paletteMode,
      presetColors,
      manualColors: state.manualColors,
      colorCount: state.colorCount,
      strength: state.strength,
      threshold: state.threshold,
      customMatrix: state.customMatrix ?? undefined,
    };

    // Process items concurrently via worker pool
    const promises = items.map(async (item) => {
      dispatch({ type: 'UPDATE_BATCH_ITEM', id: item.id, updates: { status: 'processing' } });

      try {
        const imageData = await loadImageFile(item.file);
        const result = await pool.process(imageData, settings);

        dispatch({
          type: 'UPDATE_BATCH_ITEM',
          id: item.id,
          updates: { status: 'done', result: result.imageData },
        });
      } catch (err) {
        dispatch({
          type: 'UPDATE_BATCH_ITEM',
          id: item.id,
          updates: { status: 'error', error: err instanceof Error ? err.message : 'Unknown error' },
        });
      }

      completed++;
      dispatch({ type: 'SET_BATCH_PROGRESS', progress: completed / items.length });
    });

    await Promise.all(promises);
    dispatch({ type: 'SET_BATCH_PROCESSING', processing: false });
  }, [state, dispatch]);

  const handleOutput = useCallback(async () => {
    const results = state.batchQueue
      .filter(i => i.status === 'done' && i.result)
      .map(i => ({ fileName: i.file.name, imageData: i.result! }));

    if (results.length === 0) return;

    await exportBatchAsZip(
      results,
      state.exportFormat,
      state.exportScale,
      state.algorithmId,
      state.colorCount
    );
  }, [state]);

  const doneCount = state.batchQueue.filter(i => i.status === 'done').length;
  const errorCount = state.batchQueue.filter(i => i.status === 'error').length;

  return (
    <div className="flex h-full flex-col bg-(--color-bg)">
      {/* Drop area */}
      <DropZone
        onFiles={handleFiles}
        multiple
        className={`border-b border-(--color-border) p-4 ${
          state.batchQueue.length === 0 ? 'flex-1 flex items-center justify-center cursor-pointer' : 'cursor-pointer'
        }`}
      >
        {state.batchQueue.length === 0 ? (
          <div className="text-center">
            <div className="mb-3 text-2xl text-(--color-border)">[ + ]</div>
            <p className="text-xs text-(--color-text-secondary)">
              Drop images here or click to browse
            </p>
            <p className="mt-1 text-xs text-(--color-text-secondary) opacity-60">
              Add multiple images for batch processing
            </p>
          </div>
        ) : (
          <p className="text-xs text-(--color-text-secondary)">
            + Drop more images to add to queue
          </p>
        )}
      </DropZone>

      {/* Queue grid with preview cards */}
      {state.batchQueue.length > 0 && (
        <div className="flex-1 overflow-y-auto p-3">
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}
          >
            {state.batchQueue.map(item => (
              <div
                key={item.id}
                className="border border-(--color-border) bg-(--color-bg-secondary)"
              >
                {/* Thumbnail area */}
                <div className="relative w-full overflow-hidden border-b border-(--color-border) bg-(--color-bg-tertiary)">
                  {(item.previewUrl || item.thumbnailUrl) ? (
                    <img
                      src={item.previewUrl || item.thumbnailUrl}
                      alt=""
                      className="block w-full"
                    />
                  ) : (
                    <div className="flex aspect-square w-full items-center justify-center text-(--color-text-secondary) text-xs">
                      ...
                    </div>
                  )}

                  {/* Status overlay badge */}
                  <span className={`absolute top-1 right-1 px-1 py-0.5 text-[10px] font-bold leading-none border ${
                    item.status === 'done'
                      ? 'border-(--color-accent) bg-(--color-bg) text-(--color-accent)'
                      : item.status === 'error'
                      ? 'border-red-500 bg-(--color-bg) text-red-500'
                      : item.status === 'processing'
                      ? 'border-(--color-accent) bg-(--color-bg) text-(--color-accent)'
                      : 'border-(--color-border) bg-(--color-bg) text-(--color-text-secondary)'
                  }`}>
                    {item.status === 'done' ? 'DONE' :
                     item.status === 'error' ? 'ERR' :
                     item.status === 'processing' ? '...' :
                     'QUEUE'}
                  </span>
                </div>

                {/* Filename */}
                <div className="px-2 py-1.5">
                  <span
                    className="block truncate text-[10px] text-(--color-text-secondary)"
                    title={item.file.name}
                  >
                    {item.file.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Batch controls */}
      {state.batchQueue.length > 0 && (
        <div className="border-t border-(--color-border) bg-(--color-bg-secondary) p-3">
          {/* Progress bar */}
          {state.batchProcessing && (
            <div className="mb-3 h-2 w-full overflow-hidden border border-(--color-border) bg-(--color-bg)">
              <div
                className="h-full bg-(--color-accent) transition-all duration-300"
                style={{ width: `${state.batchProgress * 100}%` }}
              />
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-(--color-text-secondary) mb-2">
            <span>{state.batchQueue.length} images | {doneCount} done | {errorCount} errors</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleProcess}
              disabled={state.batchProcessing || state.batchQueue.every(i => i.status !== 'queued')}
              className="flex-1 border border-(--color-accent) bg-(--color-accent) px-4 py-2 text-xs font-bold uppercase text-(--color-accent-text) transition-colors hover:bg-(--color-accent-hover) disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {state.batchProcessing ? 'Processing...' : 'Process All'}
            </button>
            <button
              onClick={handleOutput}
              disabled={doneCount === 0}
              className="flex-1 border border-(--color-border) px-4 py-2 text-xs font-medium text-(--color-text) transition-colors hover:bg-(--color-bg-tertiary) disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Download ZIP
            </button>
            <button
              onClick={() => dispatch({ type: 'CLEAR_BATCH' })}
              disabled={state.batchProcessing}
              className="border border-(--color-border) px-3 py-2 text-xs text-(--color-text-secondary) transition-colors hover:bg-(--color-bg-tertiary) hover:text-(--color-text) disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function generateThumbnail(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const maxDim = 192;
      const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.6));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    img.src = url;
  });
}
