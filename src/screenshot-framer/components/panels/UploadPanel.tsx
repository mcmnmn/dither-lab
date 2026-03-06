import { useCallback } from 'react';
import { useSFState, useSFDispatch } from '../../state/context';
import { DropZone } from '../../../components/common/DropZone';

export function UploadPanel() {
  const { screenshotSrc, screenshotFileName } = useSFState();
  const dispatch = useSFDispatch();

  const handleFiles = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      dispatch({ type: 'SF_SET_SCREENSHOT', src: reader.result as string, fileName: file.name });
    };
    reader.readAsDataURL(file);
  }, [dispatch]);

  const handleClear = useCallback(() => {
    dispatch({ type: 'SF_CLEAR_SCREENSHOT' });
  }, [dispatch]);

  return (
    <fieldset className="retro-section">
      <legend className="retro-section-label">Screenshot</legend>

      {screenshotSrc ? (
        <div className="flex flex-col gap-2">
          <img
            src={screenshotSrc}
            alt="Screenshot preview"
            className="w-full rounded border border-(--color-border) object-contain"
            style={{ maxHeight: 160 }}
          />
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[10px] text-(--color-text-secondary)">{screenshotFileName}</span>
            <button
              onClick={handleClear}
              className="flex-shrink-0 border border-(--color-border) px-2 py-0.5 text-[10px] uppercase tracking-wider text-(--color-text-secondary) hover:bg-(--color-bg-tertiary) hover:text-(--color-text)"
            >
              Clear
            </button>
          </div>
        </div>
      ) : (
        <DropZone onFiles={handleFiles} accept="image/*" className="cursor-pointer rounded border-2 border-dashed border-(--color-border) p-6 text-center transition-colors hover:border-(--color-accent)">
          <div className="flex flex-col items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-(--color-text-secondary) opacity-50">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span className="text-[10px] uppercase tracking-wider text-(--color-text-secondary)">
              Drop image or click
            </span>
          </div>
        </DropZone>
      )}
    </fieldset>
  );
}
