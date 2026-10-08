import { progressOf, RAIL_LABEL } from '../engine/phases';
import { suggestUnitRef } from '../engine/session';
import { useSession } from '../state/SessionProvider';
import { RailRecorder } from '../record/DataFolder';

/** The 2 px progress line and phase label across the top of every screen after the home page. */
export function Rail() {
  const { state, edition, dispatch } = useSession();
  if (state.phase === 'entry') return null;
  return (
    <header className="rail">
      <div className="rail-fill" style={{ width: `${Math.round(progressOf(state.phase) * 100)}%` }} />
      <span className="rail-label">{RAIL_LABEL[state.phase]}</span>
      <div className="rail-actions">
        <RailRecorder started={!!state.startedAt} />
        <button className="rail-btn" onClick={() => dispatch({ type: 'nav/back' })}>Back</button>
        <button className="rail-btn" onClick={() =>
          dispatch({ type: 'session/restart', residenceId: edition.defaultResidence, unitRef: suggestUnitRef(edition) })}>
          Restart
        </button>
      </div>
    </header>
  );
}

export function Toast() {
  const { toast } = useSession();
  return <div className="toast" role="status" aria-live="polite" data-on={toast ? 'true' : 'false'}>{toast}</div>;
}
