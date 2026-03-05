import { useState, type ReactNode } from 'react';

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function CollapsibleSection({ title, defaultOpen = true, children }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="retro-section">
      <button
        onClick={() => setOpen(!open)}
        className="retro-section-label flex items-center gap-1 cursor-pointer hover:text-(--color-text) transition-colors"
      >
        <span>{title}</span>
        <span className="text-[10px]">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="flex flex-col gap-2">{children}</div>}
    </div>
  );
}
