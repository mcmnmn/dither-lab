import { useCallback } from 'react';
import { DropZone } from '../common/DropZone';
import { useAppState, useAppDispatch } from '../../state/app-context';
import { MEDIA_ACCEPT } from '../../utils/media-io';

interface InputSectionProps {
  onFiles: (files: File[]) => void;
  showModeToggle?: boolean;
  multiple?: boolean;
  accept?: string;
  formatHint?: string;
}

export function InputSection({
  onFiles,
  showModeToggle = false,
  multiple = false,
  accept = MEDIA_ACCEPT,
  formatHint = 'PNG, JPG, GIF, MP4, WebM, GLB',
}: InputSectionProps) {
  const { mode } = useAppState();
  const dispatch = useAppDispatch();

  const handleModeChange = useCallback((m: 'single' | 'batch') => {
    dispatch({ type: 'SET_MODE', mode: m });
  }, [dispatch]);

  return (
    <fieldset className="retro-section">
      <legend className="retro-section-label">Input</legend>
      <div className="flex flex-col gap-2">
        <DropZone
          onFiles={onFiles}
          multiple={multiple}
          accept={accept}
          className="cursor-pointer border border-dashed border-(--color-border) px-4 py-4 text-center transition-colors hover:border-(--color-text-secondary)"
        >
          <p className="font-mono text-xs text-(--color-text-secondary)">
            Drop file or click to browse
          </p>
          <p className="mt-1 font-mono text-[10px] text-(--color-text-secondary) opacity-50">
            {formatHint}
          </p>
        </DropZone>

        {showModeToggle && (
          <div className="flex border border-(--color-border)">
            {(['single', 'batch'] as const).map(m => (
              <button
                key={m}
                onClick={() => handleModeChange(m)}
                className={`flex-1 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider transition-colors ${
                  mode === m
                    ? 'bg-(--color-accent) text-(--color-accent-text)'
                    : 'text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-tertiary)'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        )}
      </div>
    </fieldset>
  );
}
