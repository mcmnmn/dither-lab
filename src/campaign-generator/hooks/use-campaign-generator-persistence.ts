import { useEffect, useRef } from 'react';
import { useCampaignGeneratorState, useCampaignGeneratorDispatch } from '../state/context';
import type { CauseType, CampaignType, ToneType, GoalType, AudienceType } from '../state/types';
import { CAUSE_OPTIONS, CAMPAIGN_TYPE_OPTIONS, TONE_OPTIONS, GOAL_OPTIONS, AUDIENCE_OPTIONS } from '../state/defaults';

const STORAGE_KEY = 'campaign-generator-settings';

const VALID_CAUSES = CAUSE_OPTIONS.map(o => o.value);
const VALID_CAMPAIGN_TYPES = CAMPAIGN_TYPE_OPTIONS.map(o => o.value);
const VALID_TONES = TONE_OPTIONS.map(o => o.value);
const VALID_GOALS = GOAL_OPTIONS.map(o => o.value);
const VALID_AUDIENCES = AUDIENCE_OPTIONS.map(o => o.value);

interface PersistedSettings {
  cause: string;
  campaignType: string;
  tone: string;
  goal: string;
  audience: string;
}

export function useCampaignGeneratorPersistence() {
  const state = useCampaignGeneratorState();
  const dispatch = useCampaignGeneratorDispatch();
  const saveSkips = useRef(2);

  // Load on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        saveSkips.current = 0;
        return;
      }

      const parsed: PersistedSettings = JSON.parse(saved);
      const cause = VALID_CAUSES.includes(parsed.cause) ? parsed.cause as CauseType : 'environment';
      const campaignType = VALID_CAMPAIGN_TYPES.includes(parsed.campaignType) ? parsed.campaignType as CampaignType : 'fundraiser';
      const tone = VALID_TONES.includes(parsed.tone) ? parsed.tone as ToneType : 'hopeful';
      const goal = VALID_GOALS.includes(parsed.goal) ? parsed.goal as GoalType : '$10K';
      const audience = VALID_AUDIENCES.includes(parsed.audience) ? parsed.audience as AudienceType : 'general';

      dispatch({ type: 'CG_LOAD_STATE', state: { inputs: { cause, campaignType, tone, goal, audience } } });
    } catch {
      saveSkips.current = 0;
    }
  }, [dispatch]);

  // Save on change
  useEffect(() => {
    if (saveSkips.current > 0) {
      saveSkips.current--;
      return;
    }

    const settings: PersistedSettings = {
      cause: state.inputs.cause,
      campaignType: state.inputs.campaignType,
      tone: state.inputs.tone,
      goal: state.inputs.goal,
      audience: state.inputs.audience,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [state.inputs.cause, state.inputs.campaignType, state.inputs.tone, state.inputs.goal, state.inputs.audience]);
}
