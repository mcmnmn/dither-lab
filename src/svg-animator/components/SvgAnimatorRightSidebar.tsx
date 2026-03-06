import { ControlsPanel } from './panels/ControlsPanel';
import { PreviewControlsPanel } from './panels/PreviewControlsPanel';

export function SvgAnimatorRightSidebar() {
  return (
    <aside className="flex w-[280px] flex-shrink-0 flex-col gap-4 overflow-y-auto border-l border-(--color-border) bg-(--color-bg-secondary) p-4">
      <ControlsPanel />
      <PreviewControlsPanel />
    </aside>
  );
}
