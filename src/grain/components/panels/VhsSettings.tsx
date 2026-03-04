import { useGrainState, useGrainDispatch } from '../../state/grain-context';
import { GrainSlider } from '../common/GrainSlider';
import type { VhsSettings as VhsSettingsType } from '../../state/types';

export function VhsSettings() {
  const { vhs } = useGrainState();
  const dispatch = useGrainDispatch();

  const update = (settings: Partial<VhsSettingsType>) => {
    dispatch({ type: 'GRAIN_UPDATE_VHS', settings });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-(--color-text-secondary)">
        VHS
      </div>
      <GrainSlider label="Tracking" value={vhs.tracking} min={0} max={100} step={1} onChange={v => update({ tracking: v })} />
      <GrainSlider label="Noise" value={vhs.noise} min={0} max={100} step={1} onChange={v => update({ noise: v })} />
      <GrainSlider label="Color Bleed" value={vhs.colorBleed} min={0} max={100} step={1} onChange={v => update({ colorBleed: v })} />
      <GrainSlider label="Distortion" value={vhs.distortion} min={0} max={100} step={1} onChange={v => update({ distortion: v })} />

      <div className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-(--color-text-secondary)">
        Adjustments
      </div>
      <GrainSlider label="Brightness" value={vhs.brightness} min={-100} max={100} step={1} onChange={v => update({ brightness: v })} />
      <GrainSlider label="Contrast" value={vhs.contrast} min={-100} max={100} step={1} onChange={v => update({ contrast: v })} />
    </div>
  );
}
