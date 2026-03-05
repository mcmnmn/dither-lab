import { useRef, useEffect, useCallback } from 'react';
import { GrainCanvas } from './GrainCanvas';
import { GrainRightSidebar } from './GrainRightSidebar';
import { useGrainPersistence } from '../hooks/use-grain-persistence';
import { useGrainState, useGrainDispatch } from '../state/grain-context';
import { useAppState, useAppDispatch } from '../../state/app-context';
import { EffectSettings } from './effects';
import { useGrainExport } from '../hooks/use-grain-export';
import { ProcessingPanel } from './panels/ProcessingPanel';
import { PostProcessingPanel } from './panels/PostProcessingPanel';
import { ExportPanel } from './panels/ExportPanel';
import { InputSection } from '../../components/sidebar/InputSection';
import { BatchPanel } from '../../components/batch/BatchPanel';
import { loadImageFile } from '../../utils/image-io';
import { detectMediaType, loadVideoFile } from '../../utils/media-io';
import type { GrainEffectId } from '../state/types';
import type { BatchItem } from '../../state/types';

interface GrainAppProps {
  effectId: GrainEffectId;
  isNarrow: boolean;
  sidebarOpen: boolean;
  onCloseSidebar: () => void;
  toolSwitcher: React.ReactNode;
}

export function GrainApp({ effectId, isNarrow, sidebarOpen, onCloseSidebar, toolSwitcher }: GrainAppProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const grainDispatch = useGrainDispatch();
  const { mode } = useAppState();
  useGrainPersistence();

  // Sync activeEffect from tab selection
  useEffect(() => {
    grainDispatch({ type: 'GRAIN_SET_EFFECT', effect: effectId });
  }, [effectId, grainDispatch]);

  if (isNarrow) {
    return (
      <GrainNarrowLayout
        canvasRef={canvasRef}
        sidebarOpen={sidebarOpen}
        onCloseSidebar={onCloseSidebar}
        toolSwitcher={toolSwitcher}
      />
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <GrainRightSidebar canvasRef={canvasRef} />
      <main className="flex-1 overflow-hidden">
        {mode === 'batch' ? <BatchPanel /> : <GrainCanvas canvasRef={canvasRef} />}
      </main>
    </div>
  );
}

function GrainNarrowLayout({
  canvasRef,
  sidebarOpen,
  onCloseSidebar,
  toolSwitcher,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  sidebarOpen: boolean;
  onCloseSidebar: () => void;
  toolSwitcher: React.ReactNode;
}) {
  const { activeEffect } = useGrainState();
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { download } = useGrainExport(canvasRef);

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


  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <main className="flex-1 overflow-hidden">
        {state.mode === 'batch' ? <BatchPanel /> : <GrainCanvas canvasRef={canvasRef} />}
      </main>
      {sidebarOpen && (
        <>
          <div className="absolute inset-0 z-40 bg-black/30" onClick={onCloseSidebar} />
          <div className="absolute inset-x-0 bottom-0 z-50 max-h-[70vh] overflow-y-auto border-t-2 border-(--color-border) bg-(--color-bg-secondary)">
            <div className="flex items-center justify-between border-b border-(--color-border) px-4 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-(--color-text-secondary)">Settings</span>
              <button onClick={onCloseSidebar} className="border border-(--color-border) p-1 text-(--color-text-secondary) hover:text-(--color-text)">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            {toolSwitcher}
            <div className="flex flex-col gap-4 p-4">
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

              {/* Export */}
              <ExportPanel
                onDownload={download}
                disabled={!state.sourceImage}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
