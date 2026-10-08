/* React binding for the engine's session reducer. The console and the buyer view
   will both read this state; for now there is one window. */
import { createContext, useCallback, useContext, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import { initialSession, reduce, suggestUnitRef, type Action, type SessionState } from '../engine/session';
import { editionById, editionFromLocation } from '../editions/registry';
import type { Edition } from '../engine/types';

interface Ctx {
  state: SessionState;
  edition: Edition;
  dispatch: (a: Action) => void;
  toast: string;
  showToast: (msg: string) => void;
}

const SessionContext = createContext<Ctx | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    (s: SessionState, a: Action) => reduce(s, a),
    undefined,
    () => { const e = editionFromLocation(); return initialSession(e, suggestUnitRef(e)); }
  );
  const [toast, setToast] = useState('');
  const toastTimer = useRef<number>();
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 2600);
  }, []);
  const edition = editionById(state.editionId);
  const value = useMemo(() => ({ state, edition, dispatch, toast, showToast }), [state, edition, toast, showToast]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): Ctx {
  const c = useContext(SessionContext);
  if (!c) throw new Error('useSession outside SessionProvider');
  return c;
}
