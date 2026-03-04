import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
import { grainReducer, grainInitialState } from './grain-reducer';
import type { GrainState, GrainAction } from './types';

const GrainStateContext = createContext<GrainState>(grainInitialState);
const GrainDispatchContext = createContext<Dispatch<GrainAction>>(() => {});

export function GrainProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(grainReducer, grainInitialState);

  return (
    <GrainStateContext.Provider value={state}>
      <GrainDispatchContext.Provider value={dispatch}>
        {children}
      </GrainDispatchContext.Provider>
    </GrainStateContext.Provider>
  );
}

export function useGrainState() {
  return useContext(GrainStateContext);
}

export function useGrainDispatch() {
  return useContext(GrainDispatchContext);
}
