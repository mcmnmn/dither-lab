import { useGrainState, useGrainDispatch } from '../../state/grain-context';
import { GrainSlider } from '../common/GrainSlider';
import { GrainDropdown } from '../common/GrainDropdown';
import type { PixelSortSettings as PixelSortSettingsType } from '../../state/types';

const DIRECTION_OPTIONS = [
  { value: 'horizontal', label: 'Horizontal' },
  { value: 'vertical', label: 'Vertical' },
];

const SORT_BY_OPTIONS = [
  { value: 'brightness', label: 'Brightness' },
  { value: 'hue', label: 'Hue' },
  { value: 'saturation', label: 'Saturation' },
];

export function PixelSortSettings() {
  const { pixelSort } = useGrainState();
  const dispatch = useGrainDispatch();

  const update = (settings: Partial<PixelSortSettingsType>) => {
    dispatch({ type: 'GRAIN_UPDATE_PIXEL_SORT', settings });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-(--color-text-secondary)">
        Pixel Sort
      </div>
      <GrainDropdown label="Direction" value={pixelSort.direction} options={DIRECTION_OPTIONS} onChange={v => update({ direction: v as PixelSortSettingsType['direction'] })} />
      <GrainDropdown label="Sort By" value={pixelSort.sortBy} options={SORT_BY_OPTIONS} onChange={v => update({ sortBy: v as PixelSortSettingsType['sortBy'] })} />
      <GrainSlider label="Threshold" value={pixelSort.threshold} min={0} max={100} step={1} onChange={v => update({ threshold: v })} />
      <GrainSlider label="Randomness" value={pixelSort.randomness} min={0} max={100} step={1} onChange={v => update({ randomness: v })} />

      <div className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-(--color-text-secondary)">
        Adjustments
      </div>
      <GrainSlider label="Brightness" value={pixelSort.brightness} min={-100} max={100} step={1} onChange={v => update({ brightness: v })} />
      <GrainSlider label="Contrast" value={pixelSort.contrast} min={-100} max={100} step={1} onChange={v => update({ contrast: v })} />
    </div>
  );
}
