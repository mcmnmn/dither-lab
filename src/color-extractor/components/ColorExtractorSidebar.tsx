import { SettingsPanel } from './panels/SettingsPanel';
import { PalettePanel } from './panels/PalettePanel';
import { ExportPanel } from './panels/ExportPanel';

export function ColorExtractorSidebar() {
  return (
    <aside className="flex w-[280px] flex-shrink-0 flex-col gap-4 overflow-y-auto border-r border-(--color-border) bg-(--color-bg-secondary) p-4">
      <SettingsPanel />
      <PalettePanel />
      <ExportPanel />
    </aside>
  );
}
