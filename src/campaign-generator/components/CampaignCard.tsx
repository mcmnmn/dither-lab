import { useCallback } from 'react';
import { SectionCard } from './SectionCard';
import { useCampaignGeneratorDispatch } from '../state/context';
import { regenerateSection } from '../engine/generator';
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

  return (
    <div className="flex flex-col gap-4">
      {campaign.sections.map(section => (
        <SectionCard key={section.id} section={section} onRegenerate={handleRegenerate} />
      ))}
    </div>
  );
}
