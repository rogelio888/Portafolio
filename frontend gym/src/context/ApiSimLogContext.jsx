import { createContext, useContext, useEffect, useReducer } from 'react';
import { apiSimBus } from '../api-sim/bus';

const ApiSimLogContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'LOG':
      return { ...state, events: [action.payload, ...state.events].slice(0, 50) };
    case 'TOGGLE':
      return { ...state, isOpen: !state.isOpen };
    case 'CLEAR':
      return { ...state, events: [] };
    default:
      return state;
  }
}

export function ApiSimLogProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { events: apiSimBus.getHistory(), isOpen: false });

  useEffect(() => apiSimBus.subscribe((event) => dispatch({ type: 'LOG', payload: event })), []);

  const value = {
    events: state.events,
    isOpen: state.isOpen,
    toggle: () => dispatch({ type: 'TOGGLE' }),
    clear: () => dispatch({ type: 'CLEAR' }),
  };

  return <ApiSimLogContext.Provider value={value}>{children}</ApiSimLogContext.Provider>;
}

export const useApiSimLog = () => useContext(ApiSimLogContext);
