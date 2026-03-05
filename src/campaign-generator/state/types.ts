export type CauseType = 'environment' | 'education' | 'health' | 'hunger' | 'housing' | 'animals' | 'arts' | 'disaster-relief';
export type CampaignType = 'fundraiser' | 'awareness' | 'event' | 'peer-to-peer' | 'matching-gift' | 'recurring';
export type ToneType = 'urgent' | 'hopeful' | 'professional' | 'emotional' | 'community';
export type GoalType = '$1K' | '$5K' | '$10K' | '$25K' | '$50K' | '$100K';
export type AudienceType = 'general' | 'millennials' | 'corporate' | 'local-community' | 'high-net-worth';

export interface CampaignSection {
  id: string;
  label: string;
  content: string;
}

export interface CampaignInputs {
  cause: CauseType;
  campaignType: CampaignType;
  tone: ToneType;
  goal: GoalType;
  audience: AudienceType;
}

export interface Campaign {
  id: string;
  sections: CampaignSection[];
  inputs: CampaignInputs;
}

export interface CampaignGeneratorState {
  inputs: CampaignInputs;
  campaigns: Campaign[];
  viewMode: 'single' | 'list';
  generating: boolean;
}

export type CampaignGeneratorAction =
  | { type: 'CG_SET_INPUT'; key: keyof CampaignInputs; value: string }
  | { type: 'CG_SET_CAMPAIGNS'; campaigns: Campaign[]; viewMode: 'single' | 'list' }
  | { type: 'CG_UPDATE_CAMPAIGN'; campaignId: string; campaign: Campaign }
  | { type: 'CG_SET_GENERATING'; generating: boolean }
  | { type: 'CG_LOAD_STATE'; state: Partial<CampaignGeneratorState> };
