import { useSFState, useSFDispatch } from '../../state/context';
import { MESH_PRESETS } from '../../../mesh-gradient/data/presets';
import type { SFBackgroundType, SFPatternId } from '../../state/types';

const BG_TYPES: { id: SFBackgroundType; label: string }[] = [
  { id: 'gradient', label: 'Gradient' },
  { id: 'solid', label: 'Solid' },
  { id: 'pattern', label: 'Pattern' },
];

const PATTERNS: { id: SFPatternId; label: string }[] = [
  { id: 'dots', label: 'Dots' },
  { id: 'grid', label: 'Grid' },
  { id: 'diagonal', label: 'Diagonal' },
  { id: 'crosses', label: 'Crosses' },
  { id: 'waves', label: 'Waves' },
  { id: 'triangles', label: 'Triangles' },
];

export function BackgroundPanel() {
  const state = useSFState();
  const dispatch = useSFDispatch();

  return (
    <fieldset className="retro-section">
      <legend className="retro-section-label">Background</legend>
      <div className="flex flex-col gap-3">
        {/* Type toggle */}
        <div className="flex gap-1">
          {BG_TYPES.map(t => (
            <button
              key={t.id}
              onClick={() => dispatch({ type: 'SF_SET_BG_TYPE', bgType: t.id })}
              className={`flex-1 px-2 py-1 text-[10px] font-medium uppercase tracking-wider transition-colors ${
                state.bgType === t.id
                  ? 'bg-(--color-accent) text-(--color-accent-text)'
                  : 'border border-(--color-border) text-(--color-text-secondary) hover:bg-(--color-bg-tertiary)'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Gradient presets */}
        {state.bgType === 'gradient' && (
          <div className="grid grid-cols-4 gap-1.5">
            {MESH_PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => dispatch({ type: 'SF_SET_BG_GRADIENT_PRESET', presetId: preset.id })}
                className={`h-10 rounded transition-all ${
                  state.bgGradientPresetId === preset.id ? 'ring-2 ring-(--color-accent) ring-offset-1 ring-offset-(--color-bg-secondary)' : 'hover:opacity-80'
                }`}
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${preset.nodes[0]?.color ?? '#666'}, ${preset.bgColor})`,
                }}
                title={preset.name}
              />
            ))}
          </div>
        )}

        {/* Solid color */}
        {state.bgType === 'solid' && (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={state.bgSolidColor}
              onChange={e => dispatch({ type: 'SF_SET_BG_SOLID_COLOR', color: e.target.value })}
              className="h-8 w-8 cursor-pointer border border-(--color-border) bg-transparent"
            />
            <input
              type="text"
              value={state.bgSolidColor}
              onChange={e => dispatch({ type: 'SF_SET_BG_SOLID_COLOR', color: e.target.value })}
              className="flex-1 border border-(--color-border) bg-(--color-bg) px-2 py-1 text-xs text-(--color-text) font-mono"
            />
          </div>
        )}

        {/* Pattern */}
        {state.bgType === 'pattern' && (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-3 gap-1">
              {PATTERNS.map(p => (
                <button
                  key={p.id}
                  onClick={() => dispatch({ type: 'SF_SET_BG_PATTERN', patternId: p.id })}
                  className={`px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider transition-colors ${
                    state.bgPatternId === p.id
                      ? 'bg-(--color-accent) text-(--color-accent-text)'
                      : 'border border-(--color-border) text-(--color-text-secondary) hover:bg-(--color-bg-tertiary)'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <label className="text-[10px] uppercase tracking-wider text-(--color-text-secondary) w-8">Fg</label>
              <input
                type="color"
                value={state.bgPatternColor}
                onChange={e => dispatch({ type: 'SF_SET_BG_PATTERN_COLOR', color: e.target.value })}
                className="h-6 w-6 cursor-pointer border border-(--color-border) bg-transparent"
              />
              <input
                type="text"
                value={state.bgPatternColor}
                onChange={e => dispatch({ type: 'SF_SET_BG_PATTERN_COLOR', color: e.target.value })}
                className="flex-1 border border-(--color-border) bg-(--color-bg) px-2 py-0.5 text-[10px] text-(--color-text) font-mono"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[10px] uppercase tracking-wider text-(--color-text-secondary) w-8">Bg</label>
              <input
                type="color"
                value={state.bgPatternBgColor}
                onChange={e => dispatch({ type: 'SF_SET_BG_PATTERN_BG_COLOR', color: e.target.value })}
                className="h-6 w-6 cursor-pointer border border-(--color-border) bg-transparent"
              />
              <input
                type="text"
                value={state.bgPatternBgColor}
                onChange={e => dispatch({ type: 'SF_SET_BG_PATTERN_BG_COLOR', color: e.target.value })}
                className="flex-1 border border-(--color-border) bg-(--color-bg) px-2 py-0.5 text-[10px] text-(--color-text) font-mono"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-[10px] uppercase tracking-wider text-(--color-text-secondary) w-8">Size</label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={state.bgPatternScale}
                onChange={e => dispatch({ type: 'SF_SET_BG_PATTERN_SCALE', scale: parseFloat(e.target.value) })}
                className="flex-1"
              />
              <span className="w-8 text-right text-[10px] tabular-nums text-(--color-text-secondary)">{state.bgPatternScale.toFixed(1)}</span>
            </div>
          </div>
        )}
      </div>
    </fieldset>
  );
}
