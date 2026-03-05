import { useCallback } from 'react';
import { GrainSlider } from '../../../grain/components/common/GrainSlider';
import { useMeshGradientState, useMeshGradientDispatch } from '../../state/context';

export function NoisePanel() {
  const { noise } = useMeshGradientState();
  const dispatch = useMeshGradientDispatch();

  const update = useCallback((key: string, value: number) => {
    dispatch({ type: 'MG_UPDATE_NOISE', noise: { [key]: value } });
  }, [dispatch]);

  return (
    <fieldset className="retro-section">
      <legend className="retro-section-label">Noise</legend>
      <div className="flex flex-col gap-2">
        <GrainSlider label="Amount" value={noise.amount} min={0} max={100} step={1} onChange={v => update('amount', v)} />
        <GrainSlider label="Scale" value={noise.scale} min={0} max={100} step={1} onChange={v => update('scale', v)} />
      </div>
    </fieldset>
  );
}
