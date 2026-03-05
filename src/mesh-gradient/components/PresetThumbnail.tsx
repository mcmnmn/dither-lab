import { useRef, useEffect } from 'react';
import { renderMeshGradient } from '../engine/render-mesh';
import type { MeshPreset } from '../data/presets';

const THUMB_W = 120;
const THUMB_H = 80;

const DEFAULT_EFFECTS = { blur: 40, intensity: 80, smoothness: 60 };
const DEFAULT_NOISE = { amount: 0, scale: 50 };

interface PresetThumbnailProps {
  preset: MeshPreset;
  isSelected: boolean;
  onClick: () => void;
}

export function PresetThumbnail({ preset, isSelected, onClick }: PresetThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = THUMB_W;
    canvas.height = THUMB_H;

    const effects = { ...DEFAULT_EFFECTS, ...preset.effects };
    const noise = { ...DEFAULT_NOISE, ...preset.noise };
    renderMeshGradient(ctx, THUMB_W, THUMB_H, preset.nodes, preset.bgColor, effects, noise);
  }, [preset]);

  return (
    <button
      onClick={onClick}
      className={`flex flex-col gap-1 overflow-hidden rounded-sm border-2 transition-colors ${
        isSelected
          ? 'border-(--color-accent)'
          : 'border-transparent hover:border-(--color-border)'
      }`}
    >
      <canvas
        ref={canvasRef}
        width={THUMB_W}
        height={THUMB_H}
        className="w-full"
        style={{ aspectRatio: `${THUMB_W}/${THUMB_H}` }}
      />
      <span className="w-full px-1 pb-1 text-center text-[9px] uppercase tracking-wider text-(--color-text-secondary)">
        {preset.name}
      </span>
    </button>
  );
}
