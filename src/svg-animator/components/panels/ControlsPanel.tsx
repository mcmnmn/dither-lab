import { useSvgAnimatorState, useSvgAnimatorDispatch } from '../../state/context';
import { EASING_OPTIONS, STAGGER_MODE_OPTIONS, SLIDE_DIRECTION_OPTIONS } from '../../state/defaults';
import { GrainSlider } from '../../../grain/components/common/GrainSlider';
import { GrainDropdown } from '../../../grain/components/common/GrainDropdown';
import { TransformOriginPicker } from '../TransformOriginPicker';
import type { EasingId, StaggerMode, SlideDirection } from '../../state/types';

export function ControlsPanel() {
  const { preset, duration, easing, loop, stagger, staggerDelay, staggerMode, intensity, transformOrigin, slideDirection } = useSvgAnimatorState();
  const dispatch = useSvgAnimatorDispatch();

  return (
    <fieldset className="retro-section">
      <legend className="retro-section-label">Controls</legend>

      <div className="flex flex-col gap-2">
        <GrainSlider
          label="Duration"
          value={duration}
          min={200}
          max={3000}
          step={50}
          onChange={v => dispatch({ type: 'SA_SET_DURATION', duration: v })}
          displayValue={`${duration}ms`}
        />

        <GrainSlider
          label="Intensity"
          value={intensity}
          min={1}
          max={10}
          step={1}
          onChange={v => dispatch({ type: 'SA_SET_INTENSITY', intensity: v })}
          displayValue={`${intensity}`}
        />

        <GrainDropdown
          label="Easing"
          value={easing}
          options={EASING_OPTIONS.map(e => ({ value: e.value, label: e.label }))}
          onChange={v => dispatch({ type: 'SA_SET_EASING', easing: v as EasingId })}
        />

        <TransformOriginPicker
          value={transformOrigin}
          onChange={origin => dispatch({ type: 'SA_SET_TRANSFORM_ORIGIN', origin })}
        />

        {/* Slide direction — only for slide-in */}
        {preset === 'slide-in' && (
          <div className="flex items-center gap-2">
            <label className="w-24 flex-shrink-0 text-[10px] uppercase tracking-wider text-(--color-text-secondary)">
              Direction
            </label>
            <div className="flex gap-1">
              {SLIDE_DIRECTION_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => dispatch({ type: 'SA_SET_SLIDE_DIRECTION', direction: opt.value as SlideDirection })}
                  className={`border px-2 py-0.5 text-[10px] transition-colors ${
                    slideDirection === opt.value
                      ? 'border-(--color-accent) bg-(--color-accent) text-(--color-accent-text)'
                      : 'border-(--color-border) text-(--color-text-secondary) hover:text-(--color-text)'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <label className="w-24 flex-shrink-0 text-[10px] uppercase tracking-wider text-(--color-text-secondary)">
            Loop
          </label>
          <button
            onClick={() => dispatch({ type: 'SA_TOGGLE_LOOP' })}
            className={`border px-2 py-0.5 text-[10px] uppercase tracking-wider transition-colors ${
              loop
                ? 'border-(--color-accent) bg-(--color-accent) text-(--color-accent-text)'
                : 'border-(--color-border) text-(--color-text-secondary) hover:text-(--color-text)'
            }`}
          >
            {loop ? 'On' : 'Off'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="w-24 flex-shrink-0 text-[10px] uppercase tracking-wider text-(--color-text-secondary)">
            Stagger
          </label>
          <button
            onClick={() => dispatch({ type: 'SA_TOGGLE_STAGGER' })}
            className={`border px-2 py-0.5 text-[10px] uppercase tracking-wider transition-colors ${
              stagger
                ? 'border-(--color-accent) bg-(--color-accent) text-(--color-accent-text)'
                : 'border-(--color-border) text-(--color-text-secondary) hover:text-(--color-text)'
            }`}
          >
            {stagger ? 'On' : 'Off'}
          </button>
        </div>

        {stagger && (
          <>
            <GrainSlider
              label="Delay"
              value={staggerDelay}
              min={0}
              max={300}
              step={10}
              onChange={v => dispatch({ type: 'SA_SET_STAGGER_DELAY', delay: v })}
              displayValue={`${staggerDelay}ms`}
            />

            <div className="flex items-center gap-2">
              <label className="w-24 flex-shrink-0 text-[10px] uppercase tracking-wider text-(--color-text-secondary)">
                Mode
              </label>
              <div className="flex flex-wrap gap-1">
                {STAGGER_MODE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => dispatch({ type: 'SA_SET_STAGGER_MODE', mode: opt.value as StaggerMode })}
                    className={`border px-1.5 py-0.5 text-[10px] uppercase tracking-wider transition-colors ${
                      staggerMode === opt.value
                        ? 'border-(--color-accent) bg-(--color-accent) text-(--color-accent-text)'
                        : 'border-(--color-border) text-(--color-text-secondary) hover:text-(--color-text)'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </fieldset>
  );
}
