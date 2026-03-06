import { useCallback, useRef, useEffect, useState } from 'react';
import { useSvgAnimatorState, useSvgAnimatorDispatch } from '../../state/context';
import { parseSvg } from '../../engine/svg-parser';
import { SAMPLE_SVGS } from '../../data/sample-svgs';

export function InputPanel() {
  const { svgSource, parseError } = useSvgAnimatorState();
  const dispatch = useSvgAnimatorDispatch();
  const fileRef = useRef<HTMLInputElement>(null);
  const [parseWarning, setParseWarning] = useState<string | null>(null);

  // Parse SVG when source changes
  useEffect(() => {
    if (!svgSource.trim()) {
      dispatch({ type: 'SA_SET_PARSED_SVG', parsed: null, error: null });
      setParseWarning(null);
      return;
    }
    try {
      const { parsed, warning } = parseSvg(svgSource);
      dispatch({ type: 'SA_SET_PARSED_SVG', parsed, error: null });
      setParseWarning(warning);
    } catch (err) {
      dispatch({ type: 'SA_SET_PARSED_SVG', parsed: null, error: (err as Error).message });
      setParseWarning(null);
    }
  }, [svgSource, dispatch]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      dispatch({ type: 'SA_SET_SVG_SOURCE', source: reader.result as string });
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [dispatch]);

  const handleLoadSample = useCallback((svg: string) => {
    dispatch({ type: 'SA_SET_SVG_SOURCE', source: svg });
  }, [dispatch]);

  return (
    <fieldset className="retro-section">
      <legend className="retro-section-label">Input</legend>

      <textarea
        value={svgSource}
        onChange={e => dispatch({ type: 'SA_SET_SVG_SOURCE', source: e.target.value })}
        placeholder="Paste SVG code here..."
        rows={5}
        className="w-full resize-none border border-(--color-border) bg-(--color-bg) px-2 py-1.5 font-mono text-[10px] text-(--color-text) outline-none placeholder:text-(--color-text-secondary)/50"
      />

      <button
        onClick={() => fileRef.current?.click()}
        className="mt-2 w-full border border-(--color-border) bg-(--color-bg) px-2 py-1.5 text-[10px] uppercase tracking-wider text-(--color-text-secondary) hover:bg-(--color-bg-secondary) hover:text-(--color-text)"
      >
        Upload .svg
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".svg"
        onChange={handleFileUpload}
        className="hidden"
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-[10px] text-(--color-text-secondary)">Samples:</span>
        {SAMPLE_SVGS.map(s => (
          <button
            key={s.id}
            onClick={() => handleLoadSample(s.svg)}
            className="border border-(--color-border) px-1.5 py-0.5 text-[10px] text-(--color-text-secondary) hover:bg-(--color-bg-secondary) hover:text-(--color-text)"
          >
            {s.label}
          </button>
        ))}
      </div>

      {parseError && (
        <p className="mt-2 text-[10px] uppercase tracking-wider text-red-500">{parseError}</p>
      )}
      {parseWarning && !parseError && (
        <p className="mt-2 text-[10px] uppercase tracking-wider text-amber-500">{parseWarning}</p>
      )}

    </fieldset>
  );
}
