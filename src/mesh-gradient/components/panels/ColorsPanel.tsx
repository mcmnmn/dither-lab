import { useCallback } from 'react';
import { GrainDropdown } from '../../../grain/components/common/GrainDropdown';
import { useMeshGradientState, useMeshGradientDispatch } from '../../state/context';
import { HARMONY_OPTIONS } from '../../state/defaults';

export function ColorsPanel() {
  const { nodes, bgColor, harmonyRule } = useMeshGradientState();
  const dispatch = useMeshGradientDispatch();

  const handleAddNode = useCallback(() => {
    dispatch({ type: 'MG_PUSH_HISTORY' });
    dispatch({
      type: 'MG_ADD_NODE',
      node: {
        id: crypto.randomUUID(),
        x: 0.1 + Math.random() * 0.8,
        y: 0.1 + Math.random() * 0.8,
        color: '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0'),
      },
    });
  }, [dispatch]);

  const handleRemoveNode = useCallback((id: string) => {
    dispatch({ type: 'MG_PUSH_HISTORY' });
    dispatch({ type: 'MG_REMOVE_NODE', id });
  }, [dispatch]);

  const handleColorChange = useCallback((id: string, color: string) => {
    dispatch({ type: 'MG_UPDATE_NODE_COLOR', id, color });
  }, [dispatch]);

  const handleColorBlur = useCallback(() => {
    dispatch({ type: 'MG_PUSH_HISTORY' });
  }, [dispatch]);

  return (
    <fieldset className="retro-section">
      <legend className="retro-section-label">Colors</legend>
      <div className="flex flex-col gap-3">
        {/* Background color */}
        <div className="flex items-center gap-2">
          <span className="w-16 flex-shrink-0 text-[10px] uppercase tracking-wider text-(--color-text-secondary)">
            Background
          </span>
          <div className="flex flex-1 items-center gap-1">
            <input
              type="color"
              value={bgColor}
              onChange={e => dispatch({ type: 'MG_SET_BG_COLOR', color: e.target.value })}
              className="h-6 w-6 cursor-pointer border border-(--color-border) bg-transparent p-0"
            />
            <input
              type="text"
              value={bgColor}
              onChange={e => dispatch({ type: 'MG_SET_BG_COLOR', color: e.target.value })}
              className="flex-1 border border-(--color-border) bg-(--color-bg) px-2 py-0.5 font-mono text-[10px] text-(--color-text) outline-none"
            />
          </div>
        </div>

        {/* Harmony */}
        <GrainDropdown
          label="Harmony"
          value={harmonyRule}
          options={HARMONY_OPTIONS}
          onChange={v => dispatch({ type: 'MG_SET_HARMONY', rule: v as typeof harmonyRule })}
          labelWidth="w-16"
        />

        {/* Divider */}
        <div className="border-t border-(--color-border)" />

        {/* Node colors */}
        <div className="flex flex-col gap-1.5">
          {nodes.map((node, i) => (
            <div key={node.id} className="flex items-center gap-1.5">
              <span className="w-4 text-center font-mono text-[9px] text-(--color-text-secondary)">
                {i + 1}
              </span>
              <input
                type="color"
                value={node.color}
                onChange={e => handleColorChange(node.id, e.target.value)}
                onBlur={handleColorBlur}
                className="h-6 w-6 cursor-pointer border border-(--color-border) bg-transparent p-0"
              />
              <input
                type="text"
                value={node.color}
                onChange={e => handleColorChange(node.id, e.target.value)}
                onBlur={handleColorBlur}
                className="flex-1 border border-(--color-border) bg-(--color-bg) px-2 py-0.5 font-mono text-[10px] text-(--color-text) outline-none"
              />
              {nodes.length > 2 && (
                <button
                  onClick={() => handleRemoveNode(node.id)}
                  className="border border-(--color-border) p-0.5 text-(--color-text-secondary) hover:text-(--color-text)"
                  title="Remove"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add color */}
        {nodes.length < 12 && (
          <button
            onClick={handleAddNode}
            className="w-full border border-dashed border-(--color-border) px-3 py-1 text-[10px] uppercase tracking-wider text-(--color-text-secondary) hover:border-(--color-text-secondary) hover:text-(--color-text)"
          >
            + Add Color
          </button>
        )}
      </div>
    </fieldset>
  );
}
