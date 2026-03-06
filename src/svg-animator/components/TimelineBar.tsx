import { useCallback } from 'react';
import { useSvgAnimatorState, useSvgAnimatorDispatch } from '../state/context';

export function TimelineBar() {
  const { playing, duration, parsedSvg, stagger, staggerDelay, staggerMode } = useSvgAnimatorState();
  const dispatch = useSvgAnimatorDispatch();

  const totalElements = parsedSvg?.animatableCount ?? 1;
  const maxStaggerOffset = stagger ? (totalElements - 1) * staggerDelay : 0;
  const totalDuration = duration + maxStaggerOffset;

  const handleRestart = useCallback(() => {
    dispatch({ type: 'SA_RESTART_ANIMATION' });
  }, [dispatch]);

  if (!parsedSvg) return null;

  return (
    <div className="flex items-center gap-2 border-t border-(--color-border) bg-(--color-bg-secondary) px-3 py-1.5">
      {/* Transport controls */}
      <div className="flex gap-0.5">
        <button
          onClick={handleRestart}
          className="border border-(--color-border) px-1.5 py-0.5 text-[10px] text-(--color-text-secondary) hover:text-(--color-text)"
          title="Restart"
        >
          ⏮
        </button>
        <button
          onClick={() => dispatch({ type: 'SA_TOGGLE_PLAYING' })}
          className="border border-(--color-border) px-1.5 py-0.5 text-[10px] text-(--color-text-secondary) hover:text-(--color-text)"
          title={playing ? 'Pause' : 'Play'}
        >
          {playing ? '⏸' : '▶'}
        </button>
      </div>

      {/* Duration display */}
      <span className="min-w-[60px] text-[10px] uppercase tracking-wider text-(--color-text-secondary)">
        {totalDuration}ms
      </span>

      {/* Mini-lanes visualization */}
      {stagger && totalElements > 1 && (
        <div className="flex flex-1 flex-col gap-px overflow-hidden">
          {parsedSvg.elements.slice(0, 12).map((el, i) => {
            const delayFraction = getDelayFraction(i, totalElements, staggerDelay, staggerMode, totalDuration);
            const durationFraction = Math.min(duration / totalDuration, 1);
            return (
              <div key={i} className="flex h-1 items-center" title={el.name}>
                <div
                  className="h-full rounded-sm bg-(--color-accent)/60"
                  style={{
                    marginLeft: `${delayFraction * 100}%`,
                    width: `${durationFraction * 100}%`,
                  }}
                />
              </div>
            );
          })}
          {totalElements > 12 && (
            <span className="text-[8px] text-(--color-text-secondary)">+{totalElements - 12} more</span>
          )}
        </div>
      )}

      {!stagger && (
        <div className="flex flex-1 items-center">
          <div className="h-1.5 w-full rounded-sm bg-(--color-accent)/40" />
        </div>
      )}
    </div>
  );
}

function getDelayFraction(
  index: number,
  total: number,
  baseDelay: number,
  mode: string,
  totalDuration: number,
): number {
  let delay: number;
  switch (mode) {
    case 'reverse':
      delay = (total - 1 - index) * baseDelay;
      break;
    case 'center-out': {
      const center = (total - 1) / 2;
      delay = Math.abs(index - center) * baseDelay;
      break;
    }
    case 'random':
      delay = ((Math.sin(index * 9301 + 49297) % 1 + 1) % 1) * total * baseDelay;
      break;
    default: // sequential
      delay = index * baseDelay;
  }
  return totalDuration > 0 ? delay / totalDuration : 0;
}
