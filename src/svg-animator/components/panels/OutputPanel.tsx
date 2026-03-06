import { useSvgAnimatorState, useSvgAnimatorDispatch } from '../../state/context';

export function OutputPanel() {
  const { parsedSvg } = useSvgAnimatorState();
  const dispatch = useSvgAnimatorDispatch();
  const disabled = !parsedSvg;

  return (
    <fieldset className="retro-section">
      <legend className="retro-section-label">Output</legend>

      <div className="flex flex-col gap-2">
        <button
          disabled={disabled}
          onClick={() => dispatch({ type: 'SA_TOGGLE_EXPORT_MODAL' })}
          className="w-full border border-(--color-border) bg-(--color-bg) px-3 py-1.5 text-xs uppercase tracking-wider text-(--color-text) hover:bg-(--color-bg-secondary) disabled:opacity-50"
        >
          View Code
        </button>
      </div>
    </fieldset>
  );
}
