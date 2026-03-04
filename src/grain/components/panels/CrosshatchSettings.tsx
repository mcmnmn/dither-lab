import { useGrainState, useGrainDispatch } from '../../state/grain-context';
import { GrainSlider } from '../common/GrainSlider';
import { GrainDropdown } from '../common/GrainDropdown';
import type { CrosshatchSettings as CrosshatchSettingsType } from '../../state/types';

const COLOR_MODE_OPTIONS = [
  { value: 'original', label: 'Original' },
  { value: 'mono', label: 'Mono' },
];

export function CrosshatchSettings() {
  const { crosshatch } = useGrainState();
  const dispatch = useGrainDispatch();

  const update = (settings: Partial<CrosshatchSettingsType>) => {
    dispatch({ type: 'GRAIN_UPDATE_CROSSHATCH', settings });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-(--color-text-secondary)">
        Crosshatch
      </div>
      <GrainSlider label="Line Width" value={crosshatch.lineWidth} min={0.5} max={5} step={0.1} onChange={v => update({ lineWidth: v })} />
      <GrainSlider label="Spacing" value={crosshatch.spacing} min={3} max={30} step={1} onChange={v => update({ spacing: v })} />
      <GrainSlider label="Angle" value={crosshatch.angle} min={0} max={180} step={1} onChange={v => update({ angle: v })} displayValue={`${crosshatch.angle}\u00B0`} />
      <GrainSlider label="Layers" value={crosshatch.layers} min={1} max={4} step={1} onChange={v => update({ layers: v })} />

      <div className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-(--color-text-secondary)">
        Adjustments
      </div>
      <GrainSlider label="Brightness" value={crosshatch.brightness} min={-100} max={100} step={1} onChange={v => update({ brightness: v })} />
      <GrainSlider label="Contrast" value={crosshatch.contrast} min={-100} max={100} step={1} onChange={v => update({ contrast: v })} />

      <div className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-(--color-text-secondary)">
        Color
      </div>
      <GrainDropdown label="Mode" value={crosshatch.colorMode} options={COLOR_MODE_OPTIONS} onChange={v => update({ colorMode: v as CrosshatchSettingsType['colorMode'] })} />
    </div>
  );
}
