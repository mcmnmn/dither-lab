import { PresetsPanel } from './panels/PresetsPanel';

export function MeshGradientRightSidebar() {
  return (
    <aside className="flex w-[240px] flex-shrink-0 flex-col overflow-y-auto border-l border-(--color-border) bg-(--color-bg-secondary) p-4">
      <PresetsPanel />
    </aside>
  );
}
