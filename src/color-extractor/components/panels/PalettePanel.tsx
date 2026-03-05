import { useState } from 'react';
import { useColorExtractorState, useColorExtractorDispatch } from '../../state/context';

export function PalettePanel() {
  const { colors } = useColorExtractorState();
  const dispatch = useColorExtractorDispatch();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyHex = (hex: string, index: number) => {
    navigator.clipboard.writeText(hex);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1000);
  };

  if (colors.length === 0) {
    return (
      <div className="retro-section">
        <span className="retro-section-label">Palette</span>
        <div className="py-2 text-center text-[10px] text-(--color-text-secondary)">
          Upload an image to extract colors
        </div>
      </div>
    );
  }

  return (
    <div className="retro-section">
      <span className="retro-section-label">Palette</span>
      <div className="space-y-3">
        {/* Color strip */}
        <div className="flex h-8 overflow-hidden border border-(--color-border)">
          {colors.map((c, i) => (
            <div
              key={i}
              className="flex-1 transition-all hover:flex-[2]"
              style={{ backgroundColor: c.hex }}
              title={c.hex}
            />
          ))}
        </div>

        {/* Individual color rows */}
        <div className="space-y-1.5">
        {colors.map((color, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="h-7 w-7 flex-shrink-0 border border-(--color-border)"
              style={{ backgroundColor: color.hex }}
            />
            <button
              onClick={() => copyHex(color.hex, i)}
              className="flex-1 text-left font-mono text-[10px] uppercase text-(--color-text) hover:text-(--color-accent) transition-colors"
              title="Click to copy"
            >
              {copiedIndex === i ? 'Copied!' : color.hex}
            </button>
            <button
              onClick={() => dispatch({ type: 'CE_TOGGLE_LOCK', index: i })}
              className={`text-[10px] transition-colors ${color.locked ? 'text-(--color-accent)' : 'text-(--color-text-secondary) hover:text-(--color-text)'}`}
              title={color.locked ? 'Unlock' : 'Lock'}
            >
              {color.locked ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>
                </svg>
              )}
            </button>
            <button
              onClick={() => dispatch({ type: 'CE_REMOVE_COLOR', index: i })}
              className="text-[10px] text-(--color-text-secondary) hover:text-(--color-text) transition-colors"
              title="Remove"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
