import { useState, type ReactNode } from 'react';

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function CollapsibleSection({ title, defaultOpen = true, children }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-(--color-border) pt-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-(--color-text-secondary) hover:text-(--color-text) transition-colors"
      >
        <span>{title}</span>
        <span className="text-[10px]">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="mt-2 flex flex-col gap-2">{children}</div>}
    </div>
  );
}
