import { useGrainState, useGrainDispatch } from '../../state/grain-context';
import { GrainSlider } from '../common/GrainSlider';
import { GrainDropdown } from '../common/GrainDropdown';
import type { MatrixRainSettings as MatrixRainSettingsType } from '../../state/types';

const CHAR_SET_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'extended', label: 'Extended' },
  { value: 'blocks', label: 'Blocks' },
];

const DIRECTION_OPTIONS = [
  { value: 'down', label: 'Down' },
  { value: 'up', label: 'Up' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
];

export function MatrixRainSettings() {
  const { matrixRain } = useGrainState();
  const dispatch = useGrainDispatch();

  const update = (settings: Partial<MatrixRainSettingsType>) => {
    dispatch({ type: 'GRAIN_UPDATE_MATRIX_RAIN', settings });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-(--color-text-secondary)">
        Matrix Rain
      </div>
      <GrainDropdown label="Char Set" value={matrixRain.charSet} options={CHAR_SET_OPTIONS} onChange={v => update({ charSet: v as MatrixRainSettingsType['charSet'] })} />
      <GrainDropdown label="Direction" value={matrixRain.direction} options={DIRECTION_OPTIONS} onChange={v => update({ direction: v as MatrixRainSettingsType['direction'] })} />
      <GrainSlider label="Cell Size" value={matrixRain.cellSize} min={4} max={24} step={1} onChange={v => update({ cellSize: v })} />
      <GrainSlider label="Spacing" value={matrixRain.spacing} min={0} max={10} step={0.1} onChange={v => update({ spacing: v })} />
      <GrainSlider label="Speed" value={matrixRain.speed} min={0.1} max={5} step={0.1} onChange={v => update({ speed: v })} />
      <GrainSlider label="Trail Length" value={matrixRain.trailLength} min={1} max={30} step={1} onChange={v => update({ trailLength: v })} />
      <GrainSlider label="Glow" value={matrixRain.glow} min={0} max={3} step={0.1} onChange={v => update({ glow: v })} />
      <GrainSlider label="BG Opacity" value={matrixRain.bgOpacity} min={0} max={1} step={0.01} onChange={v => update({ bgOpacity: v })} />
      <GrainSlider label="Threshold" value={matrixRain.threshold} min={0} max={1} step={0.01} onChange={v => update({ threshold: v })} />

      <div className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-(--color-text-secondary)">
        Adjustments
      </div>
      <GrainSlider label="Brightness" value={matrixRain.brightness} min={-100} max={100} step={1} onChange={v => update({ brightness: v })} />
      <GrainSlider label="Contrast" value={matrixRain.contrast} min={-100} max={100} step={1} onChange={v => update({ contrast: v })} />

      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-(--color-text-secondary)">Rain Color</span>
        <input
          type="color"
          value={matrixRain.rainColor}
          onChange={e => update({ rainColor: e.target.value })}
          className="h-6 w-10 cursor-pointer border border-(--color-border) bg-transparent"
        />
      </div>
    </div>
  );
}
