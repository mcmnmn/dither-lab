import { useCallback } from 'react';
import { useMeshGradientState, useMeshGradientDispatch } from '../state/context';
import { renderMeshGradient } from '../engine/render-mesh';
import { generateSVG } from '../engine/generate-code';
import { downloadBlob } from '../../utils/image-io';
import { EXPORT_RESOLUTIONS, meshGradientInitialState } from '../state/defaults';
import type { MeshExportFormat, MeshExportResolution } from '../state/types';

export function MeshGradientToolbar() {
  const state = useMeshGradientState();
  const dispatch = useMeshGradientDispatch();
  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  const handleGenerate = useCallback(() => {
    dispatch({ type: 'MG_PUSH_HISTORY' });
    dispatch({ type: 'MG_GENERATE' });
  }, [dispatch]);

  const handleDownload = useCallback(() => {
    const format = state.exportFormat;
    const timestamp = Date.now();

    if (format === 'svg') {
      const svg = generateSVG(state);
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      downloadBlob(blob, `mesh-gradient-${timestamp}.svg`);
      return;
    }

    if (format === 'css') {
      if (!state.showCodePanel) dispatch({ type: 'MG_TOGGLE_CODE_PANEL' });
      return;
    }

    // PNG or JPG export
    const size = state.exportResolution;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    renderMeshGradient(ctx, size, size, state.nodes, state.bgColor, state.effects);

    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
    const quality = format === 'jpg' ? 0.92 : undefined;
    const extension = format === 'jpg' ? 'jpg' : 'png';

    canvas.toBlob(
      blob => {
        if (blob) downloadBlob(blob, `mesh-gradient-${timestamp}.${extension}`);
      },
      mimeType,
      quality,
    );
  }, [state, dispatch]);

  const handleReset = useCallback(() => {
    dispatch({ type: 'MG_PUSH_HISTORY' });
    dispatch({ type: 'MG_LOAD_STATE', state: {
      nodes: meshGradientInitialState.nodes,
      bgColor: meshGradientInitialState.bgColor,
      effects: meshGradientInitialState.effects,
    } });
  }, [dispatch]);

  const showResolution = state.exportFormat === 'png' || state.exportFormat === 'jpg';

  const btnClass = 'border border-(--color-border) bg-(--color-bg) px-2 py-1.5 text-[10px] uppercase tracking-wider text-(--color-text-secondary) hover:bg-(--color-bg-secondary) hover:text-(--color-text) disabled:opacity-30 disabled:pointer-events-none';
  const selectClass = 'border border-(--color-border) bg-(--color-bg) px-1.5 py-1 text-[10px] uppercase tracking-wider text-(--color-text-secondary) outline-none';

  return (
    <div className="flex items-center gap-1 border-t border-(--color-border) bg-(--color-bg-secondary) px-3 py-2">
      <button onClick={handleGenerate} className="border border-(--color-accent) bg-(--color-accent) px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-(--color-accent-text) hover:opacity-90">
        Generate
      </button>

      <button onClick={() => dispatch({ type: 'MG_TOGGLE_CODE_PANEL' })} className={`${btnClass} ${state.showCodePanel ? 'bg-(--color-bg-tertiary) text-(--color-text)' : ''}`}>
        Code
      </button>

      <div className="flex-1" />

      <button onClick={() => dispatch({ type: 'MG_UNDO' })} disabled={!canUndo} className={btnClass} title="Undo">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
      </button>

      <button onClick={() => dispatch({ type: 'MG_REDO' })} disabled={!canRedo} className={btnClass} title="Redo">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10" />
        </svg>
      </button>

      <button onClick={() => dispatch({ type: 'MG_TOGGLE_DARK_PREVIEW' })} className={btnClass} title={state.darkPreview ? 'Light preview' : 'Dark preview'}>
        {state.darkPreview ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>

      <button onClick={handleReset} className={btnClass} title="Reset">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
      </button>

      {/* Export controls */}
      <select
        value={state.exportFormat}
        onChange={e => dispatch({ type: 'MG_SET_EXPORT_FORMAT', format: e.target.value as MeshExportFormat })}
        className={selectClass}
      >
        <option value="png">PNG</option>
        <option value="jpg">JPG</option>
        <option value="svg">SVG</option>
        <option value="css">CSS</option>
      </select>

      {showResolution && (
        <select
          value={state.exportResolution}
          onChange={e => dispatch({ type: 'MG_SET_EXPORT_RESOLUTION', resolution: Number(e.target.value) as MeshExportResolution })}
          className={selectClass}
        >
          {EXPORT_RESOLUTIONS.map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      )}

      <button onClick={handleDownload} className={btnClass} title={`Download ${state.exportFormat.toUpperCase()}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </button>
    </div>
  );
}
