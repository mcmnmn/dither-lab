import { useState, useCallback, useMemo } from 'react';
import { useResourcesDispatch } from '../state/context';
import { downloadBlob } from '../../utils/image-io';
import type { ImageResource } from '../state/types';

export function ImageCard({ resource }: { resource: ImageResource }) {
  const dispatch = useResourcesDispatch();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const dataUrl = useMemo(() => {
    const ext = resource.fileName.split('.').pop()?.toLowerCase() ?? 'png';
    const mime = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'gif' ? 'image/gif' : ext === 'webp' ? 'image/webp' : 'image/png';
    return `data:${mime};base64,${resource.fileData}`;
  }, [resource.fileData, resource.fileName]);

  const handleDownload = useCallback(() => {
    const binary = atob(resource.fileData);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    downloadBlob(new Blob([bytes]), resource.fileName);
  }, [resource]);

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

      {/* Preview */}
      <div className="flex items-center justify-center bg-(--color-bg-secondary) p-2">
        <img src={dataUrl} alt={resource.name} className="max-h-32 max-w-full object-contain" />
      </div>

      {/* Tags */}
      {resource.tags && resource.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 border-t border-(--color-border) px-3 py-2">
          {resource.tags.map(tag => (
            <span key={tag} className="bg-(--color-bg-tertiary) px-1.5 py-0.5 text-[10px] text-(--color-text-secondary)">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="border-t border-(--color-border) p-2">
        <button onClick={handleDownload} className="w-full border border-(--color-border) py-1 text-[10px] uppercase tracking-wider text-(--color-text-secondary) hover:bg-(--color-bg-secondary) hover:text-(--color-text)">
          Download
        </button>
      </div>
    </div>
  );
}
