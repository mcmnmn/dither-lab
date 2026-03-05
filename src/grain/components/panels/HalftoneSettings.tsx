import { useGrainState, useGrainDispatch } from '../../state/grain-context';
import { GrainSlider } from '../common/GrainSlider';
import { GrainDropdown } from '../common/GrainDropdown';
import { GrainCheckbox } from '../common/GrainCheckbox';
import type { HalftoneSettings as HalftoneSettingsType } from '../../state/types';

const SHAPE_OPTIONS = [
  { value: 'circle', label: 'Circle' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'square', label: 'Square' },
];

const COLOR_MODE_OPTIONS = [
  { value: 'original', label: 'Original' },
  { value: 'mono', label: 'Mono' },
];

export function HalftoneSettings() {
  const { halftone } = useGrainState();
  const dispatch = useGrainDispatch();

  const update = (settings: Partial<HalftoneSettingsType>) => {
    dispatch({ type: 'GRAIN_UPDATE_HALFTONE', settings });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="retro-section">
        <span className="retro-section-label">Halftone</span>
        <div className="space-y-3">
          <GrainDropdown label="Shape" value={halftone.shape} options={SHAPE_OPTIONS} onChange={v => update({ shape: v as HalftoneSettingsType['shape'] })} />
          <GrainSlider label="Dot Scale" value={halftone.dotScale} min={0.5} max={10} step={0.1} onChange={v => update({ dotScale: v })} />
          <GrainSlider label="Spacing" value={halftone.spacing} min={1} max={30} step={1} onChange={v => update({ spacing: v })} />
          <GrainSlider label="Angle" value={halftone.angle} min={0} max={180} step={1} onChange={v => update({ angle: v })} displayValue={`${halftone.angle}\u00B0`} />
          <GrainCheckbox label="Invert" checked={halftone.invert} onChange={v => update({ invert: v })} />
        </div>
      </div>

      <div className="retro-section">
        <span className="retro-section-label">Adjustments</span>
        <div className="space-y-3">
          <GrainSlider label="Brightness" value={halftone.brightness} min={-100} max={100} step={1} onChange={v => update({ brightness: v })} />
          <GrainSlider label="Contrast" value={halftone.contrast} min={-100} max={100} step={1} onChange={v => update({ contrast: v })} />
        </div>
      </div>

      <div className="retro-section">
        <span className="retro-section-label">Color</span>
        <div className="space-y-3">
          <GrainDropdown label="Mode" value={halftone.colorMode} options={COLOR_MODE_OPTIONS} onChange={v => update({ colorMode: v as HalftoneSettingsType['colorMode'] })} />
        </div>
      </div>
    </div>
  );
}
