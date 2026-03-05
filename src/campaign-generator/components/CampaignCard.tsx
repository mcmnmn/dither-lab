import { useCallback } from 'react';
import { SectionCard } from './SectionCard';
import { useCampaignGeneratorDispatch } from '../state/context';
import { regenerateSection, generateImageUrl } from '../engine/generator';
import type { Campaign } from '../state/types';

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const dispatch = useCampaignGeneratorDispatch();

  const handleRegenerate = useCallback((sectionId: string) => {
    const updated = regenerateSection(campaign, sectionId);
    dispatch({ type: 'CG_UPDATE_CAMPAIGN', campaignId: campaign.id, campaign: updated });
  }, [campaign, dispatch]);

  const handleRegenerateImage = useCallback(() => {
    const imageUrl = generateImageUrl(campaign.inputs.cause);
    dispatch({ type: 'CG_REGENERATE_IMAGE', campaignId: campaign.id, imageUrl });
  }, [campaign.id, campaign.inputs.cause, dispatch]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[2/1] w-full overflow-hidden border border-(--color-border) bg-(--color-bg-secondary)">
        <img
          src={campaign.imageUrl}
          alt="Campaign hero"
          className="h-full w-full object-cover"
        />
        <button
          onClick={handleRegenerateImage}
          className="absolute bottom-2 right-2 border border-(--color-border) bg-(--color-bg) p-1 text-(--color-text-secondary) hover:text-(--color-text)"
          title="New image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>
      </div>
      {campaign.sections.map(section => (
        <SectionCard key={section.id} section={section} onRegenerate={handleRegenerate} />
      ))}
    </div>
  );
}
