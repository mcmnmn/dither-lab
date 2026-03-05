import { useState, useCallback } from 'react';
import { useMeshGradientState, useMeshGradientDispatch } from '../../state/context';
import { MESH_PRESETS } from '../../data/presets';
import { PresetThumbnail } from '../PresetThumbnail';
import type { MeshPreset } from '../../data/presets';

export function PresetsPanel() {
  const state = useMeshGradientState();
  const dispatch = useMeshGradientDispatch();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = useCallback((preset: MeshPreset) => {
    dispatch({ type: 'MG_PUSH_HISTORY' });
    dispatch({
      type: 'MG_LOAD_STATE',
      state: {
        nodes: preset.nodes.map(n => ({ ...n })),
        bgColor: preset.bgColor,
        ...(preset.effects ? { effects: { ...state.effects, ...preset.effects } } : {}),
      },
    });
    setSelectedId(preset.id);
  }, [dispatch, state.effects]);

  return (
    <fieldset className="retro-section">
      <legend className="retro-section-label">Gradients</legend>
      <div className="grid grid-cols-2 gap-2">
        {MESH_PRESETS.map(preset => (
          <PresetThumbnail
            key={preset.id}
            preset={preset}
            isSelected={selectedId === preset.id}
            onClick={() => handleSelect(preset)}
          />
        ))}
      </div>
    </fieldset>
  );
}
