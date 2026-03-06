import { useState, useCallback, useMemo } from 'react';
import { useResourcesState, useResourcesDispatch } from '../state/context';
import { ColorPaletteCard } from './ColorPaletteCard';
import { LogoCard } from './LogoCard';
import { FontCard } from './FontCard';
import { LinkCard } from './LinkCard';
import { ImageCard } from './ImageCard';
import type { ResourceType, Resource } from '../state/types';

const TYPE_ORDER: ResourceType[] = ['color', 'logo', 'font', 'link', 'image'];
const TYPE_LABELS: Record<ResourceType, string> = {
  color: 'Colors',
  logo: 'Logos',
  font: 'Fonts',
  link: 'Links',
  image: 'Images',
};

function ResourceCard({ resource }: { resource: Resource }) {
  switch (resource.type) {
    case 'color': return <ColorPaletteCard resource={resource} />;
    case 'logo': return <LogoCard resource={resource} />;
    case 'font': return <FontCard resource={resource} />;
    case 'link': return <LinkCard resource={resource} />;
    case 'image': return <ImageCard resource={resource} />;
  }
}

export function ResourcesContent() {
  const { brands, resources, selectedBrandId, searchQuery, filterType } = useResourcesState();
  const dispatch = useResourcesDispatch();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const brand = brands.find(b => b.id === selectedBrandId);

  const filteredResources = useMemo(() => {
    return resources
      .filter(r => r.brandId === selectedBrandId)
      .filter(r => filterType === 'all' || r.type === filterType)
      .filter(r => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return r.name.toLowerCase().includes(q) || (r.notes?.toLowerCase().includes(q) ?? false);
      });
  }, [resources, selectedBrandId, filterType, searchQuery]);

  const groupedResources = useMemo(() => {
    const map = new Map<ResourceType, Resource[]>();
    for (const r of filteredResources) {
      const arr = map.get(r.type) ?? [];
      arr.push(r);
      map.set(r.type, arr);
    }
    return map;
  }, [filteredResources]);

  const handleDeleteBrand = useCallback(() => {
    if (!selectedBrandId) return;
    if (confirmDelete === selectedBrandId) {
      dispatch({ type: 'RS_DELETE_BRAND', brandId: selectedBrandId });
      setConfirmDelete(null);
    } else {
      setConfirmDelete(selectedBrandId);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  }, [selectedBrandId, confirmDelete, dispatch]);

  if (!brand) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-(--color-text-secondary)/30">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
        <p className="text-xs uppercase tracking-wider text-(--color-text-secondary)">
          Select a brand or create a new one
        </p>
      </div>
    );
  }

  const visibleTypes = filterType === 'all' ? TYPE_ORDER : [filterType];

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Brand header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-(--color-text)">{brand.name}</h2>
          {brand.description && (
            <p className="mt-1 text-xs text-(--color-text-secondary)">{brand.description}</p>
          )}
          {brand.tags && brand.tags.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {brand.tags.map(tag => (
                <span key={tag} className="bg-(--color-bg-tertiary) px-1.5 py-0.5 text-[10px] text-(--color-text-secondary)">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => dispatch({ type: 'RS_SET_EDITING_BRAND', brandId: brand.id })}
            className="border border-(--color-border) p-1.5 text-(--color-text-secondary) hover:bg-(--color-bg-tertiary) hover:text-(--color-text)"
            title="Edit brand"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            onClick={handleDeleteBrand}
            className={`border p-1.5 transition-colors ${
              confirmDelete === brand.id
                ? 'border-red-500 bg-red-500 text-white'
                : 'border-(--color-border) text-(--color-text-secondary) hover:border-red-400 hover:text-red-400'
            }`}
            title="Delete brand"
          >
            {confirmDelete === brand.id ? (
              <span className="text-[10px] font-semibold uppercase">Sure?</span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Resource sections */}
      {visibleTypes.map(type => {
        const items = groupedResources.get(type) ?? [];
        return (
          <section key={type}>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-(--color-text-secondary)">
                {TYPE_LABELS[type]}
                {items.length > 0 && <span className="ml-1 opacity-50">({items.length})</span>}
              </h3>
              <button
                onClick={() => dispatch({ type: 'RS_SHOW_ADD_RESOURCE_MODAL', show: true, resourceType: type })}
                className="border border-(--color-border) px-2 py-0.5 text-[10px] uppercase tracking-wider text-(--color-text-secondary) hover:bg-(--color-bg-tertiary) hover:text-(--color-text)"
              >
                + Add
              </button>
            </div>
            {items.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {items.map(r => (
                  <ResourceCard key={r.id} resource={r} />
                ))}
              </div>
            ) : (
              <p className="py-3 text-center text-[10px] text-(--color-text-secondary)/50">
                No {TYPE_LABELS[type].toLowerCase()} yet
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
}
