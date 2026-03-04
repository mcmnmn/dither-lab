import { useGrainState, useGrainDispatch } from '../../state/grain-context';
import { GrainDial } from '../common/GrainDial';
import { GrainDropdown } from '../common/GrainDropdown';
import type { AsciiSettings as AsciiSettingsType } from '../../state/types';

const CHAR_SET_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'extended', label: 'Extended' },
  { value: 'blocks', label: 'Blocks' },
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
    <div className="flex flex-col gap-2">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-(--color-text-secondary)">
        ASCII
      </div>
      <GrainDropdown label="Char Set" value={ascii.charSet} options={CHAR_SET_OPTIONS} onChange={v => update({ charSet: v as AsciiSettingsType['charSet'] })} />
      <GrainDial label="Scale" value={ascii.scale} min={0} max={10} step={1} onChange={v => update({ scale: v })} />
      <GrainDial label="Spacing" value={ascii.spacing} min={0} max={10} step={1} onChange={v => update({ spacing: v })} />
      <GrainDial label="Intensity" value={ascii.intensity} min={0} max={10} step={1} onChange={v => update({ intensity: v })} />

      <div className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-(--color-text-secondary)">
        Color
      </div>
      <GrainDropdown label="Mode" value={ascii.colorMode} options={COLOR_MODE_OPTIONS} onChange={v => update({ colorMode: v as AsciiSettingsType['colorMode'] })} />
      {ascii.colorMode === 'mono' && (
        <>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-(--color-text-secondary)">FG Color</span>
            <input
              type="color"
              value={ascii.fgColor}
              onChange={e => update({ fgColor: e.target.value })}
              className="h-6 w-10 cursor-pointer border border-(--color-border) bg-transparent"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-(--color-text-secondary)">BG Color</span>
            <input
              type="color"
              value={ascii.bgColor}
              onChange={e => update({ bgColor: e.target.value })}
              className="h-6 w-10 cursor-pointer border border-(--color-border) bg-transparent"
            />
          </div>
        </>
      )}
    </div>
  );
}
