import { UploadPanel } from './panels/UploadPanel';
import { BackgroundPanel } from './panels/BackgroundPanel';

interface ScreenshotFramerSidebarProps {
  inline?: boolean;
}

export function ScreenshotFramerSidebar({ inline }: ScreenshotFramerSidebarProps) {
  const panels = (
    <>
      <UploadPanel />
      <BackgroundPanel />
    </>
  );

  if (inline) return panels;

  return (
    <aside className="flex w-[280px] flex-shrink-0 flex-col gap-4 overflow-y-auto border-r border-(--color-border) bg-(--color-bg-secondary) p-4">
      {panels}
    </aside>
  );
}
