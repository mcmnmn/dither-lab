import { useCallback } from 'react';
import { GrainSlider } from '../../../grain/components/common/GrainSlider';
import { useMeshGradientState, useMeshGradientDispatch } from '../../state/context';

export function EffectsPanel() {
  const { effects } = useMeshGradientState();
  const dispatch = useMeshGradientDispatch();

  const update = useCallback((key: string, value: number) => {
    dispatch({ type: 'MG_UPDATE_EFFECTS', effects: { [key]: value } });
  }, [dispatch]);

  return (
    <fieldset className="retro-section">
      <legend className="retro-section-label">Effects</legend>
      <div className="flex flex-col gap-2">
        <GrainSlider label="Blur" value={effects.blur} min={0} max={100} step={1} onChange={v => update('blur', v)} />
        <GrainSlider label="Intensity" value={effects.intensity} min={0} max={100} step={1} onChange={v => update('intensity', v)} />
        <GrainSlider label="Smoothness" value={effects.smoothness} min={0} max={100} step={1} onChange={v => update('smoothness', v)} />
      </div>
    </fieldset>
  );
}
