import { useSvgAnimatorState, useSvgAnimatorDispatch } from '../../state/context';
import { PREVIEW_SIZE_OPTIONS } from '../../state/defaults';
import type { PreviewBackground, PreviewSize } from '../../state/types';

const BG_OPTIONS: { value: PreviewBackground; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'checker', label: 'Check' },
];

export function PreviewControlsPanel() {
  const { previewBg, previewSize, showGridOverlay } = useSvgAnimatorState();
  const dispatch = useSvgAnimatorDispatch();

  return (
    <fieldset className="retro-section">
      <legend className="retro-section-label">Preview</legend>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase tracking-wider text-(--color-text-secondary)">
            Background
          </label>
          <div className="flex gap-1">
            {BG_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => dispatch({ type: 'SA_SET_PREVIEW_BG', bg: opt.value })}
                className={`flex-1 border py-0.5 text-[10px] uppercase tracking-wider transition-colors ${
                  previewBg === opt.value
                    ? 'border-(--color-accent) bg-(--color-accent) text-(--color-accent-text)'
                    : 'border-(--color-border) text-(--color-text-secondary) hover:text-(--color-text)'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase tracking-wider text-(--color-text-secondary)">
            Size
          </label>
          <div className="flex gap-1">
            {PREVIEW_SIZE_OPTIONS.map(size => (
              <button
                key={size}
                onClick={() => dispatch({ type: 'SA_SET_PREVIEW_SIZE', size: size as PreviewSize })}
                className={`flex-1 border py-0.5 text-[10px] uppercase tracking-wider transition-colors ${
                  previewSize === size
                    ? 'border-(--color-accent) bg-(--color-accent) text-(--color-accent-text)'
                    : 'border-(--color-border) text-(--color-text-secondary) hover:text-(--color-text)'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex-1 text-[10px] uppercase tracking-wider text-(--color-text-secondary)">
            Grid Overlay
          </label>
          <button
            onClick={() => dispatch({ type: 'SA_TOGGLE_GRID_OVERLAY' })}
            className={`border px-2 py-0.5 text-[10px] uppercase tracking-wider transition-colors ${
              showGridOverlay
                ? 'border-(--color-accent) bg-(--color-accent) text-(--color-accent-text)'
                : 'border-(--color-border) text-(--color-text-secondary) hover:text-(--color-text)'
            }`}
          >
            {showGridOverlay ? 'On' : 'Off'}
          </button>
        </div>
      </div>
    </fieldset>
  );
}
