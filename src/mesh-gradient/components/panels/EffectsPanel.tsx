import { useCallback } from 'react';
import { GrainSlider } from '../../../grain/components/common/GrainSlider';
import { useMeshGradientState, useMeshGradientDispatch } from '../../state/context';
import { BLEND_MODE_OPTIONS } from '../../state/defaults';
import type { MeshBlendMode } from '../../state/types';

export function EffectsPanel() {
  const { effects } = useMeshGradientState();
  const dispatch = useMeshGradientDispatch();

  const update = useCallback((key: string, value: number) => {
    dispatch({ type: 'MG_UPDATE_EFFECTS', effects: { [key]: value } });
  }, [dispatch]);

  const handleBlendModeChange = useCallback((mode: MeshBlendMode) => {
    dispatch({ type: 'MG_UPDATE_EFFECTS', effects: { blendMode: mode } });
  }, [dispatch]);

  return (
    <fieldset className="retro-section">
      <legend className="retro-section-label">Effects</legend>
      <div className="flex flex-col gap-2">
        <GrainSlider label="Intensity" value={effects.intensity} min={0} max={100} step={1} onChange={v => update('intensity', v)} />
        <GrainSlider label="Smoothness" value={effects.smoothness} min={0} max={100} step={1} onChange={v => update('smoothness', v)} />

        <div className="flex min-w-0 items-center gap-2">
          <label className="w-24 flex-shrink-0 text-[10px] uppercase tracking-wider text-(--color-text-secondary)">
            Blend
          </label>
          <select
            value={effects.blendMode}
            onChange={e => handleBlendModeChange(e.target.value as MeshBlendMode)}
            className="min-w-0 flex-1 border border-(--color-border) bg-(--color-bg) px-1.5 py-1 text-[10px] uppercase tracking-wider text-(--color-text-secondary) outline-none"
          >
            {BLEND_MODE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
    </fieldset>
  );
}
