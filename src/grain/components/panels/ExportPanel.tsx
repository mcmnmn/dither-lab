import type { GrainExportFormat } from '../../state/types';

interface ExportPanelProps {
  format: GrainExportFormat;
  onFormatChange: (format: GrainExportFormat) => void;
  onDownload: () => void;
  disabled: boolean;
}

const FORMATS: { value: GrainExportFormat; label: string }[] = [
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPG' },
];

export function ExportPanel({ format, onFormatChange, onDownload, disabled }: ExportPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="retro-section">
        <span className="retro-section-label">Output</span>
        <div className="space-y-3">
          <div className="flex gap-1">
            {FORMATS.map(f => (
              <button
                key={f.value}
                onClick={() => onFormatChange(f.value)}
                className={`flex-1 border px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  format === f.value
                    ? 'border-(--color-accent) bg-(--color-accent) text-(--color-accent-text)'
                    : 'border-(--color-border) text-(--color-text-secondary) hover:text-(--color-text) hover:border-(--color-text-secondary)'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button
            onClick={onDownload}
            disabled={disabled}
            className="w-full border border-(--color-accent) bg-(--color-accent) px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-(--color-accent-text) transition-colors hover:bg-(--color-accent-hover) hover:border-(--color-accent-hover) disabled:opacity-40 disabled:cursor-not-allowed"
          >
            &gt;&gt; Download &lt;&lt;
          </button>
        </div>
      </div>
    </div>
  );
}
