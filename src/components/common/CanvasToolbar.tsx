import { useAppState, useAppDispatch } from '../../state/app-context';
import { useZoomPan } from '../../hooks/use-zoom-pan';
import type { CropAspectRatio } from '../../state/types';

export function CanvasToolbar() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { zoomIn, zoomOut, resetView } = useZoomPan();

  return (
    <div className="flex items-center justify-between border-t border-(--color-border) bg-(--color-bg-secondary) px-3 py-2">
      {/* LEFT: Aspect ratio buttons */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0 border border-(--color-border)">
          {(['original', '16:9', '4:3', '1:1', '3:4', '9:16'] as const satisfies readonly CropAspectRatio[]).map(ratio => (
            <button
              key={ratio}
              onClick={() => dispatch({ type: 'SET_CROP_ASPECT_RATIO', ratio })}
              className={`px-2 py-1 text-xs font-medium uppercase transition-colors ${
                state.cropAspectRatio === ratio
                  ? 'bg-(--color-accent) text-(--color-accent-text)'
                  : 'text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-tertiary)'
              }`}
            >
              {ratio === 'original' ? 'Original' : ratio}
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT: Zoom controls */}
      <div className="flex items-center gap-1">
        <button onClick={zoomOut} className="border border-(--color-border) px-1.5 py-0.5 text-xs text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-tertiary)">-</button>
        <span className="min-w-[3rem] text-center text-xs tabular-nums text-(--color-text-secondary)">
          {Math.round(state.zoom * 100)}%
        </span>
        <button onClick={zoomIn} className="border border-(--color-border) px-1.5 py-0.5 text-xs text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-tertiary)">+</button>
        <button onClick={resetView} className="border border-(--color-border) px-2 py-1 text-xs text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-tertiary)">
          Fit
        </button>
      </div>
    </div>
  );
}
