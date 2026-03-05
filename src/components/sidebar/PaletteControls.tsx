import { useAppState, useAppDispatch } from '../../state/app-context';
import { PALETTE_PRESETS } from '../../palette/presets';
import { rgbToHex, hexToRgb } from '../../utils/color';
import { Tooltip } from '../common/Tooltip';

const PALETTE_MODE_TOOLTIPS: Record<string, string> = {
  preset: 'Use a built-in color palette',
  auto: 'Extract palette from the image',
  manual: 'Pick your own colors',
};

export function PaletteControls() {
  const { paletteMode, presetId, manualColors, colorCount } = useAppState();
  const dispatch = useAppDispatch();
  const handleManualColorChange = (index: number, hex: string) => {
    const rgb = hexToRgb(hex);
    const newColors = [...manualColors];
    newColors[index] = rgb;
    dispatch({ type: 'SET_MANUAL_COLORS', colors: newColors });
  };

  const handleAddColor = () => {
    const newColors = [...manualColors, [128, 128, 128]];
    dispatch({ type: 'SET_MANUAL_COLORS', colors: newColors });
  };

  const handleRemoveColor = () => {
    const newColors = manualColors.slice(0, -1);
    dispatch({ type: 'SET_MANUAL_COLORS', colors: newColors });
  };

  return (
    <div className="retro-section">
      <span className="retro-section-label">Palette</span>

      <div className="space-y-3">
        {/* Mode selector */}
        <div className="flex gap-0 border border-(--color-border)">
          {(['preset', 'auto', 'manual'] as const).map(mode => (
            <Tooltip key={mode} text={PALETTE_MODE_TOOLTIPS[mode]}>
              <button
                onClick={() => dispatch({ type: 'SET_PALETTE_MODE', mode })}
                className={`flex-1 px-2 py-1.5 text-xs font-medium uppercase transition-colors ${
                  paletteMode === mode
                    ? 'bg-(--color-accent) text-(--color-accent-text)'
                    : 'text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-tertiary)'
                }`}
              >
                {mode}
              </button>
            </Tooltip>
          ))}
        </div>

        {/* Preset grid */}
        {paletteMode === 'preset' && (
          <div
            className="grid grid-cols-2 border border-(--color-border)"
            style={{ gap: '1px', backgroundColor: 'var(--color-border)' }}
          >
            {PALETTE_PRESETS.map(p => (
              <button
                key={p.id}
                onClick={() => dispatch({ type: 'SET_PRESET', presetId: p.id })}
                title={`${p.name} (${p.colors.length} colors)`}
                className={`px-2 py-1.5 text-xs text-left transition-colors ${
                  presetId === p.id
                    ? 'bg-(--color-accent) text-(--color-accent-text)'
                    : 'bg-(--color-bg) text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-tertiary)'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}

        {/* Auto: color count */}
        {paletteMode === 'auto' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-(--color-text-secondary)">
              <span>Colors</span>
              <span className="tabular-nums">{colorCount}</span>
            </div>
            <input
              type="range"
              min={2}
              max={256}
              value={colorCount}
              onChange={e => dispatch({ type: 'SET_COLOR_COUNT', count: parseInt(e.target.value) })}
              className="w-full accent-(--color-accent)"
            />
          </div>
        )}

        {/* Manual: color list */}
        {paletteMode === 'manual' && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-0.5">
              {manualColors.map((c, i) => (
                <input
                  key={i}
                  type="color"
                  value={rgbToHex(c[0], c[1], c[2])}
                  onChange={e => handleManualColorChange(i, e.target.value)}
                  className="h-7 w-7 cursor-pointer border border-(--color-border) p-0"
                />
              ))}
            </div>
            <div className="flex gap-1">
              <button
                onClick={handleAddColor}
                className="flex-1 border border-(--color-border) bg-(--color-bg) px-2 py-1 text-xs text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-tertiary)"
              >
                + Add
              </button>
              {manualColors.length > 2 && (
                <button
                  onClick={handleRemoveColor}
                  className="flex-1 border border-(--color-border) bg-(--color-bg) px-2 py-1 text-xs text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-tertiary)"
                >
                  - Remove
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
