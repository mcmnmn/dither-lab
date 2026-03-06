import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
import { graphReducer } from './reducer';
import { graphInitialState } from './defaults';
import type { GraphState, GraphAction } from './types';

const GMStateContext = createContext<GraphState>(graphInitialState);
const GMDispatchContext = createContext<Dispatch<GraphAction>>(() => {});

export function GraphMakerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(graphReducer, graphInitialState);

  return (
    <GMStateContext.Provider value={state}>
      <GMDispatchContext.Provider value={dispatch}>
        {children}
      </GMDispatchContext.Provider>
    </GMStateContext.Provider>
  );
}

export function useGraphState() {
  return useContext(GMStateContext);
}

export function useGraphDispatch() {
  return useContext(GMDispatchContext);
}
