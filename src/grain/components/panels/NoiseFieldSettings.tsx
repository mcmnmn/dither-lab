import { useGrainState, useGrainDispatch } from '../../state/grain-context';
import { GrainSlider } from '../common/GrainSlider';
import { GrainDropdown } from '../common/GrainDropdown';
import { GrainCheckbox } from '../common/GrainCheckbox';
import type { NoiseFieldSettings as NoiseFieldSettingsType } from '../../state/types';

const NOISE_TYPE_OPTIONS = [
  { value: 'perlin', label: 'Perlin' },
  { value: 'simplex', label: 'Simplex' },
];

export function NoiseFieldSettings() {
  const { noiseField } = useGrainState();
  const dispatch = useGrainDispatch();

  const update = (settings: Partial<NoiseFieldSettingsType>) => {
    dispatch({ type: 'GRAIN_UPDATE_NOISE_FIELD', settings });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="retro-section">
        <span className="retro-section-label">Noise Field</span>
        <div className="space-y-3">
          <GrainDropdown label="Type" value={noiseField.noiseType} options={NOISE_TYPE_OPTIONS} onChange={v => update({ noiseType: v as NoiseFieldSettingsType['noiseType'] })} />
          <GrainSlider label="Scale" value={noiseField.scale} min={1} max={200} step={1} onChange={v => update({ scale: v })} />
          <GrainSlider label="Intensity" value={noiseField.intensity} min={0} max={100} step={1} onChange={v => update({ intensity: v })} />
          <GrainSlider label="Octaves" value={noiseField.octaves} min={1} max={8} step={1} onChange={v => update({ octaves: v })} />
          <GrainSlider label="Speed" value={noiseField.speed} min={0} max={10} step={0.1} onChange={v => update({ speed: v })} />
          <GrainCheckbox label="Distort Only" checked={noiseField.distortOnly} onChange={v => update({ distortOnly: v })} />
        </div>
      </div>

      <div className="retro-section">
        <span className="retro-section-label">Adjustments</span>
        <div className="space-y-3">
          <GrainSlider label="Brightness" value={noiseField.brightness} min={-100} max={100} step={1} onChange={v => update({ brightness: v })} />
          <GrainSlider label="Contrast" value={noiseField.contrast} min={-100} max={100} step={1} onChange={v => update({ contrast: v })} />
        </div>
      </div>
    </div>
  );
}
