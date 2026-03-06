import { useSFState, useSFDispatch } from '../../state/context';

export function FramePanel() {
  const state = useSFState();
  const dispatch = useSFDispatch();

  return (
    <fieldset className="retro-section">
      <legend className="retro-section-label">Frame</legend>
      <div className="flex flex-col gap-2">
        <SliderRow
          label="Scale"
          value={state.screenshotScale}
          min={0.5}
          max={0.95}
          step={0.01}
          display={`${Math.round(state.screenshotScale * 100)}%`}
          onChange={v => dispatch({ type: 'SF_SET_SCREENSHOT_SCALE', scale: v })}
        />
        <SliderRow
          label="Radius"
          value={state.screenshotBorderRadius}
          min={0}
          max={32}
          step={1}
          display={`${state.screenshotBorderRadius}px`}
          onChange={v => dispatch({ type: 'SF_SET_BORDER_RADIUS', radius: v })}
        />
        <SliderRow
          label="Shadow"
          value={state.screenshotShadow}
          min={0}
          max={100}
          step={1}
          display={`${state.screenshotShadow}`}
          onChange={v => dispatch({ type: 'SF_SET_SHADOW', shadow: v })}
        />
        <SliderRow
          label="Offset X"
          value={state.screenshotOffsetX}
          min={-50}
          max={50}
          step={1}
          display={`${state.screenshotOffsetX}`}
          onChange={v => dispatch({ type: 'SF_SET_OFFSET', x: v, y: state.screenshotOffsetY })}
        />
        <SliderRow
          label="Offset Y"
          value={state.screenshotOffsetY}
          min={-50}
          max={50}
          step={1}
          display={`${state.screenshotOffsetY}`}
          onChange={v => dispatch({ type: 'SF_SET_OFFSET', x: state.screenshotOffsetX, y: v })}
        />
      </div>
    </fieldset>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="w-14 text-[10px] uppercase tracking-wider text-(--color-text-secondary)">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="flex-1"
      />
      <span className="w-10 text-right text-[10px] tabular-nums text-(--color-text-secondary)">{display}</span>
    </div>
  );
}
