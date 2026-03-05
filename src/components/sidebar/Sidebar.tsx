import { useCallback } from 'react';
import { useAppState, useAppDispatch } from '../../state/app-context';
import { AlgorithmSelector } from './AlgorithmSelector';
import { PaletteControls } from './PaletteControls';
import { OutputSettings } from './OutputSettings';
import { InputSection } from './InputSection';
import { exportSingle } from '../../utils/export';
import { processImage } from '../../services/dither-engine';
import { PALETTE_PRESETS } from '../../palette/presets';
import { cropImageData } from '../../utils/crop';
import { loadImageFile } from '../../utils/image-io';
import { detectMediaType, loadVideoFile } from '../../utils/media-io';
import type { BatchItem } from '../../state/types';

export function Sidebar() {
  const state = useAppState();
  const dispatch = useAppDispatch();

  const handleFiles = useCallback(async (files: File[]) => {
    if (state.mode === 'batch') {
      const items: BatchItem[] = files.map(file => ({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        status: 'queued',
      }));
      dispatch({ type: 'ADD_BATCH_ITEMS', items });
      return;
    }
    const file = files[0];
    if (!file) return;
    const mediaType = detectMediaType(file);
    if (mediaType === 'video') {
      const videoElement = await loadVideoFile(file);
      dispatch({ type: 'SET_VIDEO_SOURCE', videoElement, file, fileName: file.name });
    } else if (mediaType === 'glb') {
      const glbUrl = URL.createObjectURL(file);
      dispatch({ type: 'SET_GLB_SOURCE', glbUrl, file, fileName: file.name });
    } else {
      const imageData = await loadImageFile(file);
      dispatch({ type: 'SET_SOURCE', imageData, file, fileName: file.name });
    }
  }, [dispatch, state.mode]);


  const handleDownload = async () => {
    if (!state.sourceImage) return;

    // Process full-resolution image for export
    let presetColors: number[][] | undefined;
    if (state.paletteMode === 'preset') {
      const preset = PALETTE_PRESETS.find(p => p.id === state.presetId);
      presetColors = preset?.colors;
    }

    const cropped = cropImageData(state.sourceImage, state.cropAspectRatio);

    const result = processImage({
      imageData: cropped,
      settings: {
        algorithmId: state.algorithmId,
        paletteMode: state.paletteMode,
        presetColors,
        manualColors: state.manualColors,
        colorCount: state.colorCount,
        strength: state.strength,
        threshold: state.threshold,
        customMatrix: state.customMatrix ?? undefined,
      },
    });

    await exportSingle(
      result.imageData,
      state.fileName || 'image',
      state.exportFormat,
      state.exportScale,
      state.algorithmId,
      state.colorCount
    );
  };

  return (
    <aside className="flex w-[280px] flex-shrink-0 flex-col gap-4 overflow-y-auto border-r border-(--color-border) bg-(--color-bg-secondary) p-4 max-md:w-full max-md:border-r-0">
      <InputSection
        onFiles={handleFiles}
        showModeToggle

        multiple={state.mode === 'batch'}
      />
      <PaletteControls />
      <AlgorithmSelector />
      <OutputSettings />

      {/* Processing info */}
      {state.processingTime > 0 && (
        <div className="border border-(--color-border) px-2 py-1 text-xs text-(--color-text-secondary)">
          &gt; Processed in {state.processingTime.toFixed(0)}ms
        </div>
      )}

      {/* Download button */}
      <button
        onClick={handleDownload}
        disabled={!state.resultImage}
        className="mt-auto w-full border border-(--color-accent) bg-(--color-accent) px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-(--color-accent-text) transition-colors hover:bg-(--color-accent-hover) hover:border-(--color-accent-hover) disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {'>> Download <<'}
      </button>
    </aside>
  );
}
