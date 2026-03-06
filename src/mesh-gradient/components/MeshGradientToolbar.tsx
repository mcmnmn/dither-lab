import { useCallback } from 'react';
import { useMeshGradientState, useMeshGradientDispatch } from '../state/context';
import { meshGradientInitialState } from '../state/defaults';

export function MeshGradientToolbar() {
  const state = useMeshGradientState();
  const dispatch = useMeshGradientDispatch();

  const handleGenerate = useCallback(() => {
    dispatch({ type: 'MG_PUSH_HISTORY' });
    dispatch({ type: 'MG_GENERATE' });
  }, [dispatch]);

  const handleReset = useCallback(() => {
    dispatch({ type: 'MG_PUSH_HISTORY' });
    dispatch({ type: 'MG_LOAD_STATE', state: {
      nodes: meshGradientInitialState.nodes,
      bgColor: meshGradientInitialState.bgColor,
      effects: meshGradientInitialState.effects,
    } });
  }, [dispatch]);

  const btnClass = 'border border-(--color-border) bg-(--color-bg) px-2 py-1.5 text-[10px] uppercase tracking-wider text-(--color-text-secondary) hover:bg-(--color-bg-secondary) hover:text-(--color-text) disabled:opacity-30 disabled:pointer-events-none';

  return (
    <div className="flex items-center gap-1 border-t border-(--color-border) bg-(--color-bg-secondary) px-3 py-2">
      <button onClick={handleGenerate} className="border border-(--color-accent) bg-(--color-accent) px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-(--color-accent-text) hover:opacity-90">
        Generate
      </button>

      <button onClick={() => dispatch({ type: 'MG_TOGGLE_CODE_PANEL' })} className={`${btnClass} ${state.showCodePanel ? 'bg-(--color-bg-tertiary) text-(--color-text)' : ''}`}>
        Code
      </button>

      <div className="flex-1" />

      <button onClick={handleReset} className={btnClass} title="Reset">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
      </button>
    </div>
  );
}
