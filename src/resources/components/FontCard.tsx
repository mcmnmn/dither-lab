import { useState, useCallback, useEffect } from 'react';
import { useResourcesDispatch } from '../state/context';
import { downloadBlob } from '../../utils/image-io';
import type { FontResource } from '../state/types';

export function FontCard({ resource }: { resource: FontResource }) {
  const dispatch = useResourcesDispatch();
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(false);

  // Load font (Google Font via stylesheet, or uploaded font via @font-face)
  useEffect(() => {
    if (!resource.fontName) return;
    const id = `font-${resource.id}`;
    if (document.getElementById(id)) {
      setFontLoaded(true);
      return;
    }

    if (resource.source === 'google') {
      const url = resource.url ?? `https://fonts.googleapis.com/css2?family=${encodeURIComponent(resource.fontName)}:wght@400;700&display=swap`;
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = url;
      link.onload = () => setFontLoaded(true);
      document.head.appendChild(link);
    } else if (resource.source === 'upload' && resource.fileData) {
      const fmt = resource.fileType === 'woff2' ? 'woff2' : resource.fileType === 'woff' ? 'woff' : resource.fileType === 'otf' ? 'opentype' : 'truetype';
      const mime = resource.fileType === 'woff2' ? 'font/woff2' : resource.fileType === 'woff' ? 'font/woff' : resource.fileType === 'otf' ? 'font/otf' : 'font/ttf';
      const style = document.createElement('style');
      style.id = id;
      style.textContent = `@font-face { font-family: '${resource.fontName}'; src: url('data:${mime};base64,${resource.fileData}') format('${fmt}'); }`;
      document.head.appendChild(style);
      setFontLoaded(true);
    }

    return () => { document.getElementById(id)?.remove(); };
  }, [resource.source, resource.fontName, resource.url, resource.fileData, resource.fileType, resource.id]);

  const cssImport = resource.source === 'google'
    ? `@import url('${resource.url ?? `https://fonts.googleapis.com/css2?family=${encodeURIComponent(resource.fontName)}:wght@400;700&display=swap`}');`
    : resource.url ?? '';

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(cssImport);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [cssImport]);

  const handleDownload = useCallback(() => {
    if (!resource.fileData) return;
    const binary = atob(resource.fileData);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const ext = resource.fileType ?? 'ttf';
    const mime = ext === 'woff2' ? 'font/woff2' : ext === 'woff' ? 'font/woff' : ext === 'otf' ? 'font/otf' : 'font/ttf';
    downloadBlob(new Blob([bytes], { type: mime }), `${resource.fontName}.${ext}`);
  }, [resource]);

  const handleDelete = useCallback(() => {
    if (confirmDelete) {
      dispatch({ type: 'RS_DELETE_RESOURCE', resourceId: resource.id });
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  }, [confirmDelete, dispatch, resource.id]);

  const previewText = resource.previewText || 'The quick brown fox jumps over the lazy dog.';

  return (
    <div className="border border-(--color-border) bg-(--color-bg)">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-(--color-border) px-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-(--color-text-secondary) truncate">{resource.name}</span>
          <span className="flex-shrink-0 bg-(--color-bg-tertiary) px-1.5 py-0.5 text-[9px] uppercase text-(--color-text-secondary)">
            {resource.source}
          </span>
        </div>
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

      {/* Preview */}
      <div className="p-4">
        <p
          className="text-lg text-(--color-text)"
          style={{ fontFamily: fontLoaded ? `'${resource.fontName}', sans-serif` : 'sans-serif' }}
        >
          {previewText}
        </p>
        <p
          className="mt-1 text-sm font-bold text-(--color-text)"
          style={{ fontFamily: fontLoaded ? `'${resource.fontName}', sans-serif` : 'sans-serif' }}
        >
          ABCDEFGHIJKLM 0123456789
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-1 border-t border-(--color-border) p-2">
        {resource.fileData && (
          <button onClick={handleDownload} className="flex-1 border border-(--color-border) py-1 text-[10px] uppercase tracking-wider text-(--color-text-secondary) hover:bg-(--color-bg-secondary) hover:text-(--color-text)">
            Download
          </button>
        )}
        {cssImport && (
          <button onClick={handleCopy} className="flex-1 border border-(--color-border) py-1 text-[10px] uppercase tracking-wider text-(--color-text-secondary) hover:bg-(--color-bg-secondary) hover:text-(--color-text)">
            {copied ? 'Copied!' : 'Copy CSS Import'}
          </button>
        )}
      </div>
    </div>
  );
}
