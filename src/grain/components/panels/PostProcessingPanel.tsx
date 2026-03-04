import { useGrainState, useGrainDispatch } from '../../state/grain-context';
import { GrainSlider } from '../common/GrainSlider';
import { GrainCheckbox } from '../common/GrainCheckbox';
import { CollapsibleSection } from '../common/CollapsibleSection';
import type { PostProcessingSettings } from '../../state/types';

export function PostProcessingPanel() {
  const { postProcessing } = useGrainState();
  const dispatch = useGrainDispatch();

  const update = (settings: Partial<PostProcessingSettings>) => {
    dispatch({ type: 'GRAIN_UPDATE_POST_PROCESSING', settings });
  };

  return (
    <CollapsibleSection title="Post-Processing" defaultOpen={false}>
      {/* Bloom */}
      <div className="flex flex-col gap-2">
        <GrainCheckbox
          label="Bloom"
          checked={postProcessing.bloom.enabled}
          onChange={v => update({ bloom: { ...postProcessing.bloom, enabled: v } })}
        />
        {postProcessing.bloom.enabled && (
          <>
            <GrainSlider label="Threshold" value={postProcessing.bloom.threshold} min={0} max={1} step={0.05} onChange={v => update({ bloom: { ...postProcessing.bloom, threshold: v } })} />
            <GrainSlider label="Intensity" value={postProcessing.bloom.intensity} min={0} max={5} step={0.1} onChange={v => update({ bloom: { ...postProcessing.bloom, intensity: v } })} />
            <GrainSlider label="Radius" value={postProcessing.bloom.radius} min={1} max={30} step={1} onChange={v => update({ bloom: { ...postProcessing.bloom, radius: v } })} />
          </>
        )}
      </div>

      {/* Grain / Film Noise */}
      <div className="flex flex-col gap-2">
        <GrainCheckbox
          label="Film Grain"
          checked={postProcessing.grain.enabled}
          onChange={v => update({ grain: { ...postProcessing.grain, enabled: v } })}
        />
        {postProcessing.grain.enabled && (
          <>
            <GrainSlider label="Intensity" value={postProcessing.grain.intensity} min={0} max={100} step={1} onChange={v => update({ grain: { ...postProcessing.grain, intensity: v } })} />
            <GrainSlider label="Size" value={postProcessing.grain.size} min={1} max={5} step={0.5} onChange={v => update({ grain: { ...postProcessing.grain, size: v } })} />
          </>
        )}
      </div>

      {/* Chromatic Aberration */}
      <div className="flex flex-col gap-2">
        <GrainCheckbox
          label="Chromatic Aberration"
          checked={postProcessing.chromatic.enabled}
          onChange={v => update({ chromatic: { ...postProcessing.chromatic, enabled: v } })}
        />
        {postProcessing.chromatic.enabled && (
          <GrainSlider label="Offset" value={postProcessing.chromatic.offset} min={0} max={20} step={1} onChange={v => update({ chromatic: { ...postProcessing.chromatic, offset: v } })} />
        )}
      </div>

      {/* Scanlines */}
      <div className="flex flex-col gap-2">
        <GrainCheckbox
          label="Scanlines"
          checked={postProcessing.scanlines.enabled}
          onChange={v => update({ scanlines: { ...postProcessing.scanlines, enabled: v } })}
        />
        {postProcessing.scanlines.enabled && (
          <>
            <GrainSlider label="Opacity" value={postProcessing.scanlines.opacity} min={0} max={1} step={0.05} onChange={v => update({ scanlines: { ...postProcessing.scanlines, opacity: v } })} />
            <GrainSlider label="Spacing" value={postProcessing.scanlines.spacing} min={1} max={8} step={1} onChange={v => update({ scanlines: { ...postProcessing.scanlines, spacing: v } })} />
          </>
        )}
      </div>

      {/* Vignette */}
      <div className="flex flex-col gap-2">
        <GrainCheckbox
          label="Vignette"
          checked={postProcessing.vignette.enabled}
          onChange={v => update({ vignette: { ...postProcessing.vignette, enabled: v } })}
        />
        {postProcessing.vignette.enabled && (
          <>
            <GrainSlider label="Intensity" value={postProcessing.vignette.intensity} min={0} max={1} step={0.05} onChange={v => update({ vignette: { ...postProcessing.vignette, intensity: v } })} />
            <GrainSlider label="Radius" value={postProcessing.vignette.radius} min={0.1} max={1} step={0.05} onChange={v => update({ vignette: { ...postProcessing.vignette, radius: v } })} />
          </>
        )}
      </div>

      {/* CRT Curve */}
      <GrainCheckbox
        label="CRT Curve"
        checked={postProcessing.crtCurve}
        onChange={v => update({ crtCurve: v })}
      />
    </CollapsibleSection>
  );
}
