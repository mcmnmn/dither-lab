import { useCallback } from 'react';
import { GrainDropdown } from '../../../grain/components/common/GrainDropdown';
import { useCampaignGeneratorState, useCampaignGeneratorDispatch } from '../../state/context';
import { CAUSE_OPTIONS, CAMPAIGN_TYPE_OPTIONS, TONE_OPTIONS, GOAL_OPTIONS, AUDIENCE_OPTIONS } from '../../state/defaults';
import type { CampaignInputs } from '../../state/types';

export function InputsPanel() {
  const { inputs } = useCampaignGeneratorState();
  const dispatch = useCampaignGeneratorDispatch();

  const handleChange = useCallback((key: keyof CampaignInputs) => (value: string) => {
    dispatch({ type: 'CG_SET_INPUT', key, value });
  }, [dispatch]);

  return (
    <fieldset className="retro-section">
      <legend className="retro-section-label">Campaign Inputs</legend>
      <div className="flex flex-col gap-2">
        <GrainDropdown label="Cause" value={inputs.cause} options={CAUSE_OPTIONS} onChange={handleChange('cause')} labelWidth="w-16" />
        <GrainDropdown label="Type" value={inputs.campaignType} options={CAMPAIGN_TYPE_OPTIONS} onChange={handleChange('campaignType')} labelWidth="w-16" />
        <GrainDropdown label="Tone" value={inputs.tone} options={TONE_OPTIONS} onChange={handleChange('tone')} labelWidth="w-16" />
        <GrainDropdown label="Goal" value={inputs.goal} options={GOAL_OPTIONS} onChange={handleChange('goal')} labelWidth="w-16" />
        <GrainDropdown label="Audience" value={inputs.audience} options={AUDIENCE_OPTIONS} onChange={handleChange('audience')} labelWidth="w-16" />
      </div>
    </fieldset>
  );
}
