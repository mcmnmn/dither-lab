import { InputsPanel } from './panels/InputsPanel';
import { ActionsPanel } from './panels/ActionsPanel';

export function CampaignGeneratorSidebar() {
  return (
    <aside className="flex w-[280px] flex-shrink-0 flex-col gap-4 overflow-y-auto border-r border-(--color-border) bg-(--color-bg-secondary) p-4">
      <InputsPanel />
      <ActionsPanel />
    </aside>
  );
}
