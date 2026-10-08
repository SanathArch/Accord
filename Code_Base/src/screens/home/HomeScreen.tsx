/* ══════════════════════════════════════════════════════════════
   00 · HOME (the Entry phase)
   Purpose: open the session (brief §7, phase 0).
   Shows: project hero, OuTSDe mark, Accord wordmark, edition label,
   lede, buyer name and unit reference, Begin, edition switch,
   credits. Writes: session/start.
   The buyer view (TV) shows identity only; the name, reference and
   edition controls belong to the console.
   Ported from accord-demo index.html #p-entry and app.js submitEntry().
   ══════════════════════════════════════════════════════════════ */
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { StudioMark, Credits } from '../../components/StudioMark';
import { EDITIONS, asset, editionById } from '../../editions/registry';
import { suggestUnitRef } from '../../engine/session';
import { useSession } from '../../state/SessionProvider';
import { VIEW } from '../../state/view';
import { DataFolder } from '../../record/DataFolder';
import { useRecorder } from '../../record/RecorderProvider';
import './home.css';

export function HomeScreen() {
  const { state, edition, dispatch, showToast } = useSession();
  const [name, setName] = useState(state.buyerName);
  const [unitRef, setUnitRef] = useState(state.unitRef);
  const [nameMissing, setNameMissing] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const rec = useRecorder();

  // the reference follows the edition when it is switched on this page
  useEffect(() => { setUnitRef(state.unitRef); }, [state.unitRef]);
  useEffect(() => { if (VIEW === 'console') nameRef.current?.focus(); }, []);

  function begin(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setNameMissing(true);
      nameRef.current?.focus();
      showToast('A name, please');
      return;
    }
    // saving the selections: ask again for the remembered folder (Begin is the click the browser needs)
    if (rec.mode === 'reconnect') void rec.reconnect();
    else if (rec.mode === 'none') showToast('Data folder not connected. Selections will not be saved.');
    dispatch({ type: 'session/start', buyerName: name, unitRef });
  }

  function switchEdition(id: string) {
    if (id === edition.id) return;
    const next = editionById(id);
    dispatch({ type: 'edition/select', editionId: next.id, residenceId: next.defaultResidence, unitRef: suggestUnitRef(next) });
    const u = new URL(window.location.href);
    u.searchParams.set('edition', next.id); u.hash = next.id;
    window.history.replaceState(null, '', u.toString());
  }

  return (
    <section className="phase home" aria-labelledby="home-title">
      <div className="home-media">
        <img key={edition.id} src={asset(edition.hero)} alt={edition.heroAlt} />
      </div>

      <div className="home-panel">
        <StudioMark />

        <div className="home-title">
          <h1 id="home-title" className="home-wordmark">Accord</h1>
          <div className="home-edition">{edition.label}</div>
        </div>

        {edition.lede && <p className="lede">{edition.lede}</p>}
        <div className="rule" />

        {VIEW === 'console' && <>
        <form className="home-form" onSubmit={begin} noValidate>
          <div className="field" data-invalid={nameMissing ? 'true' : 'false'}>
            <label htmlFor="f-name">Your name</label>
            <input id="f-name" ref={nameRef} type="text" placeholder="Enter your name" autoComplete="off"
              value={name} aria-invalid={nameMissing}
              onChange={e => { setName(e.target.value); if (e.target.value.trim()) setNameMissing(false); }} />
            {nameMissing && <span className="field-hint">A name is needed to open the session.</span>}
          </div>
          <div className="field">
            <label htmlFor="f-ref">Unit reference</label>
            <input id="f-ref" type="text" placeholder={`${edition.refPrefix}-0000`} autoComplete="off"
              value={unitRef} onChange={e => setUnitRef(e.target.value)} />
          </div>
          <button type="submit" className="btn home-begin">Begin</button>
        </form>

        {EDITIONS.length > 1 && (
          <div className="home-editions" role="group" aria-label="Edition">
            <span className="micro">Edition</span>
            {EDITIONS.map(e => (
              <button key={e.id} type="button" className="chip" aria-pressed={e.id === edition.id}
                onClick={() => switchEdition(e.id)}>{e.label}</button>
            ))}
          </div>
        )}

        <DataFolder />
        </>}

        <Credits />

        {VIEW === 'console' && <p className="fineprint">
          Development build, October 2026. Not for distribution.<br />
          Accord&trade; and the Accord method are the intellectual property of OuTSDe.
        </p>}
      </div>
    </section>
  );
}
