/* Stand-in for phases not built yet, so the flow can be walked end to end. */
import { PHASES, RAIL_LABEL, type MainPhase } from '../../engine/phases';
import { useSession } from '../../state/SessionProvider';

export function NextScreen() {
  const { state, edition, dispatch } = useSession();
  const res = edition.residences.find(r => r.id === state.residenceId);
  const i = (PHASES as readonly string[]).indexOf(state.phase);
  const next: MainPhase | undefined = i >= 0 ? PHASES[i + 1] : undefined;
  return (
    <section className="phase" style={{ display: 'grid', placeItems: 'center', padding: 'var(--gutter)' }}>
      <div style={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'rise var(--t-rise) ease both' }}>
        <div className="kicker">{RAIL_LABEL[state.phase] || state.phase} · not built yet</div>
        <h2 className="display">Session open for <em>{state.buyerName}</em>.</h2>
        <p className="body">
          Unit reference {state.unitRef} · {edition.label}{res ? ` · ${res.name}` : ''}.
        </p>
        {next && (
          <div style={{ display: 'flex', gap: '.8rem' }}>
            <button className="btn" onClick={() => dispatch({ type: 'nav/go', phase: next })}>Continue</button>
          </div>
        )}
      </div>
    </section>
  );
}
