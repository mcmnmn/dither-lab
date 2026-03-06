import { useSvgAnimatorState, useSvgAnimatorDispatch } from '../../state/context';
import { PRESET_OPTIONS, EASING_OPTIONS } from '../../state/defaults';
import { GrainSlider } from '../../../grain/components/common/GrainSlider';
import { GrainDropdown } from '../../../grain/components/common/GrainDropdown';
import type { AnimationPreset, EasingId } from '../../state/types';

export function ElementInspectorPanel() {
  const { parsedSvg, selectedElementIndex, elementOverrides } = useSvgAnimatorState();
  const dispatch = useSvgAnimatorDispatch();

  if (!parsedSvg || parsedSvg.elements.length === 0) return null;

  const elements = parsedSvg.elements;
  const selectedOverride = selectedElementIndex != null ? elementOverrides[selectedElementIndex] : undefined;

  return (
    <fieldset className="retro-section">
      <legend className="retro-section-label">
        Elements ({elements.length})
      </legend>

      <div className="flex max-h-[200px] flex-col gap-0.5 overflow-y-auto">
        {elements.map((el, i) => (
          <div
            key={i}
            className={`flex items-center gap-1.5 border px-1.5 py-1 text-[10px] transition-colors ${
              selectedElementIndex === i
                ? 'border-(--color-accent) bg-(--color-accent)/10'
                : 'border-transparent hover:bg-(--color-bg)'
            }`}
          >
            {/* Reorder buttons */}
            <div className="flex flex-col">
              <button
                disabled={i === 0}
                onClick={() => dispatch({ type: 'SA_REORDER_ELEMENTS', fromIndex: i, toIndex: i - 1 })}
                className="text-[8px] leading-none text-(--color-text-secondary) hover:text-(--color-text) disabled:opacity-20"
              >
                ▲
              </button>
              <button
                disabled={i === elements.length - 1}
                onClick={() => dispatch({ type: 'SA_REORDER_ELEMENTS', fromIndex: i, toIndex: i + 1 })}
                className="text-[8px] leading-none text-(--color-text-secondary) hover:text-(--color-text) disabled:opacity-20"
              >
                ▼
              </button>
            </div>

            {/* Tag badge */}
            <span className="w-8 flex-shrink-0 rounded-sm bg-(--color-bg-secondary) px-0.5 text-center text-[8px] uppercase text-(--color-text-secondary)">
              {el.tag.slice(0, 4)}
            </span>

            {/* Name - click to select */}
            <button
              className="flex-1 truncate text-left text-[10px] uppercase tracking-wider text-(--color-text)"
              onClick={() => dispatch({
                type: 'SA_SET_SELECTED_ELEMENT',
                index: selectedElementIndex === i ? null : i,
              })}
            >
              {el.name}
            </button>

            {/* Override indicator */}
            {elementOverrides[i] && (
              <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-(--color-accent)" />
            )}

            {/* Visibility toggle */}
            <button
              onClick={() => dispatch({ type: 'SA_TOGGLE_ELEMENT_VISIBILITY', index: i })}
              className={`flex-shrink-0 text-[10px] ${el.visible ? 'text-(--color-text-secondary)' : 'text-(--color-text-secondary)/30'}`}
            >
              {el.visible ? '◉' : '◯'}
            </button>
          </div>
        ))}
      </div>

      {/* Per-element override controls */}
      {selectedElementIndex != null && (
        <div className="mt-2 border-t border-(--color-border) pt-2">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-(--color-text-secondary)">
              Override: {elements[selectedElementIndex]?.name}
            </span>
            {selectedOverride && (
              <button
                onClick={() => dispatch({ type: 'SA_CLEAR_ELEMENT_OVERRIDE', index: selectedElementIndex })}
                className="text-[9px] uppercase tracking-wider text-(--color-text-secondary) hover:text-(--color-text)"
              >
                Reset
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <GrainDropdown
              label="Preset"
              value={selectedOverride?.preset ?? ''}
              options={[
                { value: '', label: 'Use Global' },
                ...PRESET_OPTIONS.map(p => ({ value: p.value, label: p.label })),
              ]}
              onChange={v => {
                const preset = v === '' ? undefined : v as AnimationPreset;
                dispatch({
                  type: 'SA_SET_ELEMENT_OVERRIDE',
                  index: selectedElementIndex,
                  config: { preset },
                });
              }}
            />

            <GrainSlider
              label="Delay"
              value={selectedOverride?.delay ?? 0}
              min={0}
              max={2000}
              step={10}
              onChange={v => dispatch({
                type: 'SA_SET_ELEMENT_OVERRIDE',
                index: selectedElementIndex,
                config: { delay: v },
              })}
              displayValue={`${selectedOverride?.delay ?? 0}ms`}
            />

            <GrainDropdown
              label="Easing"
              value={selectedOverride?.easing ?? ''}
              options={[
                { value: '', label: 'Use Global' },
                ...EASING_OPTIONS.map(e => ({ value: e.value, label: e.label })),
              ]}
              onChange={v => {
                const easing = v === '' ? undefined : v as EasingId;
                dispatch({
                  type: 'SA_SET_ELEMENT_OVERRIDE',
                  index: selectedElementIndex,
                  config: { easing },
                });
              }}
            />
          </div>
        </div>
      )}
    </fieldset>
  );
}
