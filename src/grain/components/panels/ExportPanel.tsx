import { useAppState, useAppDispatch } from '../../../state/app-context';
import type { ExportFormat } from '../../../state/types';

interface ExportPanelProps {
  onDownload: () => void;
  disabled: boolean;
}

export function ExportPanel({ onDownload, disabled }: ExportPanelProps) {
  const { exportFormat, exportScale } = useAppState();
  const dispatch = useAppDispatch();

  return (
    <div className="flex flex-col gap-4">
      <div className="retro-section">
        <span className="retro-section-label">Output</span>
        <div className="space-y-3">
          {/* Format */}
          <div className="space-y-1">
            <span className="text-xs text-(--color-text-secondary)">Format</span>
            <div className="flex gap-0 border border-(--color-border)">
              {(['png', 'jpg', 'webp', 'gif'] as ExportFormat[]).map(fmt => (
                <button
                  key={fmt}
                  onClick={() => dispatch({ type: 'SET_EXPORT_FORMAT', format: fmt })}
                  className={`flex-1 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    exportFormat === fmt
                      ? 'bg-(--color-accent) text-(--color-accent-text)'
                      : 'text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-tertiary)'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Scale */}
          <div className="space-y-1">
            <span className="text-xs text-(--color-text-secondary)">Scale</span>
            <div className="flex gap-0 border border-(--color-border)">
              {[1, 2, 4, 8].map(s => (
                <button
                  key={s}
                  onClick={() => dispatch({ type: 'SET_EXPORT_SCALE', scale: s })}
                  className={`flex-1 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    exportScale === s
                      ? 'bg-(--color-accent) text-(--color-accent-text)'
                      : 'text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-tertiary)'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
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
