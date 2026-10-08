/* ══════════════════════════════════════════════════════════════
   ACCORD · SESSION
   One state object, changed only by actions, every action logged.
   The same actions will later travel between the salesperson's
   console and the buyer view, and replay a session for resume and
   analytics (brief §6.1). Pure functions, no DOM.
   ══════════════════════════════════════════════════════════════ */
import type { Edition } from './types';
import type { Phase } from './phases';
import { initialMethod, type MethodState } from './method';

export interface SessionState {
  editionId: string;
  phase: Phase;
  history: Phase[];            // for Back on every screen
  buyerName: string;
  unitRef: string;
  residenceId: string;
  floor: number | null;        // chosen floor in the tower, if the edition has one
  unit: string | null;         // unit tag on that floor (F1, F2…)
  startedAt: string | null;
  m: MethodState;              // persona, register, axes, palette, configuration (the method)
  log: LoggedAction[];
}

export type Action =
  | { type: 'edition/select'; editionId: string; residenceId: string; unitRef: string }
  | { type: 'session/start'; buyerName: string; unitRef: string }
  | { type: 'residence/choose'; residenceId: string; floor: number | null; unit: string | null }
  | { type: 'm/set'; event: string; patch: Partial<MethodState> }   // event names the step, for analytics
  | { type: 'nav/go'; phase: Phase }
  | { type: 'nav/back' }
  | { type: 'session/restart'; residenceId: string; unitRef: string };

export interface LoggedAction { t: string; action: Action; }

/** A reference the salesperson can overwrite: PREFIX-#### */
export function suggestUnitRef(edition: Edition, rand: () => number = Math.random): string {
  return `${edition.refPrefix}-${Math.floor(rand() * 8000) + 1000}`;
}

export function initialSession(edition: Edition, unitRef: string): SessionState {
  return {
    editionId: edition.id,
    phase: 'entry',
    history: [],
    buyerName: '',
    unitRef,
    residenceId: edition.defaultResidence,
    floor: null,
    unit: null,
    startedAt: null,
    m: initialMethod(),
    log: []
  };
}

export function reduce(state: SessionState, action: Action, now: () => string = () => new Date().toISOString()): SessionState {
  const t = now();
  const log = [...state.log, { t, action }];
  switch (action.type) {
    case 'edition/select':
      // only before a session has started: an edition is chosen on the home page
      if (state.phase !== 'entry') return state;
      return { ...state, editionId: action.editionId, residenceId: action.residenceId, floor: null, unit: null, unitRef: action.unitRef, m: initialMethod(), log };
    case 'session/start': {
      const name = action.buyerName.trim();
      if (!name) return state;
      return {
        ...state, buyerName: name, unitRef: action.unitRef.trim() || state.unitRef,
        startedAt: t, phase: 'residence', history: ['entry'], log
      };
    }
    case 'residence/choose':
      return { ...state, residenceId: action.residenceId, floor: action.floor, unit: action.unit, log };
    case 'm/set':
      return { ...state, m: { ...state.m, ...action.patch }, log };
    case 'nav/go':
      if (action.phase === state.phase) return state;
      return { ...state, phase: action.phase, history: [...state.history, state.phase], log };
    case 'nav/back': {
      if (!state.history.length) return state;
      const history = state.history.slice(0, -1);
      return { ...state, phase: state.history[state.history.length - 1], history, log };
    }
    case 'session/restart':
      return {
        ...state, phase: 'entry', history: [], buyerName: '', startedAt: null,
        residenceId: action.residenceId, floor: null, unit: null, unitRef: action.unitRef, m: initialMethod(), log
      };
  }
}
