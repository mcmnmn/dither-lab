import { campaignGeneratorInitialState } from './defaults';
import type { CampaignGeneratorState, CampaignGeneratorAction } from './types';

export { campaignGeneratorInitialState };

export function campaignGeneratorReducer(
  state: CampaignGeneratorState,
  action: CampaignGeneratorAction,
): CampaignGeneratorState {
  switch (action.type) {
    case 'CG_SET_INPUT':
      return { ...state, inputs: { ...state.inputs, [action.key]: action.value } };

    case 'CG_SET_CAMPAIGNS':
      return { ...state, campaigns: action.campaigns, viewMode: action.viewMode, generating: false };

    case 'CG_UPDATE_CAMPAIGN':
      return {
        ...state,
        campaigns: state.campaigns.map(c => c.id === action.campaignId ? action.campaign : c),
      };

    case 'CG_SET_GENERATING':
      return { ...state, generating: action.generating };

    case 'CG_REGENERATE_IMAGE':
      return {
        ...state,
        campaigns: state.campaigns.map(c =>
          c.id === action.campaignId ? { ...c, imageUrl: action.imageUrl } : c,
        ),
      };

    case 'CG_LOAD_STATE':
      return { ...state, ...action.state };

    default:
      return state;
  }
}
