import { useColorExtractorState, useColorExtractorDispatch } from '../../state/context';
import { GrainSlider } from '../../../grain/components/common/GrainSlider';

export function SettingsPanel() {
  const { colorCount, fileName } = useColorExtractorState();
  const dispatch = useColorExtractorDispatch();

  return (
    <div className="retro-section">
      <span className="retro-section-label">Settings</span>
      <div className="space-y-3">
        {fileName && (
          <div className="truncate text-[10px] text-(--color-text-secondary)" title={fileName}>
            {fileName}
          </div>
        )}
        <GrainSlider
          label="Colors"
          value={colorCount}
          min={2}
          max={12}
          step={1}
          onChange={v => dispatch({ type: 'CE_SET_COLOR_COUNT', count: v })}
        />
      </div>
    </div>
  );
}
