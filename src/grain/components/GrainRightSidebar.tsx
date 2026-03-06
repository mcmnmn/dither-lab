import { useCallback } from 'react';
import { useGrainState } from '../state/grain-context';
import { useAppState, useAppDispatch } from '../../state/app-context';
import { useGrainOutput } from '../hooks/use-grain-output';
import { EffectSettings } from './effects';
import { ProcessingPanel } from './panels/ProcessingPanel';
import { PostProcessingPanel } from './panels/PostProcessingPanel';
import { OutputPanel } from './panels/OutputPanel';
import { InputSection } from '../../components/sidebar/InputSection';
import { loadImageFile } from '../../utils/image-io';
import type { BatchItem } from '../../state/types';

interface GrainRightSidebarProps {
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
}

export function GrainRightSidebar({ canvasRef }: GrainRightSidebarProps) {
  const { activeEffect } = useGrainState();
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { download } = useGrainOutput(canvasRef ?? { current: null });

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
    const imageData = await loadImageFile(file);
    dispatch({ type: 'SET_SOURCE', imageData, file, fileName: file.name });
  }, [dispatch, state.mode]);

  return (
    <aside className="flex w-[280px] flex-shrink-0 flex-col gap-4 overflow-y-auto border-r border-(--color-border) bg-(--color-bg-secondary) p-4">
      <InputSection
        onFiles={handleFiles}
        showModeToggle
        multiple={state.mode === 'batch'}
      />

      {/* Per-effect settings */}
      <section>
        <EffectSettings effect={activeEffect} />
      </section>

      {/* Processing & Post-Processing */}
      <ProcessingPanel />
      <PostProcessingPanel />

      {/* Output */}
      <div className="mt-auto">
        <OutputPanel
          onDownload={download}
          disabled={!state.sourceImage}
        />
      </div>
    </aside>
  );
}
