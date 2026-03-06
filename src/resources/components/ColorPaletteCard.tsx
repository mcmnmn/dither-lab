import { useState, useCallback } from 'react';
import { useResourcesDispatch } from '../state/context';
import type { ColorResource } from '../state/types';

export function ColorPaletteCard({ resource }: { resource: ColorResource }) {
  const dispatch = useResourcesDispatch();
  const [copied, setCopied] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const copyText = useCallback(async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  }, []);

  const handleCopyCSS = useCallback(() => {
    const css = resource.colors
      .map((c, i) => `  --${(c.name ?? `color-${i + 1}`).toLowerCase().replace(/\s+/g, '-')}: ${c.hex};`)
      .join('\n');
    copyText(`:root {\n${css}\n}`, 'css');
  }, [resource.colors, copyText]);

  const handleCopyAll = useCallback(() => {
    copyText(resource.colors.map(c => c.hex).join('\n'), 'all');
  }, [resource.colors, copyText]);

  const handleDelete = useCallback(() => {
    if (confirmDelete) {
      dispatch({ type: 'RS_DELETE_RESOURCE', resourceId: resource.id });
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  }, [confirmDelete, dispatch, resource.id]);

  return (
    <div className="border border-(--color-border) bg-(--color-bg)">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-(--color-border) px-3 py-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-(--color-text-secondary)">{resource.name}</span>
        <div className="flex gap-1">
          <button
            onClick={() => dispatch({ type: 'RS_SET_EDITING_RESOURCE', resourceId: resource.id })}
            className="p-1 text-(--color-text-secondary) hover:text-(--color-text)"
            title="Edit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className={`p-1 transition-colors ${confirmDelete ? 'text-red-500' : 'text-(--color-text-secondary) hover:text-red-400'}`}
            title="Delete"
          >
            {confirmDelete ? (
              <span className="text-[9px] font-semibold uppercase">Sure?</span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Swatch strip */}
      <div className="flex h-8">
        {resource.colors.map((c, i) => (
          <button
            key={i}
            onClick={() => copyText(c.hex, `swatch-${i}`)}
            className="flex-1 transition-all hover:flex-[2]"
            style={{ backgroundColor: c.hex }}
            title={`${c.name ?? ''} ${c.hex} — click to copy`}
          />
        ))}
      </div>

      {/* Color list */}
      <div className="flex flex-col">
        {resource.colors.map((c, i) => (
          <button
            key={i}
            onClick={() => copyText(c.hex, `row-${i}`)}
            className="flex items-center gap-2 border-t border-(--color-border) px-3 py-1.5 text-left hover:bg-(--color-bg-secondary)"
          >
            <span className="h-4 w-4 flex-shrink-0 border border-(--color-border)" style={{ backgroundColor: c.hex }} />
            {c.name && <span className="min-w-0 flex-1 truncate text-[10px] text-(--color-text-secondary)">{c.name}</span>}
            <span className="flex-shrink-0 font-mono text-[10px] text-(--color-text-secondary)">
              {copied === `swatch-${i}` || copied === `row-${i}` ? 'Copied!' : c.hex}
            </span>
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-1 border-t border-(--color-border) p-2">
        <button
          onClick={handleCopyCSS}
          className="flex-1 border border-(--color-border) py-1 text-[10px] uppercase tracking-wider text-(--color-text-secondary) hover:bg-(--color-bg-secondary) hover:text-(--color-text)"
        >
          {copied === 'css' ? 'Copied!' : 'CSS Vars'}
        </button>
        <button
          onClick={handleCopyAll}
          className="flex-1 border border-(--color-border) py-1 text-[10px] uppercase tracking-wider text-(--color-text-secondary) hover:bg-(--color-bg-secondary) hover:text-(--color-text)"
        >
          {copied === 'all' ? 'Copied!' : 'Copy All'}
        </button>
      </div>
    </div>
  );
}
