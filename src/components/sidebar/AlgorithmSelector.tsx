import { useState } from 'react';
import { useAppState, useAppDispatch } from '../../state/app-context';
import { MatrixEditorModal } from '../matrix-editor/MatrixEditorModal';

type DitherType = 'error-diffusion' | 'ordered' | 'random' | 'threshold' | 'custom';

const DITHER_TYPES: { id: DitherType; label: string }[] = [
  { id: 'error-diffusion', label: 'Error Diffusion' },
  { id: 'ordered', label: 'Ordered' },
  { id: 'random', label: 'Random' },
  { id: 'threshold', label: 'None' },
  { id: 'custom', label: 'Custom' },
];

const DIFFUSION_MAPS: { id: string; label: string }[] = [
  { id: 'floyd-steinberg', label: 'Floyd-Steinberg' },
  { id: 'atkinson', label: 'Atkinson' },
  { id: 'jarvis-judice-ninke', label: 'JJN' },
  { id: 'stucki', label: 'Stucki' },
  { id: 'burkes', label: 'Burkes' },
  { id: 'sierra-full', label: 'Sierra Full' },
  { id: 'sierra-two-row', label: 'Sierra Two-Row' },
  { id: 'sierra-lite', label: 'Sierra Lite' },
];

const ORDERED_MATRICES: { id: string; label: string }[] = [
  { id: 'bayer-2x2', label: 'Bayer 2×2' },
  { id: 'bayer-4x4', label: 'Bayer 4×4' },
  { id: 'bayer-8x8', label: 'Bayer 8×8' },
];

/** Derive the dithering type from a flat algorithmId */
function getTypeFromId(algorithmId: string): DitherType {
  if (DIFFUSION_MAPS.some(m => m.id === algorithmId)) return 'error-diffusion';
  if (ORDERED_MATRICES.some(m => m.id === algorithmId)) return 'ordered';
  if (algorithmId === 'random') return 'random';
  if (algorithmId === 'custom') return 'custom';
  if (algorithmId === 'threshold') return 'threshold';
  return 'error-diffusion';
}

/** Default sub-algorithm for each type */
const TYPE_DEFAULTS: Record<DitherType, string> = {
  'error-diffusion': 'floyd-steinberg',
  'ordered': 'bayer-4x4',
  'random': 'random',
  'threshold': 'threshold',
  'custom': 'custom',
};

export function AlgorithmSelector() {
  const { algorithmId, customMatrix } = useAppState();
  const dispatch = useAppDispatch();
  const activeType = getTypeFromId(algorithmId);
  const [matrixEditorOpen, setMatrixEditorOpen] = useState(false);

  const handleTypeChange = (type: DitherType) => {
    if (type === activeType) return;
    dispatch({ type: 'SET_ALGORITHM', algorithmId: TYPE_DEFAULTS[type] });
  };

  const handleSubChange = (id: string) => {
    dispatch({ type: 'SET_ALGORITHM', algorithmId: id });
  };

  return (
    <div className="retro-section">
      <span className="retro-section-label">Dithering</span>
      <div className="space-y-3">
        {/* Dithering Type */}
        <div>
          <span className="mb-1 block text-[10px] uppercase tracking-wider text-(--color-text-secondary)">
            Type
          </span>
          <select
            value={activeType}
            onChange={e => handleTypeChange(e.target.value as DitherType)}
            className="w-full border border-(--color-border) bg-(--color-bg) px-2 py-1.5 text-xs text-(--color-text) focus:outline-1 focus:outline-(--color-accent)"
          >
            {DITHER_TYPES.map(t => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Diffusion Map (Error Diffusion only) */}
        {activeType === 'error-diffusion' && (
          <div>
            <span className="mb-1 block text-[10px] uppercase tracking-wider text-(--color-text-secondary)">
              Diffusion Map
            </span>
            <div
              className="grid grid-cols-2 border border-(--color-border)"
              style={{ gap: '1px', backgroundColor: 'var(--color-border)' }}
            >
              {DIFFUSION_MAPS.map(m => (
                <button
                  key={m.id}
                  onClick={() => handleSubChange(m.id)}
                  className={`px-2 py-1.5 text-xs text-left transition-colors ${
                    algorithmId === m.id
                      ? 'bg-(--color-accent) text-(--color-accent-text)'
                      : 'bg-(--color-bg) text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-tertiary)'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Ordered Matrix selector */}
        {activeType === 'ordered' && (
          <div>
            <span className="mb-1 block text-[10px] uppercase tracking-wider text-(--color-text-secondary)">
              Matrix Size
            </span>
            <div
              className="grid grid-cols-3 border border-(--color-border)"
              style={{ gap: '1px', backgroundColor: 'var(--color-border)' }}
            >
              {ORDERED_MATRICES.map(m => (
                <button
                  key={m.id}
                  onClick={() => handleSubChange(m.id)}
                  className={`px-2 py-1.5 text-xs text-center transition-colors ${
                    algorithmId === m.id
                      ? 'bg-(--color-accent) text-(--color-accent-text)'
                      : 'bg-(--color-bg) text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-tertiary)'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Matrix */}
        {activeType === 'custom' && (
          <div>
            <button
              onClick={() => setMatrixEditorOpen(true)}
              className="w-full border border-(--color-border) bg-(--color-bg) px-3 py-1.5 text-xs text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-tertiary) transition-colors"
            >
              {customMatrix ? `[ Edit Matrix: ${customMatrix.size}×${customMatrix.size} ]` : '[ Open Matrix Editor... ]'}
            </button>
            <MatrixEditorModal
              isOpen={matrixEditorOpen}
              onClose={() => setMatrixEditorOpen(false)}
              initialMatrix={customMatrix ?? undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
}
