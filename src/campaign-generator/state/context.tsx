import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
import { campaignGeneratorReducer, campaignGeneratorInitialState } from './reducer';
import type { CampaignGeneratorState, CampaignGeneratorAction } from './types';

const CGStateContext = createContext<CampaignGeneratorState>(campaignGeneratorInitialState);
const CGDispatchContext = createContext<Dispatch<CampaignGeneratorAction>>(() => {});

export function CampaignGeneratorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(campaignGeneratorReducer, campaignGeneratorInitialState);

  return (
    <CGStateContext.Provider value={state}>
      <CGDispatchContext.Provider value={dispatch}>
        {children}
      </CGDispatchContext.Provider>
    </CGStateContext.Provider>
  );
}

export function useCampaignGeneratorState() {
  return useContext(CGStateContext);
}

export function useCampaignGeneratorDispatch() {
  return useContext(CGDispatchContext);
}
