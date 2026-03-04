interface GrainCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function GrainCheckbox({ label, checked, onChange }: GrainCheckboxProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="w-24 flex-shrink-0 text-[10px] uppercase tracking-wider text-(--color-text-secondary)">
        {label}
      </label>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="h-3.5 w-3.5 cursor-pointer accent-(--color-accent)"
      />
    </div>
  );
}
