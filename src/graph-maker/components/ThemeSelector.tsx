import { useGraphState, useGraphDispatch } from '../state/context';
import { THEMES, THEME_IDS } from '../state/themes';

export function ThemeSelector() {
  const { activeThemeId } = useGraphState();
  const dispatch = useGraphDispatch();

  return (
    <fieldset className="retro-section">
      <legend className="retro-section-label">Theme</legend>
      <div className="flex flex-col gap-2">
        <select
          value={activeThemeId}
          onChange={e => dispatch({ type: 'GM_SET_ACTIVE_THEME', themeId: e.target.value })}
          className="w-full border border-(--color-border) bg-(--color-bg) px-2 py-1.5 text-xs text-(--color-text) focus:outline-none focus:border-(--color-accent)"
        >
          {THEME_IDS.map(id => (
            <option key={id} value={id}>{id}</option>
          ))}
        </select>

        {/* Theme preview swatches */}
        <div className="flex gap-1">
          {THEMES[activeThemeId].series.map((color, i) => (
            <div
              key={i}
              className="h-4 flex-1 border border-(--color-border)"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>
    </fieldset>
  );
}
