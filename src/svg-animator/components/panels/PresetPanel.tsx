import { useSvgAnimatorState, useSvgAnimatorDispatch } from '../../state/context';
import { PRESET_OPTIONS } from '../../state/defaults';

export function PresetPanel() {
  const { preset, parsedSvg } = useSvgAnimatorState();
  const dispatch = useSvgAnimatorDispatch();

  const showStrokeWarning = (preset === 'draw-on' || preset === 'success') && parsedSvg && !parsedSvg.hasStrokes;

  return (
    <fieldset className="retro-section">
      <legend className="retro-section-label">Preset</legend>

      <div className="grid grid-cols-2 gap-1">
        {PRESET_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => dispatch({ type: 'SA_SET_PRESET', preset: opt.value })}
            className={`flex flex-col items-start border px-2 py-1.5 text-left transition-colors ${
              preset === opt.value
                ? 'border-(--color-accent) bg-(--color-accent) text-(--color-accent-text)'
                : 'border-(--color-border) text-(--color-text-secondary) hover:bg-(--color-bg-secondary) hover:text-(--color-text)'
            }`}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider">{opt.label}</span>
            <span className="text-[9px] opacity-70">{opt.description}</span>
          </button>
        ))}
      </div>

      {showStrokeWarning && (
        <p className="mt-2 text-[10px] uppercase tracking-wider text-amber-500">
          SVG has no strokes — this preset may not be visible. Try Pop instead.
        </p>
      )}
    </fieldset>
  );
}
