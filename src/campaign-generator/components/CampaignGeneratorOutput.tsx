import { useCampaignGeneratorState } from '../state/context';
import { CampaignCard } from './CampaignCard';
import { CopyAllButton } from './CopyAllButton';
import { CampaignListView } from './CampaignListView';

export function CampaignGeneratorOutput() {
  const { campaigns, viewMode } = useCampaignGeneratorState();

  if (campaigns.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-(--color-text-secondary)">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <span className="text-xs uppercase tracking-wider">Generate a campaign to get started</span>
        </div>
      </div>
    );
  }

  if (viewMode === 'single') {
    const campaign = campaigns[0];
    const orgName = campaign.sections.find(s => s.id === 'org-name')?.content || 'Campaign';
    const title = campaign.sections.find(s => s.id === 'title')?.content || '';
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex min-w-0 items-baseline gap-2">
            <span className="truncate text-xs font-semibold text-(--color-text)">
              {orgName}
            </span>
            <span className="truncate text-xs text-(--color-text-secondary)">
              {title}
            </span>
          </div>
          <CopyAllButton campaign={campaign} />
        </div>
        <CampaignCard campaign={campaign} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <CampaignListView campaigns={campaigns} />
    </div>
  );
}
