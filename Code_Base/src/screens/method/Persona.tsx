/* ══════════════════════════════════════════════════════════════
   03 · WHO YOU ARE  (persona questions and reveal)
   Redesigned to the Home and Residence language: panel + stage.
   Method (brief §4.2, production rules):
   - the persona is read as a combination of Host, Seeker and Settler
   - ties go to the later answer, then to Settler
   - household mode: up to three people answer in turn; the household
     is the sum of their vectors, and the reveal shows where they agree
   Every answer is stored with its time and dwell (brief §4.2, §6.5).
   ══════════════════════════════════════════════════════════════ */
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { PERSONA_QS, PERSONA_COPY, type PersonaId } from '../../library/method';
import { METHOD_PARAMS, PERSONA_NAME, PERSONA_ORDER, WHO_COPY } from '../../library/params';
import {
  blendOfParticipant, householdBlend, householdReading, newParticipant, resolvePersona, startPersonaPatch,
  type Participant, type PersonaBlend
} from '../../engine/method';
import { VIEW } from '../../state/view';
import { LA, useMethod } from './common';
import { PersonaTriangle } from './PersonaChart';
import './method.css';
import './who.css';

const N = PERSONA_QS.length;
const isDone = (p: Participant) => p.answers.every(a => a != null);

/** "Host", "Host & Seeker", "Host, Seeker & Settler" with every name after the first set in the accent. */
export function BlendName({ blend }: { blend: PersonaBlend }) {
  const names = blend.components.map(k => PERSONA_NAME[k]);
  return (
    <>
      {names[0]}
      {names.length === 2 && <em>{' & ' + names[1]}</em>}
      {names.length === 3 && <em>{', ' + names[1] + ' & ' + names[2]}</em>}
    </>
  );
}
export const blendLabel = (b: PersonaBlend) => {
  const n = b.components.map(k => PERSONA_NAME[k]);
  return n.length === 1 ? n[0] : n.length === 2 ? `${n[0]} & ${n[1]}` : `${n[0]}, ${n[1]} & ${n[2]}`;
};

/** Three bars, one per persona, the ones in the combination lit. */
function Composition({ blend, compact }: { blend: PersonaBlend; compact?: boolean }) {
  return (
    <div className={`comp${compact ? ' compact' : ''}`}>
      {PERSONA_ORDER.map(k => {
        const on = blend.components.includes(k);
        const pct = Math.round(blend.shares[k] * 100);
        return (
          <div key={k} className={`comp-row${on ? ' on' : ''}${k === blend.lead ? ' lead' : ''}`}>
            <span className="comp-name">{PERSONA_NAME[k]}</span>
            <span className="comp-track"><span className="comp-fill" style={{ width: `${pct}%` }} />
              <span className="comp-min" style={{ left: `${METHOD_PARAMS.blendMin * 100}%` }} /></span>
            <span className="comp-pct">{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}

/* ── the five questions ───────────────────────────────────────── */
export function PersonaScreen() {
  const { m, state, set, go } = useMethod();
  const people = m.participants.length ? m.participants : [newParticipant(state.buyerName || 'You')];
  const who = Math.min(m.pWho, people.length - 1);
  const me = people[who];
  const qi = Math.min(m.pIdx, N - 1);
  const q = PERSONA_QS[qi];
  const shownAt = useRef(Date.now());
  const [handover, setHandover] = useState(who > 0 && qi === 0 && me.answers.every(a => a == null));
  const [adding, setAdding] = useState('');

  // first arrival without participants (e.g. through Back): seed the buyer
  useEffect(() => { if (!m.participants.length) set('persona/start', startPersonaPatch(state.buyerName)); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { shownAt.current = Date.now(); }, [qi, who, handover]);

  function writeAnswer(list: Participant[], pi: number, q: number, opt: number | null) {
    return list.map((p, i) => i !== pi ? p : {
      ...p,
      answers: p.answers.map((a, j) => j === q ? opt : a),
      at: p.at.map((a, j) => j === q ? (opt == null ? null : new Date().toISOString()) : a),
      dwell: p.dwell.map((a, j) => j === q ? (opt == null ? null : Date.now() - shownAt.current) : a)
    });
  }

  function answer(oi: number) {
    const next = writeAnswer(people, who, qi, oi);
    const mine = next[who];
    const openQ = mine.answers.findIndex(a => a == null);
    if (openQ >= 0) { set('persona/answer', { participants: next, pIdx: openQ }); return; }
    const nextWho = next.findIndex(p => !isDone(p));
    if (nextWho >= 0) {
      set('persona/answer', { participants: next, pWho: nextWho, pIdx: Math.max(0, next[nextWho].answers.findIndex(a => a == null)) });
      setHandover(true);
      return;
    }
    set('persona/resolved', { participants: next, ...resolvePersona(householdBlend(next)) });
    go('persona-reveal');
  }

  function previous() {
    if (qi > 0) { set('persona/previous', { participants: writeAnswer(people, who, qi - 1, null), pIdx: qi - 1 }); return; }
    if (who > 0) {
      set('persona/previous', { participants: writeAnswer(people, who - 1, N - 1, null), pWho: who - 1, pIdx: N - 1 });
      setHandover(false);
    }
  }

  function addPerson(e: FormEvent) {
    e.preventDefault();
    const name = adding.trim();
    if (!name || people.length >= METHOD_PARAMS.maxParticipants) return;
    set('persona/participant-add', { participants: [...people, newParticipant(name)] });
    setAdding('');
  }
  function removePerson(i: number) {
    if (i === 0) return;
    const next = people.filter((_, j) => j !== i);
    set('persona/participant-remove', { participants: next, pWho: Math.min(who, next.length - 1) });
  }

  const live = blendOfParticipant(me);
  const answered = me.answers.filter(a => a != null).length;

  return (
    <section id="p-persona" className="phase who active">
      <aside className="who-panel">
        <div className="who-head">
          <div className="who-kicker">{q.label}</div>
          <div className="who-count">{WHO_COPY.progress(qi + 1, N)}</div>
        </div>

        {handover
          ? <div className="who-q" key={'h' + who}>
              <h2 className="who-text">{WHO_COPY.handover(me.name)}</h2>
              <p className="who-sub">{WHO_COPY.handoverSub}</p>
              <button className="btn" onClick={() => setHandover(false)}>{WHO_COPY.handoverGo}</button>
            </div>
          : <div className="who-q" key={`${who}-${qi}`}>
              <h2 className="who-text">{q.text}</h2>
            </div>}

        <div className="who-progress" aria-label={`${answered} of ${N} answered`}>
          {people.map((p, pi) => (
            <div key={pi} className={`who-track${pi === who ? ' now' : ''}`}>
              {people.length > 1 && <span className="who-track-name">{p.name}</span>}
              <div className="who-dots">
                {p.answers.map((a, i) => <span key={i} className={`who-dot${a != null ? ' on' : ''}${pi === who && i === qi && !handover ? ' cur' : ''}`} />)}
              </div>
            </div>
          ))}
        </div>

        <div className="who-people">
          <span className="micro">{WHO_COPY.answering}</span>
          <div className="who-chips">
            {people.map((p, i) => (
              <span key={i} className={`who-chip${i === who ? ' on' : ''}${isDone(p) ? ' done' : ''}`}>
                {p.name}
                {VIEW === 'console' && i > 0 && p.answers.every(a => a == null) &&
                  <button aria-label={`Remove ${p.name}`} onClick={() => removePerson(i)}>×</button>}
              </span>
            ))}
          </div>
          {VIEW === 'console' && people.length < METHOD_PARAMS.maxParticipants && (
            <form className="who-add" onSubmit={addPerson}>
              <input value={adding} onChange={e => setAdding(e.target.value)} placeholder={WHO_COPY.personPlaceholder}
                aria-label={WHO_COPY.addPerson} />
              <button type="submit" className="chip" disabled={!adding.trim()}>{WHO_COPY.addPerson}</button>
            </form>
          )}
        </div>

        {VIEW === 'console' && answered > 0 && (
          <div className="who-live">
            <span className="micro">{WHO_COPY.liveScores} · {me.name}</span>
            <Composition blend={live} compact />
          </div>
        )}

        {(qi > 0 || who > 0) && <button className="btn-ghost who-prev" onClick={previous}>{WHO_COPY.previous}</button>}
      </aside>

      <div className={`who-stage${handover ? ' waiting' : ''}`}>
        <div className="who-opts" key={`${who}-${qi}`}>
          {q.opts.map((o, i) => {
            const chosen = me.answers[qi] === i;
            return (
              <button key={i} className={`who-opt${chosen ? ' chosen' : ''}`} onClick={() => answer(i)} disabled={handover}
                style={{ animationDelay: `${i * 70}ms` }}>
                <span className="who-opt-img"><img src={LA(`quiz/${o.img}.jpg`)} alt="" /></span>
                <span className="who-opt-no">{String(i + 1).padStart(2, '0')}</span>
                <span className="who-opt-text">{o.text}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── the reveal ───────────────────────────────────────────────── */
export function PersonaRevealScreen() {
  const { m, set, go } = useMethod();
  const people = m.participants;
  const b = m.blend ?? householdBlend(people);
  const household = people.filter(isDone).length > 1;
  const reading = householdReading(people);
  const second = b.components[1] as PersonaId | undefined;
  const third = b.components[2] as PersonaId | undefined;

  const points = [
    ...(household ? reading.people.map(p => ({ label: p.name, shares: blendOfParticipant(p).shares })) : []),
    { label: household ? 'Household' : 'You', shares: b.shares, main: true }
  ];

  const [name, setName] = useState('');
  function addAnother(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    set('persona/participant-add', { participants: [...people, newParticipant(name.trim())], pWho: people.length, pIdx: 0 });
    go('persona');
  }

  return (
    <section id="p-persona-reveal" className="phase who-reveal active">
      <div className="reveal-stage">
        <PersonaTriangle points={points} components={b.components} />
      </div>
      <aside className="reveal-panel">
        <div className="kicker">{household ? WHO_COPY.revealKickerHousehold : WHO_COPY.revealKicker}</div>
        <h2 className="reveal-name"><BlendName blend={b} /></h2>
        {third && <div className="micro reveal-bal">{WHO_COPY.balanced}</div>}
        <p className="tagline">{PERSONA_COPY[b.lead].line}</p>
        {second && <p className="reveal-with"><b>{WHO_COPY.withA(PERSONA_NAME[second])}</b> {PERSONA_COPY[second].sub}</p>}
        {third && <p className="reveal-with"><b>{WHO_COPY.withA(PERSONA_NAME[third])}</b> {PERSONA_COPY[third].sub}</p>}
        {!second && <p className="sub">{PERSONA_COPY[b.lead].sub}</p>}

        <div className="reveal-block">
          <div className="micro">{WHO_COPY.composition}</div>
          <Composition blend={b} />
        </div>

        {household && (
          <div className="reveal-block">
            <div className="reveal-people">
              {reading.people.map((p, i) => {
                const pb = blendOfParticipant(p);
                return <div key={i} className="reveal-person"><span>{p.name}</span><b>{blendLabel(pb)}</b></div>;
              })}
            </div>
            <p className="reveal-note">
              {reading.sameLead ? WHO_COPY.agreeAll(reading.people.length, PERSONA_NAME[reading.leads[0]]) : WHO_COPY.leadSplit}
              {' '}
              {reading.splitQ >= 0
                ? WHO_COPY.splitOn(PERSONA_QS[reading.splitQ].label.split('·').pop()!.trim().toLowerCase())
                : WHO_COPY.agreeOn}
            </p>
          </div>
        )}

        <div className="row">
          <button className="btn" onClick={() => go('register')}>{WHO_COPY.cont}</button>
        </div>
        {VIEW === 'console' && people.length < METHOD_PARAMS.maxParticipants && (
          <form className="who-add reveal-add" onSubmit={addAnother}>
            <input value={name} onChange={e => setName(e.target.value)} placeholder={WHO_COPY.personPlaceholder}
              aria-label={WHO_COPY.addAnother} />
            <button type="submit" className="chip" disabled={!name.trim()}>{WHO_COPY.addAnother}</button>
          </form>
        )}
      </aside>
    </section>
  );
}
