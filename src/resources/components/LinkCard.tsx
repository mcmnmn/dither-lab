import { useState, useCallback } from 'react';
import { useResourcesDispatch } from '../state/context';
import type { LinkResource } from '../state/types';

export function LinkCard({ resource }: { resource: LinkResource }) {
  const dispatch = useResourcesDispatch();
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleCopyUrl = useCallback(async () => {
    await navigator.clipboard.writeText(resource.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [resource.url]);

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
        <span className="text-[10px] font-semibold uppercase tracking-wider text-(--color-text-secondary) truncate">{resource.name}</span>
        <div className="flex gap-1">
          <button onClick={() => dispatch({ type: 'RS_SET_EDITING_RESOURCE', resourceId: resource.id })} className="p-1 text-(--color-text-secondary) hover:text-(--color-text)" title="Edit">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
          </button>
          <button onClick={handleDelete} className={`p-1 transition-colors ${confirmDelete ? 'text-red-500' : 'text-(--color-text-secondary) hover:text-red-400'}`} title="Delete">
            {confirmDelete ? <span className="text-[9px] font-semibold uppercase">Sure?</span> : (
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Link content */}
      <button
        onClick={() => window.open(resource.url, '_blank', 'noopener')}
        className="flex w-full items-center gap-3 p-3 text-left hover:bg-(--color-bg-secondary)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-(--color-text-secondary)">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium text-(--color-text)">{resource.label}</div>
          <div className="truncate font-mono text-[10px] text-(--color-text-secondary)">{resource.url}</div>
        </div>
      </button>

      {/* Copy URL */}
      <div className="border-t border-(--color-border) p-2">
        <button onClick={handleCopyUrl} className="w-full border border-(--color-border) py-1 text-[10px] uppercase tracking-wider text-(--color-text-secondary) hover:bg-(--color-bg-secondary) hover:text-(--color-text)">
          {copied ? 'Copied!' : 'Copy URL'}
        </button>
      </div>
    </div>
  );
}
