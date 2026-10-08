/* ══════════════════════════════════════════════════════════════
   04 · REGISTER  and  BESPOKE
   Reference: accord-demo #p-register, #p-bespoke;
   app.js renderRegister, pickRegister.
   ══════════════════════════════════════════════════════════════ */
import { REGISTERS, type RegisterKey } from '../../library/method';
import { area, band, carpet, money, perArea, regRates, MID_AXES } from '../../engine/method';
import { STUDIO } from '../../library/studio';
import { useMethod } from './common';
import './method.css';

export function RegisterScreen() {
  const { edition: E, residence: res, set, go } = useMethod();
  const c = carpet(E, res);
  const keys = (E.registers || ['COMPOSED', 'PROVENANCE', 'ATELIER', 'BESPOKE']) as RegisterKey[];

  function pick(k: RegisterKey) {
    if (k === 'BESPOKE') { set('register/pick', { register: k }); go('bespoke'); return; }
    // the visual questions start again from the middle of every axis
    set('register/pick', { register: k, vIdx: 0, axes: MID_AXES(), visualAnswers: [] });
    go('visual');
  }

  return (
    <section id="p-register" className="phase center active">
      <div className="col wide">
        <div className="kicker">{`${res.name} · ${area(E, c)} carpet`}</div>
        <h2 className="display">What <em>register</em>?</h2>
        <p className="sub">
          {'The register sets the brand depth and the level of execution, not the design language. Every register produces a complete, coherent home. The range shown is the full interior package for this residence, design fee included.'
            + (E.pricingNote ? ' ' + E.pricingNote : '')}
        </p>
        <div className="register-list">
          {keys.map(k => {
            const R = REGISTERS[k], b = band(E, k, res), rr = regRates(E, k);
            return (
              <button key={k} className="reg" onClick={() => pick(k)}>
                <div className="reg-top">
                  <span className="reg-name">{R.name}</span>
                  <span className="reg-price">{b ? money(E, b.low) + ' to ' + money(E, b.high) : 'By conversation'}</span>
                </div>
                <div className="reg-head">{R.headline}{rr ? ' · ' + perArea(E, rr.low) + ' to ' + perArea(E, rr.high) + ' carpet' : ''}</div>
                <div className="reg-lines">{R.lines.map((l, i) => <span key={i}>{l}</span>)}</div>
              </button>
            );
          })}
        </div>
        <button className="btn-ghost" onClick={() => go('persona-reveal')}>Back</button>
      </div>
    </section>
  );
}

export function BespokeScreen() {
  const { edition: E, go } = useMethod();
  const c = E.contact || { email: '', city: STUDIO.city };
  return (
    <section id="p-bespoke" className="phase center active">
      <div className="col">
        <div className="kicker">Bespoke</div>
        <h2 className="display">Let us build something<br /><em>together.</em></h2>
        <p className="body">Bespoke is not a budget. It is a brief. No catalogue, no presets: every material researched for this residence, every object commissioned for it.</p>
        <p className="body">Your persona and palette have been retained as the starting reference for the first conversation. Nothing else is assumed.</p>
        <div className="contact">
          {c.email && <div><span className="micro dim">Email</span> {c.email}</div>}
          <div><span className="micro dim">Studio</span> OuTSDe · Outlook for Theoreticals &amp; Speculative Design</div>
          <div><span className="micro dim">Office</span> {c.city || STUDIO.city}</div>
        </div>
        <div className="row">
          <button className="btn-ghost" onClick={() => go('register')}>Change register</button>
        </div>
      </div>
    </section>
  );
}
