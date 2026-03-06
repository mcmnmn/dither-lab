import { useGraphState, useGraphDispatch } from '../state/context';
import { CHART_TYPE_OPTIONS, X_FORMAT_OPTIONS, LINE_CAP_OPTIONS } from '../state/defaults';
import { DataInput } from './DataInput';
import type { ChartType, XFormat, LineCap } from '../state/types';

export function GraphSidebar() {
  return (
    <aside className="flex w-[280px] flex-shrink-0 flex-col gap-4 overflow-y-auto border-r border-(--color-border) bg-(--color-bg-secondary) p-4">
      <SidebarContent />
    </aside>
  );
}

export function SidebarContent() {
  const state = useGraphState();
  const dispatch = useGraphDispatch();
  const headers = state.parsedData?.headers ?? [];

  return (
    <>
      <DataInput />

      {/* Column selection */}
      {headers.length > 0 && (
        <fieldset className="retro-section">
          <legend className="retro-section-label">Columns</legend>
          <div className="flex flex-col gap-2">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-(--color-text-secondary)">X Axis</span>
              <select
                value={state.xColumn}
                onChange={e => dispatch({ type: 'GM_SET_X_COLUMN', column: e.target.value })}
                className="w-full border border-(--color-border) bg-(--color-bg) px-2 py-1.5 text-xs text-(--color-text) focus:outline-none focus:border-(--color-accent)"
              >
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </label>
            <div>
              <span className="mb-1 block text-[10px] uppercase tracking-wider text-(--color-text-secondary)">Y Series</span>
              <div className="flex flex-col gap-1">
                {headers.filter(h => h !== state.xColumn).map(h => (
                  <label key={h} className="flex items-center gap-2 text-[11px] text-(--color-text)">
                    <input
                      type="checkbox"
                      checked={state.yColumns.includes(h)}
                      onChange={() => dispatch({ type: 'GM_TOGGLE_Y_COLUMN', column: h })}
                      className="accent-(--color-accent)"
                    />
                    {h}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </fieldset>
      )}

      {/* Chart type & style */}
      <fieldset className="retro-section">
        <legend className="retro-section-label">Chart</legend>
        <div className="flex flex-col gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider text-(--color-text-secondary)">Type</span>
            <select
              value={state.chartType}
              onChange={e => dispatch({ type: 'GM_SET_CHART_TYPE', chartType: e.target.value as ChartType })}
              className="w-full border border-(--color-border) bg-(--color-bg) px-2 py-1.5 text-xs text-(--color-text) focus:outline-none focus:border-(--color-accent)"
            >
              {CHART_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>

          {(state.chartType === 'line' || state.chartType === 'area') && (
            <>
              <NumberInput label="Line Width" value={state.lineWidth} min={0.5} max={8} step={0.5}
                onChange={v => dispatch({ type: 'GM_SET_LINE_WIDTH', lineWidth: v })} />
              <label className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider text-(--color-text-secondary)">Line Cap</span>
                <select
                  value={state.lineCap}
                  onChange={e => dispatch({ type: 'GM_SET_LINE_CAP', lineCap: e.target.value as LineCap })}
                  className="w-full border border-(--color-border) bg-(--color-bg) px-2 py-1.5 text-xs text-(--color-text) focus:outline-none focus:border-(--color-accent)"
                >
                  {LINE_CAP_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </label>
            </>
          )}
        </div>
      </fieldset>

      {/* Labels */}
      <fieldset className="retro-section">
        <legend className="retro-section-label">Labels</legend>
        <div className="flex flex-col gap-2">
          <TextInput label="Title" value={state.title}
            onChange={v => dispatch({ type: 'GM_SET_TITLE', title: v })} />
          <TextInput label="Subtitle" value={state.subtitle}
            onChange={v => dispatch({ type: 'GM_SET_SUBTITLE', subtitle: v })} />
          <TextInput label="X Label" value={state.xLabel}
            onChange={v => dispatch({ type: 'GM_SET_X_LABEL', label: v })} />
          <TextInput label="Y Label" value={state.yLabel}
            onChange={v => dispatch({ type: 'GM_SET_Y_LABEL', label: v })} />
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider text-(--color-text-secondary)">X Format</span>
            <select
              value={state.xFormat}
              onChange={e => dispatch({ type: 'GM_SET_X_FORMAT', format: e.target.value as XFormat })}
              className="w-full border border-(--color-border) bg-(--color-bg) px-2 py-1.5 text-xs text-(--color-text) focus:outline-none focus:border-(--color-accent)"
            >
              {X_FORMAT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
        </div>
      </fieldset>

    </>
  );
}

// ─── Shared input helpers ──────────────────────────────────────────────

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-(--color-text-secondary)">{label}</span>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full border border-(--color-border) bg-(--color-bg) px-2 py-1.5 text-xs text-(--color-text) focus:outline-none focus:border-(--color-accent)"
      />
    </label>
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
