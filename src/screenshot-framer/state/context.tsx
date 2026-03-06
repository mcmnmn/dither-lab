import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';
import { sfReducer } from './reducer';
import { sfInitialState } from './defaults';
import type { SFState, SFAction } from './types';

const StateContext = createContext<SFState>(sfInitialState);
const DispatchContext = createContext<Dispatch<SFAction>>(() => {});

export function ScreenshotFramerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(sfReducer, sfInitialState);
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

export function useSFState() {
  return useContext(StateContext);
}

export function useSFDispatch() {
  return useContext(DispatchContext);
}
