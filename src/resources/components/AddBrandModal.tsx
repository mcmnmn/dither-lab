import { useState, useCallback, useEffect } from 'react';
import { useResourcesState, useResourcesDispatch } from '../state/context';

export function AddBrandModal() {
  const { editingBrandId, brands } = useResourcesState();
  const dispatch = useResourcesDispatch();

  const existing = editingBrandId ? brands.find(b => b.id === editingBrandId) : null;
  const isEdit = !!existing;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setDescription(existing.description ?? '');
      setTagsInput(existing.tags?.join(', ') ?? '');
    }
  }, [existing]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) return;

      const tags = tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
      const now = Date.now();

      if (isEdit && existing) {
        dispatch({
          type: 'RS_UPDATE_BRAND',
          brand: { ...existing, name: name.trim(), description: description.trim() || undefined, tags: tags.length ? tags : undefined, updatedAt: now },
        });
      } else {
        dispatch({
          type: 'RS_ADD_BRAND',
          brand: {
            id: crypto.randomUUID(),
            name: name.trim(),
            description: description.trim() || undefined,
            tags: tags.length ? tags : undefined,
            createdAt: now,
            updatedAt: now,
          },
        });
      }
    },
    [name, description, tagsInput, isEdit, existing, dispatch],
  );

  const handleClose = () => {
    dispatch({ type: 'RS_SHOW_ADD_BRAND_MODAL', show: false });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleClose}>
      <div className="w-[400px] border-2 border-(--color-border) bg-(--color-bg)" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-(--color-border) px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-(--color-text)">
            {isEdit ? 'Edit Brand' : 'New Brand'}
          </span>
          <button onClick={handleClose} className="border border-(--color-border) p-1 text-(--color-text-secondary) hover:text-(--color-text)">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4">
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-(--color-text-secondary)">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Brand name"
              className="w-full border border-(--color-border) bg-(--color-bg) px-2 py-1.5 text-xs text-(--color-text) outline-none placeholder:text-(--color-text-secondary)/50"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-(--color-text-secondary)">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description..."
              rows={2}
              className="w-full resize-none border border-(--color-border) bg-(--color-bg) px-2 py-1.5 text-xs text-(--color-text) outline-none placeholder:text-(--color-text-secondary)/50"
            />
          </div>

          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-(--color-text-secondary)">Tags</label>
            <input
              type="text"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="e.g. primary, brand, campaign"
              className="w-full border border-(--color-border) bg-(--color-bg) px-2 py-1.5 text-xs text-(--color-text) outline-none placeholder:text-(--color-text-secondary)/50"
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="mt-1 border border-(--color-accent) bg-(--color-accent) px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-(--color-accent-text) hover:opacity-90 disabled:opacity-40"
          >
            {isEdit ? 'Save Changes' : 'Create Brand'}
          </button>
        </form>
      </div>
    </div>
  );
}
