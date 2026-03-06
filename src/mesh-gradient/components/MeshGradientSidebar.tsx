import { useCallback } from 'react';
import { ColorsPanel } from './panels/ColorsPanel';
import { EffectsPanel } from './panels/EffectsPanel';
import { PositionPanel } from './panels/PositionPanel';
import { CodePanel } from './panels/CodePanel';
import { useMeshGradientState, useMeshGradientDispatch } from '../state/context';
import { renderMeshGradient } from '../engine/render-mesh';
import { generateSVG } from '../engine/generate-code';
import { downloadBlob } from '../../utils/image-io';
import { EXPORT_RESOLUTIONS } from '../state/defaults';
import type { MeshOutputFormat, MeshOutputResolution } from '../state/types';

export function MeshGradientSidebar() {
  const state = useMeshGradientState();

  return (
    <aside className="flex w-[280px] flex-shrink-0 flex-col gap-4 overflow-y-auto border-r border-(--color-border) bg-(--color-bg-secondary) p-4">
      <ColorsPanel />
      <EffectsPanel />
      <PositionPanel />
      <OutputPanel />
      {state.showCodePanel && <CodePanel />}
    </aside>
  );
}

function OutputPanel() {
  const state = useMeshGradientState();
  const dispatch = useMeshGradientDispatch();
  const showResolution = state.exportFormat === 'png' || state.exportFormat === 'jpg';

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

  return (
    <fieldset className="retro-section">
      <legend className="retro-section-label">Output</legend>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <select
            value={state.exportFormat}
            onChange={e => dispatch({ type: 'MG_SET_EXPORT_FORMAT', format: e.target.value as MeshOutputFormat })}
            className="flex-1 border border-(--color-border) bg-(--color-bg) px-2 py-1.5 text-xs text-(--color-text) focus:outline-none focus:border-(--color-accent)"
          >
            <option value="png">PNG</option>
            <option value="jpg">JPG</option>
            <option value="svg">SVG</option>
            <option value="css">CSS</option>
          </select>
          {showResolution && (
            <select
              value={state.exportResolution}
              onChange={e => dispatch({ type: 'MG_SET_EXPORT_RESOLUTION', resolution: Number(e.target.value) as MeshOutputResolution })}
              className="flex-1 border border-(--color-border) bg-(--color-bg) px-2 py-1.5 text-xs text-(--color-text) focus:outline-none focus:border-(--color-accent)"
            >
              {EXPORT_RESOLUTIONS.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          )}
        </div>
        <button
          onClick={handleDownload}
          className="w-full border border-(--color-border) px-3 py-1.5 text-xs font-medium uppercase text-(--color-text-secondary) transition-colors hover:bg-(--color-bg-tertiary) hover:text-(--color-text)"
        >
          Download {state.exportFormat.toUpperCase()}
        </button>
      </div>
    </fieldset>
  );
}
