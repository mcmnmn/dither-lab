import { useState, useMemo } from 'react';
import { useColorExtractorState, useColorExtractorDispatch } from '../../state/context';
import type { PaletteOutputFormat, ExtractedColor } from '../../state/types';

const FORMATS: { value: PaletteOutputFormat; label: string }[] = [
  { value: 'hex', label: 'HEX' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'tailwind', label: 'TW' },
];

function formatPalette(colors: ExtractedColor[], format: PaletteOutputFormat): string {
  switch (format) {
    case 'css':
      return colors.map((c, i) => `--color-${i + 1}: ${c.hex};`).join('\n');
    case 'json':
      return JSON.stringify(colors.map(c => ({ hex: c.hex, rgb: c.rgb })), null, 2);
    case 'hex':
      return colors.map(c => c.hex).join('\n');
    case 'tailwind':
      return JSON.stringify(
        Object.fromEntries(colors.map((c, i) => [`color-${i + 1}`, c.hex])),
        null, 2,
      );
  }
}

export function OutputPanel() {
  const { colors, exportFormat } = useColorExtractorState();
  const dispatch = useColorExtractorDispatch();
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => formatPalette(colors, exportFormat), [colors, exportFormat]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <div className="retro-section">
      <span className="retro-section-label">Output</span>
      <div className="space-y-3">
        <div className="flex gap-1">
          {FORMATS.map(f => (
            <button
              key={f.value}
              onClick={() => dispatch({ type: 'CE_SET_EXPORT_FORMAT', format: f.value })}
              className={`flex-1 border px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                exportFormat === f.value
                  ? 'border-(--color-accent) bg-(--color-accent) text-(--color-accent-text)'
                  : 'border-(--color-border) text-(--color-text-secondary) hover:text-(--color-text) hover:border-(--color-text-secondary)'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {colors.length > 0 && (
          <>
            <textarea
              readOnly
              value={output}
              className="h-24 w-full resize-none border border-(--color-border) bg-(--color-bg) p-2 font-mono text-[10px] text-(--color-text) focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="w-full border border-(--color-accent) bg-(--color-accent) px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-(--color-accent-text) transition-colors hover:bg-(--color-accent-hover) hover:border-(--color-accent-hover)"
            >
              {copied ? '>> Copied! <<' : '>> Copy All <<'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
