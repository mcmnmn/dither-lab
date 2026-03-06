import { FramePanel } from './panels/FramePanel';
import { LogoPanel } from './panels/LogoPanel';
import { OutputPanel } from './panels/OutputPanel';

interface ScreenshotFramerRightSidebarProps {
  inline?: boolean;
}

export function ScreenshotFramerRightSidebar({ inline }: ScreenshotFramerRightSidebarProps) {
  const panels = (
    <>
      <FramePanel />
      <LogoPanel />
      <OutputPanel />
    </>
  );

  if (inline) return panels;

  return (
    <aside className="flex w-[280px] flex-shrink-0 flex-col gap-4 overflow-y-auto border-l border-(--color-border) bg-(--color-bg-secondary) p-4">
      {panels}
    </aside>
  );
}
