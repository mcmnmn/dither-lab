import { useState, useCallback } from 'react';
import { useSvgAnimatorState, useSvgAnimatorDispatch } from '../../state/context';
import { BUILT_IN_RECIPES } from '../../state/defaults';
import type { Recipe } from '../../state/types';

export function RecipesPanel() {
  const { recipes, preset, duration, easing, loop, stagger, staggerDelay, staggerMode, intensity, transformOrigin, slideDirection } = useSvgAnimatorState();
  const dispatch = useSvgAnimatorDispatch();
  const [newName, setNewName] = useState('');
  const [showSave, setShowSave] = useState(false);

  const allRecipes = [...BUILT_IN_RECIPES, ...recipes];

  const handleApply = useCallback((recipe: Recipe) => {
    dispatch({ type: 'SA_APPLY_RECIPE', recipe });
  }, [dispatch]);

  const handleSave = useCallback(() => {
    if (!newName.trim()) return;
    const recipe: Recipe = {
      id: `user-${Date.now()}`,
      name: newName.trim(),
      preset,
      duration,
      easing,
      loop,
      stagger,
      staggerDelay,
      staggerMode,
      intensity,
      transformOrigin,
      slideDirection,
      builtIn: false,
    };
    dispatch({ type: 'SA_SAVE_RECIPE', recipe });
    setNewName('');
    setShowSave(false);
  }, [newName, preset, duration, easing, loop, stagger, staggerDelay, staggerMode, intensity, transformOrigin, slideDirection, dispatch]);

  return (
    <fieldset className="retro-section">
      <legend className="retro-section-label">Recipes</legend>

      <div className="flex flex-col gap-1">
        {allRecipes.map(recipe => (
          <div key={recipe.id} className="flex items-center gap-1">
            <button
              onClick={() => handleApply(recipe)}
              className="flex-1 border border-(--color-border) px-2 py-1 text-left text-[10px] uppercase tracking-wider text-(--color-text-secondary) hover:bg-(--color-bg-secondary) hover:text-(--color-text)"
            >
              {recipe.name}
              {recipe.builtIn && (
                <span className="ml-1 text-[8px] opacity-50">built-in</span>
              )}
            </button>
            {!recipe.builtIn && (
              <button
                onClick={() => dispatch({ type: 'SA_DELETE_RECIPE', id: recipe.id })}
                className="border border-(--color-border) px-1 py-1 text-[10px] text-(--color-text-secondary) hover:text-red-500"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {showSave ? (
        <div className="mt-2 flex gap-1">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder="Recipe name..."
            className="flex-1 border border-(--color-border) bg-(--color-bg) px-2 py-1 text-[10px] text-(--color-text) outline-none placeholder:text-(--color-text-secondary)/50"
            autoFocus
          />
          <button
            onClick={handleSave}
            disabled={!newName.trim()}
            className="border border-(--color-accent) bg-(--color-accent) px-2 py-1 text-[10px] uppercase tracking-wider text-(--color-accent-text) disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={() => { setShowSave(false); setNewName(''); }}
            className="border border-(--color-border) px-1.5 py-1 text-[10px] text-(--color-text-secondary)"
          >
            ×
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowSave(true)}
          className="mt-2 w-full border border-(--color-border) bg-(--color-bg) px-2 py-1.5 text-[10px] uppercase tracking-wider text-(--color-text-secondary) hover:bg-(--color-bg-secondary) hover:text-(--color-text)"
        >
          Save Current
        </button>
      )}
    </fieldset>
  );
}
