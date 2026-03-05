import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';
import { meshGradientReducer, meshGradientInitialState } from './reducer';
import type { MeshGradientState, MeshGradientAction } from './types';

const StateContext = createContext<MeshGradientState>(meshGradientInitialState);
const DispatchContext = createContext<Dispatch<MeshGradientAction>>(() => {});

export function MeshGradientProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(meshGradientReducer, meshGradientInitialState);
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

export function useMeshGradientState() {
  return useContext(StateContext);
}

export function useMeshGradientDispatch() {
  return useContext(DispatchContext);
}
