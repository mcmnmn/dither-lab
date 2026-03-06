import { useAppState, useAppDispatch } from '../../state/app-context';
import { ALGORITHMS } from '../../algorithms';
import { Tooltip } from '../common/Tooltip';
import type { OutputFormat } from '../../state/types';

export function OutputSettings() {
  const { exportFormat, exportScale, algorithmId, strength, threshold } = useAppState();
  const dispatch = useAppDispatch();

  const currentAlg = ALGORITHMS.find(a => a.id === algorithmId);
  const isErrorDiffusion = currentAlg?.category === 'error-diffusion';
  const isThreshold = algorithmId === 'threshold';
  const isRandom = algorithmId === 'random';

  return (
    <div className="retro-section">
      <span className="retro-section-label">Output</span>

      <div className="space-y-3">
        {/* Strength slider (error diffusion + random) */}
        {(isErrorDiffusion || isRandom) && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-(--color-text-secondary)">
              <span>Strength</span>
              <span className="tabular-nums">{Math.round(strength * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(strength * 100)}
              onChange={e => dispatch({ type: 'SET_STRENGTH', strength: parseInt(e.target.value) / 100 })}
              className="w-full accent-(--color-accent)"
            />
          </div>
        )}

        {/* Threshold slider */}
        {isThreshold && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-(--color-text-secondary)">
              <span>Threshold</span>
              <span className="tabular-nums">{threshold}</span>
            </div>
            <input
              type="range"
              min={0}
              max={255}
              value={threshold}
              onChange={e => dispatch({ type: 'SET_THRESHOLD', threshold: parseInt(e.target.value) })}
              className="w-full accent-(--color-accent)"
            />
          </div>
        )}

        {/* Format */}
        <div className="space-y-1">
          <Tooltip text="Choose the output file format">
            <span className="text-xs text-(--color-text-secondary)">Format</span>
          </Tooltip>
          <div className="flex gap-0 border border-(--color-border)">
            {(['png', 'jpg', 'webp', 'gif'] as OutputFormat[]).map(fmt => (
              <button
                key={fmt}
                onClick={() => dispatch({ type: 'SET_EXPORT_FORMAT', format: fmt })}
                className={`flex-1 px-2 py-1.5 text-xs font-medium uppercase transition-colors ${
                  exportFormat === fmt
                    ? 'bg-(--color-accent) text-(--color-accent-text)'
                    : 'text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-tertiary)'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Scale */}
        <div className="space-y-1">
          <Tooltip text="Nearest-neighbor upscale for pixel art export">
            <span className="text-xs text-(--color-text-secondary)">Scale</span>
          </Tooltip>
          <div className="flex gap-0 border border-(--color-border)">
            {[1, 2, 4, 8].map(s => (
              <button
                key={s}
                onClick={() => dispatch({ type: 'SET_EXPORT_SCALE', scale: s })}
                className={`flex-1 px-2 py-1.5 text-xs font-medium transition-colors ${
                  exportScale === s
                    ? 'bg-(--color-accent) text-(--color-accent-text)'
                    : 'text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-tertiary)'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
