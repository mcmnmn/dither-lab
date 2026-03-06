interface GrainDropdownProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  labelWidth?: string;
}

export function GrainDropdown({ label, value, options, onChange, labelWidth = 'w-24' }: GrainDropdownProps) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <label className={`${labelWidth} flex-shrink-0 text-[10px] uppercase tracking-wider text-(--color-text-secondary)`}>
        {label}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="min-w-0 flex-1 border border-(--color-border) bg-(--color-bg) px-1.5 py-1 text-[10px] uppercase tracking-wider text-(--color-text-secondary) outline-none"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
