import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
import { resourcesReducer, resourcesInitialState } from './reducer';
import type { ResourcesState, ResourcesAction } from './types';

const RSStateContext = createContext<ResourcesState>(resourcesInitialState);
const RSDispatchContext = createContext<Dispatch<ResourcesAction>>(() => {});

export function ResourcesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(resourcesReducer, resourcesInitialState);

  return (
    <RSStateContext.Provider value={state}>
      <RSDispatchContext.Provider value={dispatch}>
        {children}
      </RSDispatchContext.Provider>
    </RSStateContext.Provider>
  );
}

export function useResourcesState() {
  return useContext(RSStateContext);
}

export function useResourcesDispatch() {
  return useContext(RSDispatchContext);
}
