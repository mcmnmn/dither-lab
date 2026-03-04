import { useState, useCallback, useEffect } from 'react';
import { useAppDispatch } from '../../state/app-context';
import { MatrixGrid } from './MatrixGrid';
import type { CustomMatrix } from '../../algorithms/types';

interface MatrixEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMatrix?: CustomMatrix;
}

const SAVED_MATRICES_KEY = 'dither-lab-custom-matrices';

function loadSavedMatrices(): CustomMatrix[] {
  try {
    return JSON.parse(localStorage.getItem(SAVED_MATRICES_KEY) || '[]');
  } catch { return []; }
}

function saveMatrixToStorage(matrix: CustomMatrix) {
  try {
    const saved = loadSavedMatrices();
    const existing = saved.findIndex((m) => m.id === matrix.id);
    if (existing >= 0) saved[existing] = matrix;
    else saved.push(matrix);
    localStorage.setItem(SAVED_MATRICES_KEY, JSON.stringify(saved));
  } catch { /* ignore */ }
}

function deleteMatrixFromStorage(id: string) {
  try {
    const saved = loadSavedMatrices();
    localStorage.setItem(SAVED_MATRICES_KEY, JSON.stringify(saved.filter(m => m.id !== id)));
  } catch { /* ignore */ }
}

export function MatrixEditorModal({ isOpen, onClose, initialMatrix }: MatrixEditorModalProps) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState(initialMatrix?.name ?? 'Custom Matrix');
  const [size, setSize] = useState(initialMatrix?.size ?? 4);
  const [weights, setWeights] = useState<number[]>(
    initialMatrix?.weights ?? Array(size * size).fill(0).map((_, i) => i)
  );
  const [savedMatrices, setSavedMatrices] = useState<CustomMatrix[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSavedMatrices(loadSavedMatrices());
    }
  }, [isOpen]);

  const handleSizeChange = useCallback((newSize: number) => {
    setSize(newSize);
    setWeights(Array(newSize * newSize).fill(0).map((_, i) => i));
  }, []);

  const handleApply = useCallback(() => {
    const matrix: CustomMatrix = {
      id: initialMatrix?.id ?? `custom-${Date.now()}`,
      name,
      size,
      weights,
      createdAt: Date.now(),
    };
    dispatch({ type: 'SET_CUSTOM_MATRIX', matrix });
    dispatch({ type: 'SET_ALGORITHM', algorithmId: 'custom' });

    saveMatrixToStorage(matrix);
    setSavedMatrices(loadSavedMatrices());
    onClose();
  }, [name, size, weights, initialMatrix, dispatch, onClose]);

  const handleLoadSaved = useCallback((matrix: CustomMatrix) => {
    setName(matrix.name);
    setSize(matrix.size);
    setWeights([...matrix.weights]);
  }, []);

  const handleDeleteSaved = useCallback((id: string) => {
    deleteMatrixFromStorage(id);
    setSavedMatrices(loadSavedMatrices());
  }, []);

  const handleCopyJson = useCallback(() => {
    const json = JSON.stringify({ name, size, weights }, null, 2);
    navigator.clipboard.writeText(json);
  }, [name, size, weights]);

  const handlePasteJson = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      const parsed = JSON.parse(text);
      if (parsed.size && parsed.weights && Array.isArray(parsed.weights)) {
        setName(parsed.name || 'Imported Matrix');
        setSize(parsed.size);
        setWeights(parsed.weights);
      }
    } catch { /* ignore invalid JSON */ }
  }, []);

  const handleImportFile = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (parsed.size && parsed.weights) {
          setName(parsed.name || file.name.replace('.json', ''));
          setSize(parsed.size);
          setWeights(parsed.weights);
        }
      } catch { /* ignore */ }
    };
    input.click();
  }, []);

  const handleExportFile = useCallback(() => {
    const json = JSON.stringify({ name, size, weights }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [name, size, weights]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-[480px] max-h-[90vh] overflow-y-auto border-2 border-(--color-border) bg-(--color-bg) p-6"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-(--color-text)">== Custom Matrix Editor ==</h2>

        {/* Saved matrices dropdown */}
        {savedMatrices.length > 0 && (
          <div className="mb-3 space-y-1">
            <span className="text-xs text-(--color-text-secondary)">Saved Matrices</span>
            <div className="flex flex-wrap gap-1">
              {savedMatrices.map(m => (
                <div key={m.id} className="flex items-center gap-0.5">
                  <button
                    onClick={() => handleLoadSaved(m)}
                    className="border border-(--color-border) bg-(--color-bg) px-2 py-1 text-xs text-(--color-text-secondary) hover:text-(--color-text) transition-colors"
                  >
                    {m.name} ({m.size}x{m.size})
                  </button>
                  <button
                    onClick={() => handleDeleteSaved(m.id)}
                    className="border border-(--color-border) px-1 py-1 text-xs text-(--color-text-secondary) opacity-50 hover:opacity-100 hover:text-red-500 transition-all"
                    title="Delete"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Name */}
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="mb-3 w-full border border-(--color-border) bg-(--color-bg) px-2 py-1.5 text-xs text-(--color-text) focus:outline-1 focus:outline-(--color-accent)"
          placeholder="Matrix name"
        />

        {/* Size selector */}
        <div className="mb-3 flex items-center gap-2">
          <span className="text-xs text-(--color-text-secondary)">Size:</span>
          {[2, 3, 4, 5, 6, 7, 8].map(s => (
            <button
              key={s}
              onClick={() => handleSizeChange(s)}
              className={`border border-(--color-border) px-2 py-1 text-xs font-medium transition-colors ${
                size === s
                  ? 'bg-(--color-accent) text-(--color-accent-text) border-(--color-accent)'
                  : 'bg-(--color-bg) text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-tertiary)'
              }`}
            >
              {s}x{s}
            </button>
          ))}
        </div>

        {/* Grid */}
        <MatrixGrid size={size} weights={weights} onChange={setWeights} />

        {/* Import/Export */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={handleCopyJson} className="border border-(--color-border) bg-(--color-bg) px-3 py-1.5 text-xs text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-tertiary)">
            Copy JSON
          </button>
          <button onClick={handlePasteJson} className="border border-(--color-border) bg-(--color-bg) px-3 py-1.5 text-xs text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-tertiary)">
            Paste JSON
          </button>
          <button onClick={handleImportFile} className="border border-(--color-border) bg-(--color-bg) px-3 py-1.5 text-xs text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-tertiary)">
            Import File
          </button>
          <button onClick={handleExportFile} className="border border-(--color-border) bg-(--color-bg) px-3 py-1.5 text-xs text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-tertiary)">
            Export File
          </button>
        </div>

        {/* Actions */}
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="border border-(--color-border) px-4 py-2 text-xs text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-tertiary)"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="border border-(--color-accent) bg-(--color-accent) px-4 py-2 text-xs font-bold uppercase text-(--color-accent-text) hover:bg-(--color-accent-hover)"
          >
            Apply Matrix
          </button>
        </div>
      </div>
    </div>
  );
}
