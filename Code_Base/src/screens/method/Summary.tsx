/* ══════════════════════════════════════════════════════════════
   11 · THE ACCORD
   Reference: accord-demo #p-summary; app.js renderSummary, configId.
   Prints to A4 through the browser (print rules in method.css).
   ══════════════════════════════════════════════════════════════ */
import { CATEGORY_LABEL, LOCK_STAGES, PALETTES, PALETTE_SLUG, REGISTERS, type LockStage } from '../../library/method';
import {
  area, brandsFor, carpet, computeTotal, configId, conv, legacyRender, money, perArea, productionFile, roomsOf, selected
} from '../../engine/method';
import { Credits } from '../../components/StudioMark';
import { STUDIO } from '../../library/studio';
import { LA, cap, useMethod } from './common';
import { KeyPlanDrawing, useChosenPlate, plateLine } from './KeyPlan';
import { ordinal } from '../../engine/tower';
import './method.css';

export function SummaryScreen() {
  const { m, state, edition: E, residence: res, EA, go } = useMethod();
  const chosen = useChosenPlate();
  if (!m.palette || !m.register) {
    return (
      <section id="p-summary" className="phase center active">
        <div className="col"><p className="sub">The Accord is assembled once a palette and a register are chosen.</p>
          <button className="btn-ghost" onClick={() => go('configurator')}>Back</button></div>
      </section>
    );
  }
  const p = PALETTES[m.palette], t = computeTotal(E, m, res), R = REGISTERS[m.register];
  const rooms = roomsOf(E, res).filter(r => m.rooms[r]);
  const fields: [string, string][] = [
    ['Resident', state.buyerName || '·'],
    ['Unit reference', state.unitRef],
    ['Project', E.project + (E.label ? ' · ' + E.label : '')],
    ['Residence', res.name + ' · ' + area(E, res.saleable) + ' saleable'],
    ['Carpet area', area(E, carpet(E, res))],
    ['Persona', cap(m.persona ?? '') + (m.secondPersona ? ' · secondary ' + m.secondPersona.toLowerCase() : '')],
    ['Palette', p.name],
    ['Register', R.name],
    ['Coherence', m.coherence ? m.coherence + ' / 100' : 'not yet reviewed']
  ];

  const byLock: Record<LockStage, string[]> = { booking: [], three_months: [], six_weeks: [] };
  Object.keys(m.rooms).forEach(room => selected(m, room).forEach(({ opt }) => { byLock[opt.lock].push(room + ': ' + opt.name + ' (' + opt.lead + ' wks)'); }));

  const inSpec = new Set<string>();
  Object.keys(m.rooms).forEach(room => selected(m, room).forEach(({ opt }) => opt.brand.split('/').forEach(b => inSpec.add(b.trim().toLowerCase()))));
  const partners = brandsFor(E).filter(b => b.register.includes(m.register!) && b.palettes.includes(PALETTE_SLUG[m.palette!]))
    .sort((a, b) => (inSpec.has(b.name.toLowerCase()) ? 1 : 0) - (inSpec.has(a.name.toLowerCase()) ? 1 : 0) || a.category.localeCompare(b.category))
    .slice(0, 14);

  return (
    <section id="p-summary" className="phase active">
      <div className="sum">
        <div className="sum-head">
          <div>
            <div className="wordmark">Accord <span>{'· ' + E.label}</span></div>
            <h2 className="display sm">The <em>Accord</em></h2>
            <div className="micro dim">Configuration {configId(E, m, state.unitRef)}</div>
          </div>
          <div className="row tight">
            <button className="btn sm" onClick={() => window.print()}>Export PDF</button>
            <button className="btn-ghost sm" onClick={() => go('configurator')}>Back</button>
          </div>
        </div>
        <div className="sum-fields">{fields.map(([k, v]) => <div className="sum-field" key={k}><span>{k}</span><b>{v}</b></div>)}</div>
        <div className="strip">{p.colors.map((c, i) => <div key={i} style={{ background: c }} />)}</div>
        {chosen ? (
          <div className="sum-keyplan"><KeyPlanDrawing className="sum-keyplan-svg" />
            <div><div className="micro">Residence {chosen.unit.id}{chosen.chosen ? ` · ${ordinal(chosen.floor)} floor` : ''}</div>
              <div className="micro dim">{plateLine(chosen)}. Shaded area is this residence.</div></div></div>
        ) : res.keyplan && (
          <div className="sum-keyplan"><img src={EA(res.keyplan)} alt="Key plan" />
            <div><div className="micro">Residence {res.unit}</div><div className="micro dim">{res.plate || ''}. Shaded area is this residence.</div></div></div>
        )}

        <h3 className="sec">The rooms as configured</h3>
        <div className="sum-renders">
          {rooms.map(room => {
            const prod = productionFile(m, room, m.tod), leg = legacyRender(m, room);
            const src = prod || leg.img; if (!src) return null;
            return (
              <figure className="sum-render" key={room}>
                <img src={LA(src)} alt={`${room} as configured`}
                  onError={e => { const el = e.currentTarget; if (el.dataset.f !== '1' && leg.img) { el.dataset.f = '1'; el.src = LA(leg.img); } }} />
                <figcaption><b>{room}</b><span>{selected(m, room).map(s => s.opt.name).join(' · ')}</span></figcaption>
              </figure>
            );
          })}
        </div>

        <h3 className="sec">Specification</h3>
        <table className="sum-table"><tbody>
          {rooms.map(room => [
            <tr key={room}><td className="r-room" colSpan={4}>{room}</td></tr>,
            ...selected(m, room).map(({ cat, opt }) => (
              <tr key={room + cat}>
                <td className="c-cat">{CATEGORY_LABEL[cat] || cat}</td>
                <td>{opt.name}<div className="micro dim">{opt.note}</div></td>
                <td className="c-brand">{opt.brand}<br />{opt.tier.toLowerCase()}</td>
                <td className="c-cost">{opt.lump ? money(E, conv(E, opt.lump)) : (opt.d ? perArea(E, conv(E, opt.d)) : 'in base')}</td>
              </tr>
            ))
          ])}
        </tbody></table>
        {t && (
          <div className="sum-total">
            <span className="micro">Indicative total</span><b>{money(E, t.total)}</b>
            <span className="micro dim">{`${R.name} baseline ${money(E, t.base)} · selections ${t.delta >= 0 ? '+' : '−'}${money(E, Math.abs(t.delta))} · band ${money(E, t.low)} to ${money(E, t.high)}${E.pricingNote ? ' · ' + E.pricingNote : ''}`}</span>
          </div>
        )}

        <h3 className="sec">Lock stages</h3>
        <div>
          {(Object.keys(byLock) as LockStage[]).map(k => (
            <div className="lock" key={k}>
              <div><div className="micro">{LOCK_STAGES[k].label}</div><div className="micro dim">{LOCK_STAGES[k].sub}</div></div>
              <ul>{byLock[k].length ? byLock[k].map((x, i) => <li key={i}>{x}</li>) : <li className="micro dim">Nothing outstanding at this stage.</li>}</ul>
            </div>
          ))}
        </div>

        <h3 className="sec">Procurement extract</h3>
        <div className="micro dim">What the developer receives on confirmation. In production this posts to the CRM and the vendor purchase schedule.</div>
        <table className="sum-table"><tbody>
          {Object.keys(m.rooms).flatMap(room => selected(m, room).map(({ opt }) => (
            <tr key={room + opt.id}><td className="c-cat">{opt.id.toUpperCase()}</td><td>{opt.name}</td>
              <td className="c-brand">{opt.brand}</td><td className="c-cost">{opt.lead} wks · {LOCK_STAGES[opt.lock].label}</td></tr>
          )))}
        </tbody></table>

        <h3 className="sec">Curated partners</h3>
        <div>
          {partners.map(b => (
            <div className="vendor" key={b.id}><span>{b.name}</span><span className="h">{b.origin}</span>
              <span className="t">{b.subcategory}</span><span className="l">{(b.india_contact || '').split(',')[0]}</span></div>
          ))}
        </div>

        <h3 className="sec">Authorship</h3>
        <Credits />
        <p className="fineprint">{STUDIO.rights}</p>
        <p className="fineprint">Indicative estimate at current market rates, inclusive of design fee. Surfaces, joinery, lighting, loose furniture and textiles. Artwork and decor quoted separately. Renders are indicative of material and composition, not a representation of as-built condition.</p>
      </div>
    </section>
  );
}
