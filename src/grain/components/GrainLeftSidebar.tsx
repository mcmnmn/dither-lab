import { useGrainState, useGrainDispatch } from '../state/grain-context';
import { EFFECTS } from './effects';

export function GrainLeftSidebar() {
  const { activeEffect } = useGrainState();
  const dispatch = useGrainDispatch();

  return (
    <aside className="flex w-[280px] flex-shrink-0 flex-col overflow-y-auto border-r border-(--color-border) bg-(--color-bg-secondary) p-4">
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-(--color-text-secondary)">
        Effects
      </div>
      <div className="flex flex-col gap-0.5">
        {EFFECTS.map(effect => (
          <button
            key={effect.id}
            onClick={() => dispatch({ type: 'GRAIN_SET_EFFECT', effect: effect.id })}
            className={`px-2 py-1.5 text-left text-xs font-medium transition-colors ${
              activeEffect === effect.id
                ? 'bg-(--color-accent) text-(--color-accent-text)'
                : 'text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-tertiary)'
            }`}
          >
            {effect.label}
          </button>
        ))}
      </div>
    </aside>
  );
}
