import { useCallback, useRef } from 'react';
import { useResourcesState, useResourcesDispatch } from '../state/context';
import { RESOURCE_TYPE_OPTIONS } from '../state/defaults';
import type { ResourceType } from '../state/types';
import { downloadBlob } from '../../utils/image-io';

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function ResourcesSidebar() {
  const state = useResourcesState();
  const dispatch = useResourcesDispatch();
  const importRef = useRef<HTMLInputElement>(null);

  const handleOutput = useCallback(() => {
    const data = JSON.stringify({ brands: state.brands, resources: state.resources }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    downloadBlob(blob, `brand-resources-${Date.now()}.json`);
  }, [state.brands, state.resources]);

  const handleImport = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed.brands) && Array.isArray(parsed.resources)) {
          dispatch({ type: 'RS_IMPORT_DATA', brands: parsed.brands, resources: parsed.resources, mode: 'merge' });
        }
      } catch {
        // invalid JSON — ignore
      }
      e.target.value = '';
    },
    [dispatch],
  );

  const brandResourceCounts = new Map<string, number>();
  for (const r of state.resources) {
    brandResourceCounts.set(r.brandId, (brandResourceCounts.get(r.brandId) ?? 0) + 1);
  }

  return (
    <aside className="flex w-[280px] flex-shrink-0 flex-col gap-4 overflow-y-auto border-r border-(--color-border) bg-(--color-bg-secondary) p-4">
      {/* Search */}
      <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-2 top-1/2 -translate-y-1/2 text-(--color-text-secondary)">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={state.searchQuery}
          onChange={e => dispatch({ type: 'RS_SET_SEARCH', query: e.target.value })}
          placeholder="Search resources..."
          className="w-full border border-(--color-border) bg-(--color-bg) py-1.5 pl-7 pr-2 text-xs text-(--color-text) outline-none placeholder:text-(--color-text-secondary)/50"
        />
      </div>

      {/* Filter */}
      <fieldset className="retro-section">
        <legend className="retro-section-label">Filter</legend>
        <div className="flex flex-wrap gap-1">
          {RESOURCE_TYPE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => dispatch({ type: 'RS_SET_FILTER', filterType: opt.value as ResourceType | 'all' })}
              className={`border px-2 py-0.5 text-[10px] uppercase tracking-wider transition-colors ${
                state.filterType === opt.value
                  ? 'border-(--color-accent) bg-(--color-accent) text-(--color-accent-text)'
                  : 'border-(--color-border) text-(--color-text-secondary) hover:text-(--color-text)'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Brands */}
      <fieldset className="retro-section">
        <legend className="retro-section-label">Brands</legend>
        <div className="flex flex-col gap-1">
          {state.brands.map(brand => (
            <button
              key={brand.id}
              onClick={() => dispatch({ type: 'RS_SET_SELECTED_BRAND', brandId: brand.id })}
              className={`flex items-center justify-between border px-2 py-1.5 text-left transition-colors ${
                state.selectedBrandId === brand.id
                  ? 'border-(--color-accent) bg-(--color-accent)/10 text-(--color-text)'
                  : 'border-transparent text-(--color-text-secondary) hover:bg-(--color-bg-tertiary) hover:text-(--color-text)'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium">{brand.name}</div>
                <div className="text-[10px] opacity-60">{timeAgo(brand.updatedAt)}</div>
              </div>
              <span className="ml-2 flex-shrink-0 text-[10px] opacity-50">
                {brandResourceCounts.get(brand.id) ?? 0}
              </span>
            </button>
          ))}
          {state.brands.length === 0 && (
            <p className="py-2 text-center text-[10px] text-(--color-text-secondary)">No brands yet</p>
          )}
        </div>
        <button
          onClick={() => dispatch({ type: 'RS_SHOW_ADD_BRAND_MODAL', show: true })}
          className="mt-2 w-full border border-(--color-accent) bg-(--color-accent) px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-(--color-accent-text) hover:opacity-90"
        >
          + New Brand
        </button>
      </fieldset>

      {/* Import / Output */}
      <fieldset className="retro-section">
        <legend className="retro-section-label">Library</legend>
        <div className="flex gap-2">
          <button
            onClick={() => importRef.current?.click()}
            className="flex-1 border border-(--color-border) px-2 py-1.5 text-[10px] uppercase tracking-wider text-(--color-text-secondary) hover:bg-(--color-bg-tertiary) hover:text-(--color-text)"
          >
            Import
          </button>
          <button
            onClick={handleOutput}
            className="flex-1 border border-(--color-border) px-2 py-1.5 text-[10px] uppercase tracking-wider text-(--color-text-secondary) hover:bg-(--color-bg-tertiary) hover:text-(--color-text)"
          >
            Output
          </button>
        </div>
        <input ref={importRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
      </fieldset>
    </aside>
  );
}
