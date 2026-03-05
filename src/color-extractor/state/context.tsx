import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
import { colorExtractorReducer, colorExtractorInitialState } from './reducer';
import type { ColorExtractorState, ColorExtractorAction } from './types';

const CEStateContext = createContext<ColorExtractorState>(colorExtractorInitialState);
const CEDispatchContext = createContext<Dispatch<ColorExtractorAction>>(() => {});

export function ColorExtractorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(colorExtractorReducer, colorExtractorInitialState);

  return (
    <CEStateContext.Provider value={state}>
      <CEDispatchContext.Provider value={dispatch}>
        {children}
      </CEDispatchContext.Provider>
    </CEStateContext.Provider>
  );
}

export function useColorExtractorState() {
  return useContext(CEStateContext);
}

export function useColorExtractorDispatch() {
  return useContext(CEDispatchContext);
}
