import { useCallback } from 'react';
import { useCampaignGeneratorState, useCampaignGeneratorDispatch } from '../../state/context';
import { generateCampaign, generateCampaigns } from '../../engine/generator';

export function ActionsPanel() {
  const { inputs, generating } = useCampaignGeneratorState();
  const dispatch = useCampaignGeneratorDispatch();

  const handleGenerate = useCallback(() => {
    dispatch({ type: 'CG_SET_GENERATING', generating: true });
    const campaign = generateCampaign(inputs);
    dispatch({ type: 'CG_SET_CAMPAIGNS', campaigns: [campaign], viewMode: 'single' });
  }, [inputs, dispatch]);

  const handleGenerate3 = useCallback(() => {
    dispatch({ type: 'CG_SET_GENERATING', generating: true });
    const campaigns = generateCampaigns(inputs, 3);
    dispatch({ type: 'CG_SET_CAMPAIGNS', campaigns, viewMode: 'list' });
  }, [inputs, dispatch]);

  const handleGenerate10 = useCallback(() => {
    dispatch({ type: 'CG_SET_GENERATING', generating: true });
    const campaigns = generateCampaigns(inputs, 10);
    dispatch({ type: 'CG_SET_CAMPAIGNS', campaigns, viewMode: 'list' });
  }, [inputs, dispatch]);

  return (
    <fieldset className="retro-section">
      <legend className="retro-section-label">Generate</legend>
      <div className="flex flex-col gap-2">
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full border border-(--color-border) bg-(--color-bg) px-3 py-1.5 text-xs uppercase tracking-wider text-(--color-text) hover:bg-(--color-bg-secondary) disabled:opacity-50"
        >
          Generate Campaign
        </button>
        <button
          onClick={handleGenerate3}
          disabled={generating}
          className="w-full border border-(--color-border) bg-(--color-bg) px-3 py-1.5 text-xs uppercase tracking-wider text-(--color-text) hover:bg-(--color-bg-secondary) disabled:opacity-50"
        >
          Generate 3 Variations
        </button>
        <button
          onClick={handleGenerate10}
          disabled={generating}
          className="w-full border border-(--color-border) bg-(--color-bg) px-3 py-1.5 text-xs uppercase tracking-wider text-(--color-text) hover:bg-(--color-bg-secondary) disabled:opacity-50"
        >
          Generate 10 Campaigns
        </button>
      </div>
    </fieldset>
  );
}
