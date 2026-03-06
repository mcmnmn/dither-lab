import { useEffect } from 'react';
import { useGraphState, useGraphDispatch } from '../state/context';
import { parseCSV, transposeData } from '../utils/csv-parser';

export function DataInput() {
  const state = useGraphState();
  const dispatch = useGraphDispatch();

  // Re-parse whenever rawInput or transpose changes
  useEffect(() => {
    const { data, error } = parseCSV(state.rawInput);
    const finalData = data && state.transpose ? transposeData(data) : data;
    dispatch({ type: 'GM_SET_PARSED_DATA', data: finalData, error });

    // Auto-select columns from parsed data
    if (finalData && finalData.headers.length > 0) {
      // If current xColumn isn't in new headers, pick first
      if (!finalData.headers.includes(state.xColumn)) {
        dispatch({ type: 'GM_SET_X_COLUMN', column: finalData.headers[0] });
      }
      // If no yColumns match, pick all numeric-looking columns
      const validY = state.yColumns.filter(c => finalData.headers.includes(c));
      if (validY.length === 0) {
        const numericCols = finalData.headers.filter((_h, i) => {
          if (i === 0) return false;
          return finalData.rows.some(row => typeof row[i] === 'number');
        });
        dispatch({ type: 'GM_SET_Y_COLUMNS', columns: numericCols.length > 0 ? numericCols : finalData.headers.slice(1) });
      }
    }
  }, [state.rawInput, state.transpose]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <fieldset className="retro-section">
      <legend className="retro-section-label">Data</legend>
      <div className="flex flex-col gap-2">
        <p className="text-[10px] text-(--color-text-secondary)">Paste CSV or spreadsheet cells</p>
        <textarea
          value={state.rawInput}
          onChange={e => dispatch({ type: 'GM_SET_RAW_INPUT', input: e.target.value })}
          rows={8}
          spellCheck={false}
          className="w-full resize-y border border-(--color-border) bg-(--color-bg) px-2 py-1.5 font-mono text-[11px] text-(--color-text) placeholder:text-(--color-text-secondary)/50 focus:outline-none focus:border-(--color-accent)"
          placeholder="Paste CSV or TSV data here..."
        />
        <p className="text-[10px] leading-relaxed text-(--color-text-secondary)/60">Copy cells from Excel/Sheets, or use comma/tab-separated values.</p>
        {state.parseError && (
          <p className="text-[10px] text-red-500">{state.parseError}</p>
        )}
        <label className="flex items-center gap-2 text-[11px] text-(--color-text-secondary)">
          <input
            type="checkbox"
            checked={state.transpose}
            onChange={e => dispatch({ type: 'GM_SET_TRANSPOSE', transpose: e.target.checked })}
            className="accent-(--color-accent)"
          />
          Transpose rows / columns
        </label>
      </div>
    </fieldset>
  );
}
