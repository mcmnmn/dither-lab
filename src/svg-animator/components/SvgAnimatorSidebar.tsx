import { InputPanel } from './panels/InputPanel';
import { ElementInspectorPanel } from './panels/ElementInspectorPanel';
import { PresetPanel } from './panels/PresetPanel';

export function SvgAnimatorSidebar() {
  return (
    <aside className="flex w-[280px] flex-shrink-0 flex-col gap-4 overflow-y-auto border-r border-(--color-border) bg-(--color-bg-secondary) p-4">
      <InputPanel />
      <ElementInspectorPanel />
      <PresetPanel />
    </aside>
  );
}
