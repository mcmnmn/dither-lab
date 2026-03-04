import { useState, useCallback, useRef } from 'react';

interface GrainDialProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}

export function GrainDial({ label, value, min, max, step = 1, onChange }: GrainDialProps) {
  const [pressed, setPressed] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const advance = useCallback(() => {
    const next = value + step;
    onChange(next > max ? min : next);

    // Trigger press animation
    setPressed(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setPressed(false), 150);
  }, [value, min, max, step, onChange]);

  return (
    <div className="flex items-center gap-2">
      <label className="w-24 flex-shrink-0 text-[10px] uppercase tracking-wider text-(--color-text-secondary)">
        {label}
      </label>
      <button
        type="button"
        onClick={advance}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-(--color-border) font-mono text-[10px] text-(--color-text) transition-all duration-150 hover:bg-(--color-bg-tertiary)"
        style={{ transform: pressed ? 'scale(0.85)' : 'scale(1)' }}
      >
        {step < 1 ? value.toFixed(1) : value}
      </button>
    </div>
  );
}
