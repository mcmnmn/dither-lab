import { useCallback } from 'react';

interface MatrixGridProps {
  size: number;
  weights: number[];
  onChange: (weights: number[]) => void;
}

export function MatrixGrid({ size, weights, onChange }: MatrixGridProps) {
  const maxWeight = Math.max(1, ...weights);

  const handleCellChange = useCallback((index: number, value: number) => {
    const newWeights = [...weights];
    newWeights[index] = Math.max(0, Math.min(255, value));
    onChange(newWeights);
  }, [weights, onChange]);

  return (
    <div
      className="grid gap-1"
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
    >
      {Array.from({ length: size * size }, (_, i) => {
        const intensity = weights[i] / maxWeight;
        const pct = Math.round((0.1 + intensity * 0.6) * 100);
        const bg = `color-mix(in srgb, var(--color-accent) ${pct}%, transparent)`;

        return (
          <input
            key={i}
            type="number"
            min={0}
            max={255}
            value={weights[i]}
            onChange={e => handleCellChange(i, parseInt(e.target.value) || 0)}
            className="aspect-square w-full border border-(--color-border) bg-(--color-bg-secondary) text-center text-xs text-(--color-text) focus:outline-1 focus:outline-(--color-accent)"
            style={{ backgroundColor: bg }}
          />
        );
      })}
    </div>
  );
}
