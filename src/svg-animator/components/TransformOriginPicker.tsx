import type { TransformOrigin } from '../state/types';
import { TRANSFORM_ORIGIN_OPTIONS } from '../state/defaults';

interface TransformOriginPickerProps {
  value: TransformOrigin;
  onChange: (origin: TransformOrigin) => void;
}

export function TransformOriginPicker({ value, onChange }: TransformOriginPickerProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="w-24 flex-shrink-0 text-[10px] uppercase tracking-wider text-(--color-text-secondary)">
        Origin
      </label>
      <div className="grid grid-cols-3 gap-0.5">
        {TRANSFORM_ORIGIN_OPTIONS.map(origin => (
          <button
            key={origin}
            onClick={() => onChange(origin)}
            className={`h-4 w-4 border transition-colors ${
              value === origin
                ? 'border-(--color-accent) bg-(--color-accent)'
                : 'border-(--color-border) bg-(--color-bg) hover:border-(--color-text-secondary)'
            }`}
            title={origin}
          />
        ))}
      </div>
    </div>
  );
}
