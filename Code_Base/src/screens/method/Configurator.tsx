/* ══════════════════════════════════════════════════════════════
   09 · CONFIGURE
   Reference: accord-demo #p-configurator; app.js enterConfigurator,
   applyDefaults, buildTabs, enterRoom, renderSidebar, pick,
   resetRoom, renderStage, setTod, renderKeyplan, updateTotal.
   Every room starts on the curated default for the chosen register,
   so the estimate and the coherence review describe the whole home.
   The stage always says which render it is showing.
   ══════════════════════════════════════════════════════════════ */
import { useEffect } from 'react';
import { CATEGORY_LABEL, LOCK_STAGES, MISS_LABEL, PALETTES, REGISTERS, REGISTER_ORDER } from '../../library/method';
import {
  applyDefaults, coherenceWarning, computeTotal, conv, legacyRender, money, optionSet, perArea,
  productionFile, roomsOf, selected, SIDEBAR_ORDER, runCoherence
} from '../../engine/method';
import { LA, useFirstLoadable, useMethod, type Candidate } from './common';
import { KeyPlanDrawing, useChosenPlate, plateLine, unitLine } from './KeyPlan';
import './method.css';

export function ConfiguratorScreen() {
  const { m, edition: E, residence: res, EA, set, go, showToast } = useMethod();
  const chosen = useChosenPlate();   // the floor and residence picked on the tower, else the type's own unit
  const rooms = roomsOf(E, res);
  const room = rooms.includes(m.room) ? m.room : rooms[0];
  const ready = !!m.palette && !!m.register && rooms.every(r => m.rooms[r]);

  // enterConfigurator: defaults for every room of this residence
  useEffect(() => {
    if (!m.palette || !m.register) return;
    let next = m.rooms;
    rooms.forEach(r => { next = applyDefaults(next, m.palette!, r, m.register!); });
    set('configurator/enter', { rooms: next, room });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Escape opens the Accord (reference)
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') go('summary'); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [go]);

  function enterRoom(r: string) {
    set('configurator/room', { room: r, rooms: applyDefaults(m.rooms, m.palette!, r, m.register!) });
  }
  function pick(cat: string, id: string) {
    set('configurator/select', { rooms: { ...m.rooms, [room]: { ...(m.rooms[room] || {}), [cat]: id } }, coherence: null });
  }
  function resetRoom() {
    set('configurator/reset-room', { rooms: applyDefaults({ ...m.rooms, [room]: {} }, m.palette!, room, m.register!) });
    showToast('Room reset to the curated default');
  }
  function review() {
    const r = runCoherence(E, m, res);
    set('coherence/run', { coherence: r.score });
    go('coherence');
  }

  /* ── stage: production file, then the day version at night, then the nearest authored render ── */
  const prod = ready ? productionFile(m, room, m.tod) : null;
  const legacy = ready ? legacyRender(m, room) : { img: null, score: 0, max: 0, misses: [] as string[] };
  const cands: Candidate[] = [];
  if (prod) cands.push({ src: LA(prod), kind: 'exact' });
  if (prod && m.tod === 'night') cands.push({ src: LA(productionFile(m, room, 'day')), kind: 'day-only' });
  if (legacy.img) cands.push({ src: LA(legacy.img), kind: 'legacy' });
  const shown = useFirstLoadable(cands);

  let matchClass = 'cfg-match', matchText = '';
  const nightNote = (m.tod === 'night' && shown.kind !== 'exact' && shown.kind !== 'day-only') ? 'Night set in production, showing day. ' : '';
  if (shown.kind === 'exact') { matchClass = 'cfg-match exact'; matchText = 'Authored render, this combination, ' + m.tod; }
  else if (shown.kind === 'day-only') { matchText = 'Night render in production. Showing the same combination by day.'; }
  else if (shown.kind === 'legacy' && legacy.score === legacy.max && legacy.max > 0) {
    matchClass = nightNote ? 'cfg-match' : 'cfg-match exact'; matchText = nightNote + 'Authored render, this combination';
  } else if (shown.kind === 'legacy') {
    matchText = nightNote + (legacy.misses.length
      ? 'Nearest authored render. ' + legacy.misses.map(x => MISS_LABEL[x] || x).join(' and ') + ' specified, not yet rendered.'
      : 'Authored render. Material options swap in specification.');
  } else if (!shown.loading) { matchText = 'Render in production for this combination'; }

  const t = ready ? computeTotal(E, m, res) : null;
  const pct = t ? Math.max(8, Math.min(100, Math.round((t.total - t.low) / (t.high - t.low) * 100))) : 20;
  const set_ = ready ? optionSet(m.palette!, room) : {};
  const cats = Object.keys(set_).sort((a, b) => SIDEBAR_ORDER.indexOf(a) - SIDEBAR_ORDER.indexOf(b));
  const R = m.register ? REGISTERS[m.register] : null;

  return (
    <section id="p-configurator" className="phase active">
      <div className="cfg">
        <div className="cfg-stage">
          {shown.src && <img className={shown.loading ? 'swapping' : ''} src={shown.src} alt="Room visualisation" />}
          <div className="cfg-stage-top">
            <div className="cfg-stage-left">
              <div className="cfg-room-name">{room}</div>
              <div className="tod" role="group" aria-label="Time of day">
                <button className={`tod-btn${m.tod === 'day' ? ' on' : ''}`} onClick={() => set('configurator/tod', { tod: 'day' })}>Day</button>
                <button className={`tod-btn${m.tod === 'night' ? ' on' : ''}`} onClick={() => set('configurator/tod', { tod: 'night' })}>Night</button>
              </div>
            </div>
            <div className={matchClass}>{matchText}</div>
          </div>
          {chosen ? (
            <div className="keyplan" title="Your residence on the floor plate">
              <KeyPlanDrawing className="keyplan-svg" />
              <span className="keyplan-cap">{unitLine(res.name, chosen)}<br />{plateLine(chosen)}</span>
            </div>
          ) : res.keyplan && (
            <div className="keyplan" title="Your residence on the floor plate">
              <img src={EA(res.keyplan)} alt={`Key plan, residence ${res.unit}`} />
              <span className="keyplan-cap">{res.name} · unit {res.unit}<br />{res.plate || ''}</span>
            </div>
          )}
          <div className="cfg-stage-bottom">
            {ready && selected(m, room).map(({ opt }) => (
              <span className="cap-item" key={opt.id}><b>{opt.name}</b><i>{opt.brand.split('/')[0].trim()}</i></span>
            ))}
          </div>
        </div>

        <aside className="cfg-side">
          <div className="cfg-side-head">
            <div className="cfg-side-title">{m.palette ? PALETTES[m.palette].name : ''}</div>
            <div className="cfg-tabs">
              {rooms.map(r => <button key={r} className={`cfg-tab${r === room ? ' on' : ''}`} onClick={() => enterRoom(r)}>{r}</button>)}
            </div>
          </div>
          <div className="cfg-side-body">
            {ready && cats.map(cat => (
              <div className="cat" key={cat}>
                <div className="cat-label">{CATEGORY_LABEL[cat] || cat}</div>
                {set_[cat].map(o => {
                  const on = (m.rooms[room] || {})[cat] === o.id;
                  const up = REGISTER_ORDER.indexOf(o.tier) > REGISTER_ORDER.indexOf(m.register!);
                  const warn = on ? coherenceWarning(m, room, cat, o) : '';
                  const cost = o.lump ? money(E, conv(E, o.lump)) : (o.d ? (o.d > 0 ? '+' : '') + perArea(E, conv(E, o.d)) : 'included');
                  return (
                    <div key={o.id} className={`opt${on ? ' on' : ''}`} onClick={() => pick(cat, o.id)}>
                      <div className="opt-sw" style={{ background: o.swatch }} />
                      <div>
                        <div className="opt-name"><span>{o.name}</span><span className="opt-cost">{cost}</span></div>
                        <div className="opt-brand">{o.brand} · {o.tier.toLowerCase()} · {o.lead} wks · {LOCK_STAGES[o.lock].label.toLowerCase()}</div>
                        <div className="opt-note">{o.note}</div>
                        {up && <div className="opt-flag up">Above your register · adds to the estimate</div>}
                        {warn && <div className="opt-flag">{warn}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="cfg-side-foot">
            <div className="cfg-total-row">
              <div>
                <div className="micro">Indicative interior cost</div>
                <div className="cfg-total">{t ? money(E, t.total) : '·'}</div>
                <div className="micro dim">
                  {t && R ? `${R.name} band ${money(E, t.low)} to ${money(E, t.high)}` +
                    (t.total > t.high ? ' · above band' : t.total < t.low ? ' · below band' : ' · within band') : ''}
                </div>
              </div>
              <div className="cfg-meter"><div className="cfg-meter-fill" style={{ height: `${pct}%` }} /></div>
            </div>
            <div className="row tight">
              <button className="btn sm" onClick={review}>Review coherence</button>
              <button className="btn-ghost sm" onClick={() => { set('brands/open', { prevPhase: 'configurator' }); go('brands'); }}>Brands</button>
              <button className="btn-ghost sm" onClick={resetRoom}>Reset room</button>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
