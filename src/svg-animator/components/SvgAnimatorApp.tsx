import { SvgAnimatorSidebar } from './SvgAnimatorSidebar';
import { SvgAnimatorRightSidebar } from './SvgAnimatorRightSidebar';
import { SvgAnimatorPreview } from './SvgAnimatorPreview';
import { ExportModal } from './ExportModal';
import { InputPanel } from './panels/InputPanel';
import { ElementInspectorPanel } from './panels/ElementInspectorPanel';
import { PresetPanel } from './panels/PresetPanel';
import { ControlsPanel } from './panels/ControlsPanel';
import { PreviewControlsPanel } from './panels/PreviewControlsPanel';
import { ExportPanel } from './panels/ExportPanel';
import { useSvgAnimatorPersistence } from '../hooks/use-svg-animator-persistence';

interface SvgAnimatorAppProps {
  isNarrow: boolean;
  sidebarOpen: boolean;
  onCloseSidebar: () => void;
  toolSwitcher: React.ReactNode;
}

export function SvgAnimatorApp({ isNarrow, sidebarOpen, onCloseSidebar, toolSwitcher }: SvgAnimatorAppProps) {
  useSvgAnimatorPersistence();

  if (isNarrow) {
    return (
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <main className="flex flex-1 flex-col overflow-hidden">
          <SvgAnimatorPreview />
        </main>
        {sidebarOpen && (
          <>
            <div className="absolute inset-0 z-40 bg-black/30" onClick={onCloseSidebar} />
            <div className="absolute inset-x-0 bottom-0 z-50 max-h-[70vh] overflow-y-auto border-t-2 border-(--color-border) bg-(--color-bg-secondary)">
              <div className="flex items-center justify-between border-b border-(--color-border) px-4 py-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-(--color-text-secondary)">Settings</span>
                <button onClick={onCloseSidebar} className="border border-(--color-border) p-1 text-(--color-text-secondary) hover:text-(--color-text)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              {toolSwitcher}
              <div className="flex flex-col gap-4 p-4">
                <InputPanel />
                <ElementInspectorPanel />
                <PresetPanel />
                <ControlsPanel />
                <PreviewControlsPanel />
                <ExportPanel />
              </div>
            </div>
          </>
        )}
        <ExportModal />
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <SvgAnimatorSidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        <SvgAnimatorPreview />
      </main>
      <SvgAnimatorRightSidebar />
      <ExportModal />
    </div>
  );
}
