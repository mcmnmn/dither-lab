import { useGrainState, useGrainDispatch } from '../../state/grain-context';
import { GrainSlider } from '../common/GrainSlider';
import { GrainCheckbox } from '../common/GrainCheckbox';
import { CollapsibleSection } from '../common/CollapsibleSection';
import type { ProcessingSettings } from '../../state/types';

export function ProcessingPanel() {
  const { processing } = useGrainState();
  const dispatch = useGrainDispatch();

  const update = (settings: Partial<ProcessingSettings>) => {
    dispatch({ type: 'GRAIN_UPDATE_PROCESSING', settings });
  };

  return (
    <CollapsibleSection title="Processing" defaultOpen={false}>
      <GrainCheckbox label="Invert" checked={processing.invert} onChange={v => update({ invert: v })} />
      <GrainSlider label="Brightness Map" value={processing.brightnessMap} min={0} max={2} step={0.05} onChange={v => update({ brightnessMap: v })} />
      <GrainSlider label="Edge Enhance" value={processing.edgeEnhance} min={0} max={20} step={1} onChange={v => update({ edgeEnhance: v })} />
      <GrainSlider label="Blur" value={processing.blur} min={0} max={10} step={0.5} onChange={v => update({ blur: v })} />
      <GrainSlider label="Quantize Colors" value={processing.quantizeColors} min={0} max={32} step={1} onChange={v => update({ quantizeColors: v })} />
    </CollapsibleSection>
  );
}
