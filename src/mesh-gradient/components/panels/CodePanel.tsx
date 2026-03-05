import { useState, useMemo, useCallback } from 'react';
import { useMeshGradientState, useMeshGradientDispatch } from '../../state/context';
import { generateCSS, generateSVG } from '../../engine/generate-code';
import type { MeshExportFormat } from '../../state/types';

export function CodePanel() {
  const state = useMeshGradientState();
  const dispatch = useMeshGradientDispatch();
  const [copied, setCopied] = useState(false);

  const code = useMemo(() => {
    return state.exportFormat === 'css' ? generateCSS(state) : generateSVG(state);
  }, [state]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [code]);

  const handleFormatChange = useCallback((format: MeshExportFormat) => {
    dispatch({ type: 'MG_SET_EXPORT_FORMAT', format });
  }, [dispatch]);

  const btnClass = (active: boolean) =>
    `px-2 py-1 text-[10px] uppercase tracking-wider ${
      active
        ? 'bg-(--color-accent) text-(--color-accent-text)'
        : 'text-(--color-text-secondary) hover:text-(--color-text)'
    }`;

  return (
    <fieldset className="retro-section">
      <legend className="retro-section-label">Code</legend>
      <div className="flex flex-col gap-2">
        {/* Format toggle */}
        <div className="flex items-center justify-between">
          <div className="flex border border-(--color-border)">
            <button onClick={() => handleFormatChange('css')} className={btnClass(state.exportFormat === 'css')}>
              CSS
            </button>
            <button onClick={() => handleFormatChange('svg')} className={btnClass(state.exportFormat === 'svg')}>
              SVG
            </button>
          </div>
          <button
            onClick={handleCopy}
            className="border border-(--color-border) bg-(--color-bg) px-2 py-1 text-[10px] uppercase tracking-wider text-(--color-text-secondary) hover:text-(--color-text)"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        {/* Code output */}
        <textarea
          readOnly
          value={code}
          rows={10}
          className="w-full resize-none border border-(--color-border) bg-(--color-bg) p-2 font-mono text-[10px] leading-relaxed text-(--color-text) outline-none"
        />
      </div>
    </fieldset>
  );
}
