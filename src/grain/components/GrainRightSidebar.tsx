import { useGrainState } from '../state/grain-context';
import { useAppState } from '../../state/app-context';
import { useGrainExport } from '../hooks/use-grain-export';
import { EffectSettings } from './effects';
import { ProcessingPanel } from './panels/ProcessingPanel';
import { PostProcessingPanel } from './panels/PostProcessingPanel';
import { ExportPanel } from './panels/ExportPanel';

interface GrainRightSidebarProps {
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
}

export function GrainRightSidebar({ canvasRef }: GrainRightSidebarProps) {
  const { activeEffect } = useGrainState();
  const { sourceImage } = useAppState();
  const { exportFormat, setFormat, download } = useGrainExport(canvasRef ?? { current: null });

  return (
    <aside className="flex w-[280px] flex-shrink-0 flex-col gap-4 overflow-y-auto border-l border-(--color-border) bg-(--color-bg-secondary) p-4">
      {/* Per-effect settings */}
      <section>
        <EffectSettings effect={activeEffect} />
      </section>

      {/* Processing & Post-Processing */}
      <ProcessingPanel />
      <PostProcessingPanel />

      {/* Export */}
      <div className="mt-auto">
        <ExportPanel
          format={exportFormat}
          onFormatChange={setFormat}
          onDownload={download}
          disabled={!sourceImage}
        />
      </div>
    </aside>
  );
}
