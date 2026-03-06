import { useCallback, useRef } from 'react';
import { useSFState, useSFDispatch } from '../../state/context';
import type { SFLogoPosition } from '../../state/types';

const POSITION_ICONS: { id: SFLogoPosition; icon: string; title: string }[] = [
  { id: 'top-left',      icon: 'M5 5l6 6M5 5h4M5 5v4',       title: 'Top Left' },
  { id: 'top-center',    icon: 'M12 5v8M12 5l-3 3M12 5l3 3',  title: 'Top Center' },
  { id: 'top-right',     icon: 'M19 5l-6 6M19 5h-4M19 5v4',   title: 'Top Right' },
  { id: 'bottom-left',   icon: 'M5 19l6-6M5 19h4M5 19v-4',    title: 'Bottom Left' },
  { id: 'bottom-center', icon: 'M12 19v-8M12 19l-3-3M12 19l3-3', title: 'Bottom Center' },
  { id: 'bottom-right',  icon: 'M19 19l-6-6M19 19h-4M19 19v-4', title: 'Bottom Right' },
];

export function LogoPanel() {
  const state = useSFState();
  const dispatch = useSFDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 200 * 1024) {
      alert('Logo file must be under 200KB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      dispatch({ type: 'SF_SET_LOGO', src: reader.result as string });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [dispatch]);

  return (
    <fieldset className="retro-section">
      <legend className="retro-section-label">Logo</legend>
      <div className="flex flex-col gap-2">
        {/* Toggle */}
        <div className="flex gap-1">
          <button
            onClick={() => { if (!state.logoEnabled) dispatch({ type: 'SF_TOGGLE_LOGO' }); }}
            className={`flex-1 px-2 py-1 text-[10px] font-medium uppercase tracking-wider transition-colors ${
              state.logoEnabled
                ? 'bg-(--color-accent) text-(--color-accent-text)'
                : 'border border-(--color-border) text-(--color-text-secondary) hover:bg-(--color-bg-tertiary)'
            }`}
          >
            On
          </button>
          <button
            onClick={() => { if (state.logoEnabled) dispatch({ type: 'SF_TOGGLE_LOGO' }); }}
            className={`flex-1 px-2 py-1 text-[10px] font-medium uppercase tracking-wider transition-colors ${
              !state.logoEnabled
                ? 'bg-(--color-accent) text-(--color-accent-text)'
                : 'border border-(--color-border) text-(--color-text-secondary) hover:bg-(--color-bg-tertiary)'
            }`}
          >
            Off
          </button>
        </div>

        {state.logoEnabled && (
          <>
            {/* Upload */}
            {state.logoSrc ? (
              <div className="flex items-center gap-2">
                <img src={state.logoSrc} alt="Logo" className="h-8 w-8 border border-(--color-border) object-contain bg-(--color-bg)" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 border border-(--color-border) px-2 py-0.5 text-[10px] uppercase tracking-wider text-(--color-text-secondary) hover:bg-(--color-bg-tertiary)"
                >
                  Replace
                </button>
                <button
                  onClick={() => dispatch({ type: 'SF_CLEAR_LOGO' })}
                  className="border border-(--color-border) px-2 py-0.5 text-[10px] uppercase tracking-wider text-(--color-text-secondary) hover:bg-(--color-bg-tertiary)"
                >
                  Clear
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-(--color-border) p-3 text-[10px] uppercase tracking-wider text-(--color-text-secondary) hover:border-(--color-accent) transition-colors"
              >
                Upload Logo (SVG/PNG)
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/svg+xml,image/png,image/jpeg"
              className="hidden"
              onChange={handleUpload}
            />

            {/* Position */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-(--color-text-secondary)">Position</span>
              <div className="grid grid-cols-3 gap-1">
                {POSITION_ICONS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => dispatch({ type: 'SF_SET_LOGO_POSITION', position: p.id })}
                    className={`flex items-center justify-center py-1.5 transition-colors ${
                      state.logoPosition === p.id
                        ? 'bg-(--color-accent) text-(--color-accent-text)'
                        : 'border border-(--color-border) text-(--color-text-secondary) hover:bg-(--color-bg-tertiary)'
                    }`}
                    title={p.title}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={p.icon} />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Scale */}
            <div className="flex items-center gap-2">
              <label className="w-14 text-[10px] uppercase tracking-wider text-(--color-text-secondary)">Scale</label>
              <input
                type="range"
                min={0.02}
                max={0.15}
                step={0.005}
                value={state.logoScale}
                onChange={e => dispatch({ type: 'SF_SET_LOGO_SCALE', scale: parseFloat(e.target.value) })}
                className="flex-1"
              />
              <span className="w-10 text-right text-[10px] tabular-nums text-(--color-text-secondary)">{Math.round(state.logoScale * 100)}%</span>
            </div>

            {/* Opacity */}
            <div className="flex items-center gap-2">
              <label className="w-14 text-[10px] uppercase tracking-wider text-(--color-text-secondary)">Opacity</label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={state.logoOpacity}
                onChange={e => dispatch({ type: 'SF_SET_LOGO_OPACITY', opacity: parseFloat(e.target.value) })}
                className="flex-1"
              />
              <span className="w-10 text-right text-[10px] tabular-nums text-(--color-text-secondary)">{Math.round(state.logoOpacity * 100)}%</span>
            </div>
          </>
        )}
      </div>
    </fieldset>
  );
}
