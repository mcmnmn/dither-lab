import { useState, useCallback, useMemo } from 'react';
import { useResourcesDispatch } from '../state/context';
import { downloadBlob } from '../../utils/image-io';
import type { LogoResource } from '../state/types';

export function LogoCard({ resource }: { resource: LogoResource }) {
  const dispatch = useResourcesDispatch();
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const decodedSvg = useMemo(() => {
    if (resource.fileType !== 'svg') return null;
    try {
      return atob(resource.fileData);
    } catch {
      return null;
    }
  }, [resource.fileData, resource.fileType]);

  const dataUrl = useMemo(() => {
    const mime = resource.fileType === 'svg' ? 'image/svg+xml' : resource.fileType === 'png' ? 'image/png' : 'image/jpeg';
    return `data:${mime};base64,${resource.fileData}`;
  }, [resource.fileData, resource.fileType]);

  // For SVGs with drop shadow filters, crop the viewBox to remove excess padding
  const displayUrl = useMemo(() => {
    if (!decodedSvg || !decodedSvg.includes('<filter')) return dataUrl;
    const vbMatch = decodedSvg.match(/viewBox="([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)"/);
    if (!vbMatch) return dataUrl;
    const [, vbX, vbY, vbW, vbH] = vbMatch.map(Number);
    // Find the gaussian blur stdDeviation to determine padding amount
    const blurMatch = decodedSvg.match(/stdDeviation="([\d.]+)"/);
    const blur = blurMatch ? parseFloat(blurMatch[1]) : 15;
    // Crop to content: remove filter padding while preserving full width for text
    const padTop = blur;
    const padBot = blur * 1.8;
    const padL = blur * 0.5;
    const cropped = decodedSvg.replace(
      /viewBox="[\d.]+ [\d.]+ [\d.]+ [\d.]+"/,
      `viewBox="${vbX + padL} ${vbY + padTop} ${vbW - padL} ${vbH - padTop - padBot}"`
    );
    return `data:image/svg+xml;base64,${btoa(cropped)}`;
  }, [decodedSvg, dataUrl]);

  const handleDownload = useCallback(() => {
    const binary = atob(resource.fileData);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const mime = resource.fileType === 'svg' ? 'image/svg+xml' : resource.fileType === 'png' ? 'image/png' : 'image/jpeg';
    downloadBlob(new Blob([bytes], { type: mime }), resource.fileName);
  }, [resource]);

  const handleCopySvg = useCallback(async () => {
    if (!decodedSvg) return;
    await navigator.clipboard.writeText(decodedSvg);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [decodedSvg]);

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
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-(--color-text-secondary) truncate">{resource.name}</span>
          {resource.variant && (
            <span className="flex-shrink-0 bg-(--color-bg-tertiary) px-1.5 py-0.5 text-[9px] uppercase text-(--color-text-secondary)">
              {resource.variant}
            </span>
          )}
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
      <div className="flex h-32 items-center justify-center bg-(--color-bg-secondary) p-3 overflow-hidden">
        <img src={displayUrl} alt={resource.name} className="max-h-full max-w-full object-contain" />
      </div>

      {/* Actions */}
      <div className="flex gap-1 border-t border-(--color-border) p-2">
        <button onClick={handleDownload} className="flex-1 border border-(--color-border) py-1 text-[10px] uppercase tracking-wider text-(--color-text-secondary) hover:bg-(--color-bg-secondary) hover:text-(--color-text)">
          Download
        </button>
        {decodedSvg && (
          <button onClick={handleCopySvg} className="flex-1 border border-(--color-border) py-1 text-[10px] uppercase tracking-wider text-(--color-text-secondary) hover:bg-(--color-bg-secondary) hover:text-(--color-text)">
            {copied ? 'Copied!' : 'Copy SVG'}
          </button>
        )}
      </div>
    </div>
  );
}
