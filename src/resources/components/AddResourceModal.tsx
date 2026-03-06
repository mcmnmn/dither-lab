import { useState, useCallback, useEffect, useRef } from 'react';
import { useResourcesState, useResourcesDispatch } from '../state/context';
import type { Resource, ResourceType, ColorResource, LogoResource, FontResource, LinkResource, ImageResource } from '../state/types';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const VARIANT_OPTIONS = ['primary', 'mark', 'wordmark', 'mono', 'dark', 'light', 'other'];

export function AddResourceModal() {
  const { addResourceType, editingResourceId, resources, selectedBrandId } = useResourcesState();
  const dispatch = useResourcesDispatch();
  const fileRef = useRef<HTMLInputElement>(null);

  const existing = editingResourceId ? resources.find(r => r.id === editingResourceId) : null;
  const isEdit = !!existing;
  const resourceType = existing?.type ?? addResourceType ?? 'color';

  // Common fields
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');

  // Color fields
  const [colors, setColors] = useState<{ name: string; hex: string }[]>([{ name: '', hex: '#000000' }]);

  // Logo fields
  const [logoFile, setLogoFile] = useState<{ fileName: string; fileType: string; fileData: string } | null>(null);
  const [variant, setVariant] = useState('');

  // Font fields
  const [fontName, setFontName] = useState('');
  const [fontSource, setFontSource] = useState<'google' | 'link'>('google');
  const [fontUrl, setFontUrl] = useState('');
  const [previewText, setPreviewText] = useState('');

  // Link fields
  const [linkLabel, setLinkLabel] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  // Image fields
  const [imageFile, setImageFile] = useState<{ fileName: string; fileData: string } | null>(null);
  const [imageTags, setImageTags] = useState('');

  // Pre-fill on edit
  useEffect(() => {
    if (!existing) return;
    setName(existing.name);
    setNotes(existing.notes ?? '');

    switch (existing.type) {
      case 'color':
        setColors(existing.colors.map(c => ({ name: c.name ?? '', hex: c.hex })));
        break;
      case 'logo':
        setLogoFile({ fileName: existing.fileName, fileType: existing.fileType, fileData: existing.fileData });
        setVariant(existing.variant ?? '');
        break;
      case 'font':
        setFontName(existing.fontName);
        setFontSource(existing.source === 'upload' ? 'google' : existing.source);
        setFontUrl(existing.url ?? '');
        setPreviewText(existing.previewText ?? '');
        break;
      case 'link':
        setLinkLabel(existing.label);
        setLinkUrl(existing.url);
        break;
      case 'image':
        setImageFile({ fileName: existing.fileName, fileData: existing.fileData });
        setImageTags(existing.tags?.join(', ') ?? '');
        break;
    }
  }, [existing]);

  const handleClose = () => {
    dispatch({ type: 'RS_SHOW_ADD_RESOURCE_MODAL', show: false });
  };

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 512000) {
      alert('File too large. Max 500KB.');
      e.target.value = '';
      return;
    }

    const data = await fileToBase64(file);
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';

    if (resourceType === 'logo') {
      const ft = ext === 'svg' ? 'svg' : ext === 'png' ? 'png' : 'jpg';
      setLogoFile({ fileName: file.name, fileType: ft, fileData: data });
    } else {
      setImageFile({ fileName: file.name, fileData: data });
    }
    e.target.value = '';
  }, [resourceType]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim() || !selectedBrandId) return;

      const now = Date.now();
      const base = {
        id: existing?.id ?? crypto.randomUUID(),
        brandId: selectedBrandId,
        name: name.trim(),
        notes: notes.trim() || undefined,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };

      let resource: Resource;

      switch (resourceType) {
        case 'color':
          resource = {
            ...base,
            type: 'color',
            colors: colors.filter(c => c.hex).map(c => ({ name: c.name.trim() || undefined, hex: c.hex })),
          } as ColorResource;
          break;
        case 'logo':
          if (!logoFile) return;
          resource = {
            ...base,
            type: 'logo',
            fileType: logoFile.fileType as 'svg' | 'png' | 'jpg',
            fileName: logoFile.fileName,
            fileData: logoFile.fileData,
            variant: variant || undefined,
          } as LogoResource;
          break;
        case 'font':
          if (!fontName.trim()) return;
          resource = {
            ...base,
            type: 'font',
            fontName: fontName.trim(),
            source: fontSource,
            url: fontUrl.trim() || undefined,
            previewText: previewText.trim() || undefined,
          } as FontResource;
          break;
        case 'link':
          if (!linkUrl.trim()) return;
          resource = {
            ...base,
            type: 'link',
            label: linkLabel.trim() || name.trim(),
            url: linkUrl.trim(),
          } as LinkResource;
          break;
        case 'image':
          if (!imageFile) return;
          resource = {
            ...base,
            type: 'image',
            fileName: imageFile.fileName,
            fileData: imageFile.fileData,
            tags: imageTags.split(',').map(t => t.trim()).filter(Boolean) || undefined,
          } as ImageResource;
          break;
        default:
          return;
      }

      dispatch({ type: isEdit ? 'RS_UPDATE_RESOURCE' : 'RS_ADD_RESOURCE', resource });
    },
    [name, notes, resourceType, colors, logoFile, variant, fontName, fontSource, fontUrl, previewText, linkLabel, linkUrl, imageFile, imageTags, selectedBrandId, existing, isEdit, dispatch],
  );

  const typeLabel: Record<ResourceType, string> = { color: 'Color Palette', logo: 'Logo', font: 'Font', link: 'Link', image: 'Image' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleClose}>
      <div className="max-h-[80vh] w-[440px] overflow-y-auto border-2 border-(--color-border) bg-(--color-bg)" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-(--color-border) px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-(--color-text)">
            {isEdit ? 'Edit' : 'Add'} {typeLabel[resourceType]}
          </span>
          <button onClick={handleClose} className="border border-(--color-border) p-1 text-(--color-text-secondary) hover:text-(--color-text)">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4">
          {/* Common: Name */}
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-(--color-text-secondary)">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Resource name"
              className="w-full border border-(--color-border) bg-(--color-bg) px-2 py-1.5 text-xs text-(--color-text) outline-none placeholder:text-(--color-text-secondary)/50"
              autoFocus
            />
          </div>

          {/* Type-specific fields */}
          {resourceType === 'color' && (
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-wider text-(--color-text-secondary)">Colors</label>
              <div className="flex flex-col gap-1">
                {colors.map((c, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <input
                      type="color"
                      value={c.hex}
                      onChange={e => {
                        const next = [...colors];
                        next[i] = { ...next[i], hex: e.target.value };
                        setColors(next);
                      }}
                      className="h-7 w-7 flex-shrink-0 cursor-pointer border border-(--color-border) bg-transparent p-0"
                    />
                    <input
                      type="text"
                      value={c.hex}
                      onChange={e => {
                        const next = [...colors];
                        next[i] = { ...next[i], hex: e.target.value };
                        setColors(next);
                      }}
                      className="w-20 border border-(--color-border) bg-(--color-bg) px-1.5 py-1 font-mono text-[10px] text-(--color-text) outline-none"
                    />
                    <input
                      type="text"
                      value={c.name}
                      onChange={e => {
                        const next = [...colors];
                        next[i] = { ...next[i], name: e.target.value };
                        setColors(next);
                      }}
                      placeholder="Name (optional)"
                      className="min-w-0 flex-1 border border-(--color-border) bg-(--color-bg) px-1.5 py-1 text-[10px] text-(--color-text) outline-none placeholder:text-(--color-text-secondary)/50"
                    />
                    {colors.length > 1 && (
                      <button type="button" onClick={() => setColors(colors.filter((_, j) => j !== i))} className="p-1 text-(--color-text-secondary) hover:text-red-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setColors([...colors, { name: '', hex: '#000000' }])}
                className="mt-1 border border-(--color-border) px-2 py-0.5 text-[10px] uppercase text-(--color-text-secondary) hover:text-(--color-text)"
              >
                + Add Color
              </button>
            </div>
          )}

          {resourceType === 'logo' && (
            <>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-(--color-text-secondary)">File (SVG, PNG, JPG — max 500KB)</label>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full border border-dashed border-(--color-border) px-3 py-3 text-[10px] text-(--color-text-secondary) hover:bg-(--color-bg-secondary)"
                >
                  {logoFile ? logoFile.fileName : 'Click to upload...'}
                </button>
                <input ref={fileRef} type="file" accept=".svg,.png,.jpg,.jpeg" onChange={handleFileUpload} className="hidden" />
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-(--color-text-secondary)">Variant</label>
                <select
                  value={variant}
                  onChange={e => setVariant(e.target.value)}
                  className="w-full border border-(--color-border) bg-(--color-bg) px-1.5 py-1 text-[10px] uppercase tracking-wider text-(--color-text-secondary) outline-none"
                >
                  <option value="">None</option>
                  {VARIANT_OPTIONS.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {resourceType === 'font' && (
            <>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-(--color-text-secondary)">Source</label>
                <div className="flex gap-1">
                  {(['google', 'link'] as const).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFontSource(s)}
                      className={`border px-2 py-0.5 text-[10px] uppercase tracking-wider transition-colors ${
                        fontSource === s
                          ? 'border-(--color-accent) bg-(--color-accent) text-(--color-accent-text)'
                          : 'border-(--color-border) text-(--color-text-secondary) hover:text-(--color-text)'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-(--color-text-secondary)">
                  Font Family <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={fontName}
                  onChange={e => setFontName(e.target.value)}
                  placeholder="e.g. Plus Jakarta Sans"
                  className="w-full border border-(--color-border) bg-(--color-bg) px-2 py-1.5 text-xs text-(--color-text) outline-none placeholder:text-(--color-text-secondary)/50"
                />
              </div>
              {fontSource === 'link' && (
                <div>
                  <label className="mb-1 block text-[10px] uppercase tracking-wider text-(--color-text-secondary)">URL</label>
                  <input
                    type="url"
                    value={fontUrl}
                    onChange={e => setFontUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full border border-(--color-border) bg-(--color-bg) px-2 py-1.5 text-xs text-(--color-text) outline-none placeholder:text-(--color-text-secondary)/50"
                  />
                </div>
              )}
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-(--color-text-secondary)">Preview Text</label>
                <input
                  type="text"
                  value={previewText}
                  onChange={e => setPreviewText(e.target.value)}
                  placeholder="The quick brown fox..."
                  className="w-full border border-(--color-border) bg-(--color-bg) px-2 py-1.5 text-xs text-(--color-text) outline-none placeholder:text-(--color-text-secondary)/50"
                />
              </div>
            </>
          )}

          {resourceType === 'link' && (
            <>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-(--color-text-secondary)">Label</label>
                <input
                  type="text"
                  value={linkLabel}
                  onChange={e => setLinkLabel(e.target.value)}
                  placeholder="Display text"
                  className="w-full border border-(--color-border) bg-(--color-bg) px-2 py-1.5 text-xs text-(--color-text) outline-none placeholder:text-(--color-text-secondary)/50"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-(--color-text-secondary)">
                  URL <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={e => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-(--color-border) bg-(--color-bg) px-2 py-1.5 text-xs text-(--color-text) outline-none placeholder:text-(--color-text-secondary)/50"
                />
              </div>
            </>
          )}

          {resourceType === 'image' && (
            <>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-(--color-text-secondary)">File (max 500KB)</label>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full border border-dashed border-(--color-border) px-3 py-3 text-[10px] text-(--color-text-secondary) hover:bg-(--color-bg-secondary)"
                >
                  {imageFile ? imageFile.fileName : 'Click to upload...'}
                </button>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-(--color-text-secondary)">Tags</label>
                <input
                  type="text"
                  value={imageTags}
                  onChange={e => setImageTags(e.target.value)}
                  placeholder="e.g. hero, banner, social"
                  className="w-full border border-(--color-border) bg-(--color-bg) px-2 py-1.5 text-xs text-(--color-text) outline-none placeholder:text-(--color-text-secondary)/50"
                />
              </div>
            </>
          )}

          {/* Common: Notes */}
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-(--color-text-secondary)">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Optional notes..."
              rows={2}
              className="w-full resize-none border border-(--color-border) bg-(--color-bg) px-2 py-1.5 text-xs text-(--color-text) outline-none placeholder:text-(--color-text-secondary)/50"
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="mt-1 border border-(--color-accent) bg-(--color-accent) px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-(--color-accent-text) hover:opacity-90 disabled:opacity-40"
          >
            {isEdit ? 'Save Changes' : 'Add Resource'}
          </button>
        </form>
      </div>
    </div>
  );
}
