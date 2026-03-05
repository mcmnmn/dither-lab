import { useState, useCallback } from 'react';
import { CampaignCard } from './CampaignCard';
import { CopyAllButton } from './CopyAllButton';
import type { Campaign } from '../state/types';

interface CampaignListViewProps {
  campaigns: Campaign[];
}

export function CampaignListView({ campaigns }: CampaignListViewProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    // First campaign expanded by default
    return new Set(campaigns.length > 0 ? [campaigns[0].id] : []);
  });

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {campaigns.map((campaign, index) => {
        const isExpanded = expandedIds.has(campaign.id);
        const orgName = campaign.sections.find(s => s.id === 'org-name')?.content || 'Campaign';
        const title = campaign.sections.find(s => s.id === 'title')?.content || '';

        return (
          <div key={campaign.id} className="border border-(--color-border) bg-(--color-bg-secondary)">
            <div className="flex items-center gap-3 px-3 py-2">
              <button
                onClick={() => toggleExpanded(campaign.id)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left hover:opacity-80"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`flex-shrink-0 text-(--color-text-secondary) transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                <div className="flex min-w-0 flex-1 items-baseline gap-2">
                  <span className="font-mono text-[10px] text-(--color-text-secondary)">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="truncate text-xs font-semibold text-(--color-text)">
                    {orgName}
                  </span>
                  <span className="truncate text-xs text-(--color-text-secondary)">
                    {title}
                  </span>
                </div>
              </button>
              <CopyAllButton campaign={campaign} />
            </div>
            {isExpanded && (
              <div className="border-t border-(--color-border) p-4">
                <CampaignCard campaign={campaign} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
