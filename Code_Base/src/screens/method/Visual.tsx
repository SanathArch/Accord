/* ══════════════════════════════════════════════════════════════
   05 · INSTINCT  and  06 · RESOLVING
   Redesigned to the Home and Residence language: panel + stage.
   Method (brief §4.4, §4.5, §11 defects 10 and 13):
   - three-way answer: A, both or neither, B (−step, 0, +step on the axis);
     the answers are stored and the axes derived from them
   - resolving runs at most METHOD_PARAMS.resolvingMs and can be skipped;
     it shows the real ranking it has already computed
   ══════════════════════════════════════════════════════════════ */
import { useEffect, useMemo, useRef, useState } from 'react';
import { VISUAL_QS, AXIS_LABEL, PALETTES, type Axis } from '../../library/method';
import { INSTINCT_COPY, METHOD_PARAMS, PERSONA_NAME, RESOLVING_COPY } from '../../library/params';
import { MID_AXES, axesFrom, householdBlend, resolvePalette, type VisualAnswer } from '../../engine/method';
import { LA, useMethod } from './common';
import './method.css';
import './who.css';

const N = VISUAL_QS.length;
const AXES = Object.keys(AXIS_LABEL) as Axis[];

/** Five tracks, 0 to 10, a dot for each value; optional second set (a palette) drawn hollow. */
export function AxisTracks({ axes, other, highlight, labels }: {
  axes: Record<Axis, number>; other?: Record<Axis, number>; highlight?: Axis; labels?: [string, string];
}) {
  return (
    <div className="ax">
      {labels && <div className="ax-legend"><span className="ax-key you" />{labels[0]}<span className="ax-key pal" />{labels[1]}</div>}
      {AXES.map(a => (
        <div key={a} className={`ax-row${highlight === a ? ' on' : ''}`}>
          <span className="ax-name">{AXIS_LABEL[a]}</span>
          <span className="ax-track">
            <span className="ax-mid" />
            {other && <span className="ax-gap" style={{ left: `${Math.min(axes[a], other[a]) * 10}%`, width: `${Math.abs(axes[a] - other[a]) * 10}%` }} />}
            {other && <span className="ax-dot pal" style={{ left: `${other[a] * 10}%` }} />}
            <span className="ax-dot you" style={{ left: `${axes[a] * 10}%` }} />
          </span>
        </div>
      ))}
    </div>
  );
}

export function VisualScreen() {
  const { m, set, go } = useMethod();
  const qi = Math.min(m.vIdx, N - 1);
  const q = VISUAL_QS[qi];
  const answers = m.visualAnswers.length ? m.visualAnswers : VISUAL_QS.map(() => null);

  function answer(ans: VisualAnswer) {
    const next = answers.map((x, i) => (i === qi ? ans : x));
    const axes = axesFrom(next);
    const vIdx = qi + 1;
    set('visual/answer', { visualAnswers: next, axes, vIdx });
    if (vIdx >= N) go('resolving');
  }
  function previous() {
    const next = answers.map((x, i) => (i === qi - 1 ? null : x));
    set('visual/previous', { visualAnswers: next, axes: axesFrom(next), vIdx: qi - 1 });
  }

  return (
    <section id="p-visual" className="phase who active">
      <aside className="who-panel">
        <div className="who-head">
          <div className="who-kicker">{INSTINCT_COPY.kicker} · {AXIS_LABEL[q.axis]}</div>
          <div className="who-count">{INSTINCT_COPY.progress(qi + 1, N)}</div>
        </div>
        <div className="who-q" key={qi}><h2 className="who-text">{q.text}</h2></div>
        <div className="who-progress"><div className="who-track now"><div className="who-dots">
          {answers.map((a, i) => <span key={i} className={`who-dot${a ? ' on' : ''}${i === qi ? ' cur' : ''}`} />)}
        </div></div></div>
        <div className="who-live">
          <span className="micro">{INSTINCT_COPY.readout}</span>
          <AxisTracks axes={m.axes} highlight={q.axis} />
        </div>
        {qi > 0 && <button className="btn-ghost who-prev" onClick={previous}>{INSTINCT_COPY.previous}</button>}
      </aside>

      <div className="who-stage">
        <div className="vis" key={qi}>
          {(['a', 'b'] as const).map((side, i) => (
            <button key={side} className={`vis-opt vis-${side}${answers[qi] === side ? ' chosen' : ''}`} onClick={() => answer(side)}
              style={{ animationDelay: `${i * 90}ms` }}>
              <span className="vis-img"><img src={LA(`quiz/${q[side].img}.jpg`)} alt="" /></span>
              <span className="vis-cap">{q[side].caption}</span>
            </button>
          ))}
          <button className={`vis-mid${answers[qi] === 'mid' ? ' chosen' : ''}`} onClick={() => answer('mid')}>
            <span className="vis-mid-t">{INSTINCT_COPY.middle}</span>
            <span className="vis-mid-s">{INSTINCT_COPY.middleSub}</span>
          </button>
        </div>
      </div>
    </section>
  );
}

export function ResolvingScreen() {
  const { m, edition, set, go } = useMethod();
  const blend = useMemo(() => m.blend ?? householdBlend(m.participants), []); // eslint-disable-line react-hooks/exhaustive-deps
  const r = useMemo(() => resolvePalette(edition, m.axes, blend), []);         // eslint-disable-line react-hooks/exhaustive-deps
  const [stage, setStage] = useState(-1);  // -1 start · 0 axes settle · 1 palettes measured · 2 recommended
  const done = useRef(false);
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const total = reduce ? 600 : METHOD_PARAMS.resolvingMs;

  function commit() {
    if (done.current) return;
    done.current = true;
    const changed = m.palette && m.palette !== r.recommended;
    set('palette/resolved', {
      ranking: r.ranking, distances: r.distances, recommended: r.recommended, palette: r.recommended,
      ...(changed ? { rooms: {} } : {})
    });
    go('palette');
  }

  useEffect(() => {
    const t0 = window.setTimeout(() => setStage(0), 40);
    const t1 = window.setTimeout(() => setStage(1), total * 0.3);
    const t2 = window.setTimeout(() => setStage(2), total * 0.75);
    const t3 = window.setTimeout(commit, total);
    return () => { window.clearTimeout(t0); window.clearTimeout(t1); window.clearTimeout(t2); window.clearTimeout(t3); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const maxRaw = Math.max(...r.ranking.map(x => x.raw), 1);
  return (
    <section id="p-resolving" className="phase center active">
      <div className="col wide rsv">
        <div className="rsv-head">
          <div>
            <div className="kicker">{RESOLVING_COPY.kicker} · {blend.components.map(k => PERSONA_NAME[k]).join(' & ')}</div>
            <h2 className="display sm">{RESOLVING_COPY.title}</h2>
          </div>
          <button className="btn-ghost" onClick={commit}>{RESOLVING_COPY.skip}</button>
        </div>
        <div className="rsv-grid">
          <div className="rsv-axes"><AxisTracks axes={stage >= 0 ? m.axes : MID_AXES()} /></div>
          <div className="rsv-list">
            {r.ranking.map((row, i) => {
              const p = PALETTES[row.id];
              const rec = row.id === r.recommended;
              return (
                <div key={row.id} className={`rsv-row${stage >= 1 ? ' in' : ''}${stage >= 2 && rec ? ' rec' : ''}${stage >= 2 && !rec ? ' dim' : ''}`}
                  style={{ transitionDelay: `${i * 60}ms` }}>
                  <span className="rsv-sw">{p.colors.map((c, j) => <i key={j} style={{ background: c }} />)}</span>
                  <span className="rsv-name">{p.name}</span>
                  <span className="rsv-bar"><span style={{ width: stage >= 1 ? `${Math.max(2, row.d / maxRaw * 100)}%` : '0%', transitionDelay: `${i * 60}ms` }} /></span>
                  <span className="rsv-d">{row.d.toFixed(1)}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rsv-time"><span style={{ animationDuration: `${total}ms` }} /></div>
      </div>
    </section>
  );
}
