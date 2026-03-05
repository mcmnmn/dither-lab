interface GrainSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  displayValue?: string;
}

export function GrainSlider({ label, value, min, max, step = 1, onChange, displayValue }: GrainSliderProps) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <label className="w-24 flex-shrink-0 text-[10px] uppercase tracking-wider text-(--color-text-secondary)">
        {label}
      </label>
      <span className="w-8 text-right font-mono text-[10px] text-(--color-text)">
        {displayValue ?? (step < 1 ? value.toFixed(1) : String(value))}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="h-1 min-w-0 flex-1 cursor-pointer appearance-none bg-(--color-border) accent-(--color-accent)"
      />
    </div>
  );
}
