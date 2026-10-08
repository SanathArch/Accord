/* Shared by the method screens: the session, the edition, the residence, asset paths,
   and the reference build's "first image that loads" resolver (app.js loadFirst). */
import { useEffect, useState } from 'react';
import { useSession } from '../../state/SessionProvider';
import { editionAsset } from '../../editions/registry';
import type { MethodState } from '../../engine/method';
import type { Phase } from '../../engine/phases';

/** library asset (reference: LA → assets/<p>) */
export const LA = (p: string | null | undefined) => (p ? `./library/${p}` : '');

export function useMethod() {
  const s = useSession();
  const { state, edition, dispatch } = s;
  const residence = edition.residences.find(r => r.id === state.residenceId) ?? edition.residences[0];
  const EA = (p: string | null | undefined) => editionAsset(edition, p);
  const set = (event: string, patch: Partial<MethodState>) => dispatch({ type: 'm/set', event, patch });
  const go = (phase: Phase) => dispatch({ type: 'nav/go', phase });
  return { ...s, m: state.m, residence, EA, set, go };
}

export interface Candidate { src: string; kind: string; }

/** Try each candidate in order; the first that loads wins (reference: loadFirst). */
export function useFirstLoadable(cands: Candidate[]) {
  const key = cands.map(c => c.src).join('|');
  const [res, setRes] = useState<{ src: string | null; kind: string | null; loading: boolean }>({ src: null, kind: null, loading: true });
  useEffect(() => {
    let alive = true, i = 0;
    setRes(r => ({ ...r, loading: true }));
    const next = () => {
      if (!alive) return;
      if (i >= cands.length) { setRes(r => ({ ...r, kind: null, loading: false })); return; }
      const c = cands[i++];
      const im = new Image();
      im.onload = () => { if (alive) setRes({ src: c.src, kind: c.kind, loading: false }); };
      im.onerror = next;
      im.src = c.src;
    };
    next();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return res;
}

export const cap = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();
