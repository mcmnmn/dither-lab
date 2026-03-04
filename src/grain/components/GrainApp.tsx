import { useRef } from 'react';
import { GrainCanvas } from './GrainCanvas';
import { GrainLeftSidebar } from './GrainLeftSidebar';
import { GrainRightSidebar } from './GrainRightSidebar';
import { useGrainPersistence } from '../hooks/use-grain-persistence';
import { useGrainState, useGrainDispatch } from '../state/grain-context';
import { useAppState } from '../../state/app-context';
import { EFFECTS, EffectSettings } from './effects';
import { useGrainExport } from '../hooks/use-grain-export';
import { ProcessingPanel } from './panels/ProcessingPanel';
import { PostProcessingPanel } from './panels/PostProcessingPanel';
import { ExportPanel } from './panels/ExportPanel';

interface GrainAppProps {
  isNarrow: boolean;
  sidebarOpen: boolean;
  onCloseSidebar: () => void;
  toolSwitcher: React.ReactNode;
}

export function GrainApp({ isNarrow, sidebarOpen, onCloseSidebar, toolSwitcher }: GrainAppProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useGrainPersistence();

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
      <GrainLeftSidebar />
      <main className="flex-1 overflow-hidden">
        <GrainCanvas canvasRef={canvasRef} />
      </main>
      <GrainRightSidebar canvasRef={canvasRef} />
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
  const { sourceImage } = useAppState();
  const dispatch = useGrainDispatch();
  const { exportFormat, setFormat, download } = useGrainExport(canvasRef);

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <main className="flex-1 overflow-hidden">
        <GrainCanvas canvasRef={canvasRef} />
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
              {/* Effects list */}
              <section>
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-(--color-text-secondary)">
                  Effects
                </div>
                <div className="flex flex-col gap-0.5">
                  {EFFECTS.map(effect => (
                    <button
                      key={effect.id}
                      onClick={() => dispatch({ type: 'GRAIN_SET_EFFECT', effect: effect.id })}
                      className={`px-2 py-1.5 text-left text-xs font-medium transition-colors ${
                        activeEffect === effect.id
                          ? 'bg-(--color-accent) text-(--color-accent-text)'
                          : 'text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-tertiary)'
                      }`}
                    >
                      {effect.label}
                    </button>
                  ))}
                </div>
              </section>

              {/* Per-effect settings */}
              <section>
                <EffectSettings effect={activeEffect} />
              </section>

              {/* Processing & Post-Processing */}
              <ProcessingPanel />
              <PostProcessingPanel />

              {/* Export */}
              <ExportPanel
                format={exportFormat}
                onFormatChange={setFormat}
                onDownload={download}
                disabled={!sourceImage}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
