import { useCallback } from 'react';
import { useMeshGradientDispatch } from '../../state/context';

export function PositionPanel() {
  const dispatch = useMeshGradientDispatch();

  const handleRandomize = useCallback(() => {
    dispatch({ type: 'MG_PUSH_HISTORY' });
    dispatch({ type: 'MG_RANDOMIZE_POSITIONS' });
  }, [dispatch]);

  const handleReset = useCallback(() => {
    dispatch({ type: 'MG_PUSH_HISTORY' });
    dispatch({ type: 'MG_RESET_POSITIONS' });
  }, [dispatch]);

  const handleDistribute = useCallback(() => {
    dispatch({ type: 'MG_PUSH_HISTORY' });
    dispatch({ type: 'MG_DISTRIBUTE_EVENLY' });
  }, [dispatch]);

  const btnClass = 'flex-1 border border-(--color-border) bg-(--color-bg) px-2 py-1.5 text-[10px] uppercase tracking-wider text-(--color-text-secondary) hover:bg-(--color-bg-secondary) hover:text-(--color-text)';

  return (
    <fieldset className="retro-section">
      <legend className="retro-section-label">Position</legend>
      <div className="flex gap-1">
        <button onClick={handleRandomize} className={btnClass}>Randomize</button>
        <button onClick={handleReset} className={btnClass}>Reset</button>
        <button onClick={handleDistribute} className={btnClass}>Even</button>
      </div>
    </fieldset>
  );
}
