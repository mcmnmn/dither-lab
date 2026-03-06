import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';
import { svgAnimatorReducer, svgAnimatorInitialState } from './reducer';
import type { SvgAnimatorState, SvgAnimatorAction } from './types';

const StateContext = createContext<SvgAnimatorState>(svgAnimatorInitialState);
const DispatchContext = createContext<Dispatch<SvgAnimatorAction>>(() => {});

export function SvgAnimatorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(svgAnimatorReducer, svgAnimatorInitialState);
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

export function useSvgAnimatorState() {
  return useContext(StateContext);
}

export function useSvgAnimatorDispatch() {
  return useContext(DispatchContext);
}
