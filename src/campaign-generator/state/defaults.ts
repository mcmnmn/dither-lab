import type { CampaignGeneratorState } from './types';

export const campaignGeneratorInitialState: CampaignGeneratorState = {
  inputs: {
    cause: 'environment',
    campaignType: 'fundraiser',
    tone: 'hopeful',
    goal: '$10K',
    audience: 'general',
  },
  campaigns: [],
  viewMode: 'single',
  generating: false,
};

export const CAUSE_OPTIONS = [
  { value: 'environment', label: 'Environment' },
  { value: 'education', label: 'Education' },
  { value: 'health', label: 'Health' },
  { value: 'hunger', label: 'Hunger' },
  { value: 'housing', label: 'Housing' },
  { value: 'animals', label: 'Animals' },
  { value: 'arts', label: 'Arts & Culture' },
  { value: 'disaster-relief', label: 'Disaster Relief' },
];

export const CAMPAIGN_TYPE_OPTIONS = [
  { value: 'fundraiser', label: 'Fundraiser' },
  { value: 'awareness', label: 'Awareness' },
  { value: 'event', label: 'Event' },
  { value: 'peer-to-peer', label: 'Peer-to-Peer' },
  { value: 'matching-gift', label: 'Matching Gift' },
  { value: 'recurring', label: 'Recurring' },
];

export const TONE_OPTIONS = [
  { value: 'urgent', label: 'Urgent' },
  { value: 'hopeful', label: 'Hopeful' },
  { value: 'professional', label: 'Professional' },
  { value: 'emotional', label: 'Emotional' },
  { value: 'community', label: 'Community' },
];

export const GOAL_OPTIONS = [
  { value: '$1K', label: '$1,000' },
  { value: '$5K', label: '$5,000' },
  { value: '$10K', label: '$10,000' },
  { value: '$25K', label: '$25,000' },
  { value: '$50K', label: '$50,000' },
  { value: '$100K', label: '$100,000' },
];

export const AUDIENCE_OPTIONS = [
  { value: 'general', label: 'General Public' },
  { value: 'millennials', label: 'Millennials' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'local-community', label: 'Local Community' },
  { value: 'high-net-worth', label: 'High Net Worth' },
];
