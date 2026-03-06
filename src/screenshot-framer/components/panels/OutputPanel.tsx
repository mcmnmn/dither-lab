import { useCallback, useRef, useState } from 'react';
import { useSFState } from '../../state/context';
import { exportFrame } from '../../engine/frame-renderer';
import type { SFOutputFormat, SFOutputResolution } from '../../state/types';
import { useSFDispatch } from '../../state/context';

export function OutputPanel() {
  const state = useSFState();
  const dispatch = useSFDispatch();
  const [exporting, setExporting] = useState(false);
  const screenshotRef = useRef<HTMLImageElement | null>(null);
  const logoRef = useRef<HTMLImageElement | null>(null);

  const handleExport = useCallback(async () => {
    if (exporting) return;
    setExporting(true);

    // Load images for export
    const loadImg = (src: string | null): Promise<HTMLImageElement | null> => {
      if (!src) return Promise.resolve(null);
      return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      });
    };

    const [ssImg, lgImg] = await Promise.all([
      loadImg(state.screenshotSrc),
      loadImg(state.logoSrc),
    ]);

    screenshotRef.current = ssImg;
    logoRef.current = lgImg;

    await exportFrame(state, screenshotRef.current, logoRef.current);
    setExporting(false);
  }, [state, exporting]);

  return (
    <fieldset className="retro-section">
      <legend className="retro-section-label">Output</legend>
      <div className="flex flex-col gap-2">
        {/* Resolution */}
        <div className="flex items-center gap-2">
          <span className="w-14 text-[10px] uppercase tracking-wider text-(--color-text-secondary)">Size</span>
          <div className="flex flex-1 gap-1">
            {([1080, 2048] as SFOutputResolution[]).map(res => (
              <button
                key={res}
                onClick={() => dispatch({ type: 'SF_SET_OUTPUT_RESOLUTION', resolution: res })}
                className={`flex-1 px-2 py-1 text-[10px] font-medium transition-colors ${
                  state.outputResolution === res
                    ? 'bg-(--color-accent) text-(--color-accent-text)'
                    : 'border border-(--color-border) text-(--color-text-secondary) hover:bg-(--color-bg-tertiary)'
                }`}
              >
                {res}px
              </button>
            ))}
          </div>
        </div>

        {/* Format */}
        <div className="flex items-center gap-2">
          <span className="w-14 text-[10px] uppercase tracking-wider text-(--color-text-secondary)">Format</span>
          <div className="flex flex-1 gap-1">
            {(['png', 'jpg'] as SFOutputFormat[]).map(fmt => (
              <button
                key={fmt}
                onClick={() => dispatch({ type: 'SF_SET_OUTPUT_FORMAT', format: fmt })}
                className={`flex-1 px-2 py-1 text-[10px] font-medium uppercase transition-colors ${
                  state.outputFormat === fmt
                    ? 'bg-(--color-accent) text-(--color-accent-text)'
                    : 'border border-(--color-border) text-(--color-text-secondary) hover:bg-(--color-bg-tertiary)'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Download */}
        <button
          onClick={handleExport}
          disabled={!state.screenshotSrc || exporting}
          className="mt-1 w-full bg-(--color-accent) px-4 py-2 text-xs font-bold uppercase tracking-wider text-(--color-accent-text) transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {exporting ? 'Exporting...' : 'Download'}
        </button>
      </div>
    </fieldset>
  );
}
