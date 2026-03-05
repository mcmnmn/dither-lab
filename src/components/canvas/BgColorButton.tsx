import { useState, useRef, useEffect } from 'react';
import { useAppState, useAppDispatch } from '../../state/app-context';

const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#1A1A1A', '#333333',
  '#666666', '#999999', '#CCCCCC', '#F5F5F5',
  '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
  '#FF00FF', '#00FFFF', '#FF6600', '#8B00FF',
];

export function BgColorButton() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [hexInput, setHexInput] = useState(state.bgColor);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Sync hex input when bgColor changes externally
  useEffect(() => {
    setHexInput(state.bgColor);
  }, [state.bgColor]);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const setColor = (color: string) => {
    dispatch({ type: 'SET_BG_COLOR', color });
  };

  const handleHexSubmit = () => {
    const cleaned = hexInput.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(cleaned)) {
      setColor(cleaned);
    }
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 border border-(--color-border) px-2 py-1 text-xs text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-tertiary) transition-colors"
      >
        <span
          className="inline-block h-3 w-3 border border-(--color-border)"
          style={{ backgroundColor: state.bgColor }}
        />
        BG
      </button>

      {open && (
        <div
          ref={popoverRef}
          className="absolute bottom-full right-0 mb-2 w-48 border border-(--color-border) bg-(--color-bg-secondary) p-3 shadow-lg"
        >
          {/* Preset grid */}
          <div className="grid grid-cols-8 gap-1 mb-3">
            {PRESET_COLORS.map(color => (
              <button
                key={color}
                onClick={() => setColor(color)}
                className={`h-4 w-4 border transition-transform hover:scale-125 ${
                  state.bgColor === color ? 'border-(--color-accent) ring-1 ring-(--color-accent)' : 'border-(--color-border)'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>

          {/* Native color picker */}
          <div className="flex items-center gap-2 mb-2">
            <input
              type="color"
              value={state.bgColor}
              onChange={(e) => setColor(e.target.value)}
              className="h-6 w-6 cursor-pointer border border-(--color-border) bg-transparent p-0"
            />
            <span className="text-xs text-(--color-text-secondary)">Custom</span>
          </div>

          {/* Hex input */}
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={hexInput}
              onChange={(e) => setHexInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleHexSubmit()}
              onBlur={handleHexSubmit}
              className="flex-1 border border-(--color-border) bg-(--color-bg) px-1.5 py-0.5 text-xs text-(--color-text) font-mono"
              maxLength={7}
              placeholder="#000000"
            />
          </div>
        </div>
      )}
    </div>
  );
}
