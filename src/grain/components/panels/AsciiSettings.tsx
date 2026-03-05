import { useGrainState, useGrainDispatch } from '../../state/grain-context';
import { GrainSlider } from '../common/GrainSlider';
import { GrainDropdown } from '../common/GrainDropdown';
import type { AsciiSettings as AsciiSettingsType } from '../../state/types';

const CHAR_SET_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'blocks', label: 'Blocks' },
  { value: 'binary', label: 'Binary' },
  { value: 'detailed', label: 'Detailed' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'alphabetic', label: 'Alphabetic' },
  { value: 'numeric', label: 'Numeric' },
  { value: 'math', label: 'Math' },
  { value: 'symbols', label: 'Symbols' },
];

const COLOR_MODE_OPTIONS = [
  { value: 'original', label: 'Original' },
  { value: 'mono', label: 'Mono' },
];

export function AsciiSettings() {
  const { ascii } = useGrainState();
  const dispatch = useGrainDispatch();

  const update = (settings: Partial<AsciiSettingsType>) => {
    dispatch({ type: 'GRAIN_UPDATE_ASCII', settings });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="retro-section">
        <span className="retro-section-label">ASCII</span>
        <div className="space-y-3">
          <GrainSlider label="Scale" value={ascii.scale} min={1} max={20} step={1} onChange={v => update({ scale: v })} />
          <GrainSlider label="Spacing" value={ascii.spacing} min={0} max={10} step={0.5} onChange={v => update({ spacing: v })} />
          <GrainSlider label="Output Width" value={ascii.outputWidth} min={0} max={200} step={10} onChange={v => update({ outputWidth: v })} />
          <GrainDropdown label="Character Set" value={ascii.charSet} options={CHAR_SET_OPTIONS} onChange={v => update({ charSet: v as AsciiSettingsType['charSet'] })} />
        </div>
      </div>

      <div className="retro-section">
        <span className="retro-section-label">Adjustments</span>
        <div className="space-y-3">
          <GrainSlider label="Brightness" value={ascii.brightness} min={-100} max={100} step={1} onChange={v => update({ brightness: v })} />
          <GrainSlider label="Contrast" value={ascii.contrast} min={-100} max={100} step={1} onChange={v => update({ contrast: v })} />
          <GrainSlider label="Saturation" value={ascii.saturation} min={-100} max={100} step={1} onChange={v => update({ saturation: v })} />
          <GrainSlider label="Hue Rotation" value={ascii.hueRotation} min={0} max={360} step={1} displayValue={`${ascii.hueRotation}°`} onChange={v => update({ hueRotation: v })} />
          <GrainSlider label="Sharpness" value={ascii.sharpness} min={0} max={100} step={1} onChange={v => update({ sharpness: v })} />
          <GrainSlider label="Gamma" value={ascii.gamma} min={0.1} max={3.0} step={0.1} onChange={v => update({ gamma: v })} />
        </div>
      </div>

      <div className="retro-section">
        <span className="retro-section-label">Color</span>
        <div className="space-y-3">
          <GrainDropdown label="Mode" value={ascii.colorMode} options={COLOR_MODE_OPTIONS} onChange={v => update({ colorMode: v as AsciiSettingsType['colorMode'] })} />
          {ascii.colorMode === 'mono' && (
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-(--color-text-secondary)">Character Color</span>
              <input
                type="color"
                value={ascii.fgColor}
                onChange={e => update({ fgColor: e.target.value })}
                className="h-6 w-10 cursor-pointer border border-(--color-border) bg-transparent"
              />
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-(--color-text-secondary)">Background</span>
            <input
              type="color"
              value={ascii.bgColor}
              onChange={e => update({ bgColor: e.target.value })}
              className="h-6 w-10 cursor-pointer border border-(--color-border) bg-transparent"
            />
          </div>
          <GrainSlider label="Intensity" value={ascii.intensity} min={0.1} max={3.0} step={0.1} onChange={v => update({ intensity: v })} />
        </div>
      </div>
    </div>
  );
}
