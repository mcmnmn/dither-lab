import { useCallback, type RefObject } from 'react';
import { useGraphState, useGraphDispatch } from '../state/context';
import { LEGEND_POSITION_OPTIONS } from '../state/defaults';
import { ThemeSelector } from './ThemeSelector';
import { exportSVG, exportPNG, makeFilename } from '../utils/output';
import type { LegendPosition, GraphOutputFormat } from '../state/types';

interface RightSidebarProps {
  svgRef: RefObject<SVGSVGElement | null>;
}

export function GraphRightSidebar({ svgRef }: RightSidebarProps) {
  return (
    <aside className="flex w-[240px] flex-shrink-0 flex-col gap-4 overflow-y-auto border-l border-(--color-border) bg-(--color-bg-secondary) p-4">
      <RightSidebarContent svgRef={svgRef} />
    </aside>
  );
}

export function RightSidebarContent({ svgRef }: RightSidebarProps) {
  const state = useGraphState();
  const dispatch = useGraphDispatch();

  const handleOutput = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const filename = makeFilename(state.activeThemeId, state.exportFormat);
    if (state.exportFormat === 'svg') {
      exportSVG(svg, filename);
    } else {
      exportPNG(svg, state.width, state.height, filename);
    }
  }, [svgRef, state.activeThemeId, state.exportFormat, state.width, state.height]);

  return (
    <>
      <ThemeSelector />

      {/* Legend */}
      <fieldset className="retro-section">
        <legend className="retro-section-label">Legend</legend>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-[11px] text-(--color-text)">
            <input
              type="checkbox"
              checked={state.showLegend}
              onChange={e => dispatch({ type: 'GM_SET_SHOW_LEGEND', show: e.target.checked })}
              className="accent-(--color-accent)"
            />
            Show Legend
          </label>
          {state.showLegend && (
            <>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider text-(--color-text-secondary)">Position</span>
                <select
                  value={state.legendPosition}
                  onChange={e => dispatch({ type: 'GM_SET_LEGEND_POSITION', position: e.target.value as LegendPosition })}
                  className="w-full border border-(--color-border) bg-(--color-bg) px-2 py-1.5 text-xs text-(--color-text) focus:outline-none focus:border-(--color-accent)"
                >
                  {LEGEND_POSITION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-2 text-[11px] text-(--color-text)">
                <input
                  type="checkbox"
                  checked={state.capitalizeLegend}
                  onChange={e => dispatch({ type: 'GM_SET_CAPITALIZE_LEGEND', capitalize: e.target.checked })}
                  className="accent-(--color-accent)"
                />
                Capitalize Labels
              </label>
            </>
          )}
        </div>
      </fieldset>

      {/* Layout */}
      <fieldset className="retro-section">
        <legend className="retro-section-label">Layout</legend>
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <NumberInput label="Width" value={state.width} min={200} max={2000} step={10}
              onChange={v => dispatch({ type: 'GM_SET_WIDTH', width: v })} />
            <NumberInput label="Height" value={state.height} min={150} max={1500} step={10}
              onChange={v => dispatch({ type: 'GM_SET_HEIGHT', height: v })} />
          </div>
          <div className="grid grid-cols-4 gap-1">
            <NumberInput label="T" value={state.paddingTop} min={0} max={100} step={5}
              onChange={v => dispatch({ type: 'GM_SET_PADDING', side: 'top', value: v })} />
            <NumberInput label="R" value={state.paddingRight} min={0} max={100} step={5}
              onChange={v => dispatch({ type: 'GM_SET_PADDING', side: 'right', value: v })} />
            <NumberInput label="B" value={state.paddingBottom} min={0} max={100} step={5}
              onChange={v => dispatch({ type: 'GM_SET_PADDING', side: 'bottom', value: v })} />
            <NumberInput label="L" value={state.paddingLeft} min={0} max={100} step={5}
              onChange={v => dispatch({ type: 'GM_SET_PADDING', side: 'left', value: v })} />
          </div>
          <NumberInput label="Corner Radius" value={state.cornerRadius} min={0} max={32} step={1}
            onChange={v => dispatch({ type: 'GM_SET_CORNER_RADIUS', radius: v })} />
          <label className="flex items-center gap-2 text-[11px] text-(--color-text)">
            <input
              type="checkbox"
              checked={state.showGridlines}
              onChange={e => dispatch({ type: 'GM_SET_SHOW_GRIDLINES', show: e.target.checked })}
              className="accent-(--color-accent)"
            />
            Gridlines
          </label>
          <label className="flex items-center gap-2 text-[11px] text-(--color-text)">
            <input
              type="checkbox"
              checked={state.showFrame}
              onChange={e => dispatch({ type: 'GM_SET_SHOW_FRAME', show: e.target.checked })}
              className="accent-(--color-accent)"
            />
            Frame Border
          </label>
        </div>
      </fieldset>

      {/* Output */}
      <fieldset className="retro-section">
        <legend className="retro-section-label">Output</legend>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-0 border border-(--color-border)">
            {(['png', 'svg'] as GraphOutputFormat[]).map(fmt => (
              <button
                key={fmt}
                onClick={() => dispatch({ type: 'GM_SET_EXPORT_FORMAT', format: fmt })}
                className={`flex-1 px-2 py-1 text-xs font-medium uppercase transition-colors ${
                  state.exportFormat === fmt
                    ? 'bg-(--color-accent) text-(--color-accent-text)'
                    : 'text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-tertiary)'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
          <button
            onClick={handleOutput}
            disabled={!state.parsedData}
            className="w-full border border-(--color-border) px-3 py-1.5 text-xs font-medium uppercase text-(--color-text-secondary) transition-colors hover:bg-(--color-bg-tertiary) hover:text-(--color-text) disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Download {state.exportFormat.toUpperCase()}
          </button>
        </div>
      </fieldset>
    </>
  );
}

function NumberInput({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-(--color-text-secondary)">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full border border-(--color-border) bg-(--color-bg) px-2 py-1.5 text-xs tabular-nums text-(--color-text) focus:outline-none focus:border-(--color-accent)"
      />
    </label>
  );
}
