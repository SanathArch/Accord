/* ══════════════════════════════════════════════════════════════
   10 · COHERENCE
   Reference: accord-demo #p-coherence; app.js runCoherence.
   Rule-based, runs locally.
   ══════════════════════════════════════════════════════════════ */
import { runCoherence } from '../../engine/method';
import { useMethod } from './common';
import './method.css';

export function CoherenceScreen() {
  const { m, edition: E, residence: res, go } = useMethod();
  const r = m.palette && m.register ? runCoherence(E, m, res) : null;
  return (
    <section id="p-coherence" className="phase center active">
      <div className="col wide">
        <div className="kicker">Coherence review</div>
        <div className="coh-head">
          <div className="coh-score">{r ? r.score : '·'}</div>
          <div>
            <div className="coh-verdict">{r?.verdict}</div>
            <div className="micro dim">Rule-based review of temperature, complexity, register consistency and lock-stage readiness. Runs locally; no selection data leaves this device.</div>
          </div>
        </div>
        <div>
          {r?.items.map((i, k) => <div key={k} className={`coh-item ${i.k}`}><b>{i.t}</b><span>{i.s}</span></div>)}
        </div>
        <div className="row">
          <button className="btn" onClick={() => go('summary')}>Continue to the Accord</button>
          <button className="btn-ghost" onClick={() => go('configurator')}>Back to the configurator</button>
        </div>
      </div>
    </section>
  );
}
