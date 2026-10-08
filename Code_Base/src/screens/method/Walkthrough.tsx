/* ══════════════════════════════════════════════════════════════
   08 · WALK THROUGH (the peopled set)
   Reference: accord-demo #p-walkthrough; app.js enterWalkthrough,
   walkSet, renderWalk, wtNav. Order: the edition's own frames for
   this palette, then the library's, then the configurator frames.
   ══════════════════════════════════════════════════════════════ */
import { useEffect } from 'react';
import { PALETTES, PALETTE_SLUG, VARIANTS, WALKTHROUGH } from '../../library/method';
import { LA, useFirstLoadable, useMethod } from './common';
import './method.css';

interface Frame { src: string; title: string; note: string; pending?: boolean; }

export function WalkthroughScreen() {
  const { m, edition: E, EA, set, go } = useMethod();

  useEffect(() => { set('walkthrough/enter', { wtIdx: 0 }); /* reference: enterWalkthrough */ }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const ed = (E.walkthrough || {})[m.palette!];
  const lib = WALKTHROUGH[m.palette!] || [];
  const frames: Frame[] = ed && ed.length ? ed.map(i => ({ ...i, src: EA(i.img) }))
    : lib.length ? lib.map(i => ({ ...i, src: LA(i.img) }))
    : E.rooms.map(room => { const v = (VARIANTS[m.palette!] || {})[room]; return v && v[0]
        ? { src: LA(v[0].img), title: room, note: 'Configurator frame.', pending: true } : null; }).filter(Boolean) as Frame[];
  const idx = Math.min(m.wtIdx, Math.max(0, frames.length - 1));
  const item = frames[idx];
  const slug = item ? item.title.toLowerCase().replace(/[^a-z]+/g, '-') : '';
  const img = useFirstLoadable(item ? [
    { src: LA(`rooms/${PALETTE_SLUG[m.palette!]}__walkthrough__${slug}__${m.tod}.jpg`), kind: 'new' },
    { src: item.src, kind: 'legacy' }
  ] : []);

  function nav(d: number) {
    const n = idx + d;
    if (n < 0) return;
    if (n >= frames.length) { go('configurator'); return; }
    set('walkthrough/frame', { wtIdx: n });
  }

  return (
    <section id="p-walkthrough" className="phase active">
      <div className="wt">
        <div className="wt-stage">
          {img.src && <img src={img.src} alt="" />}
          <div className="wt-top">
            <div>
              <div className="kicker">{PALETTES[m.palette!].name}</div>
              <div className="wt-title">{item?.title}</div>
            </div>
            <div className="wt-count">{frames.length ? `${idx + 1} / ${frames.length}` : ''}</div>
          </div>
          <div className="wt-bottom">
            <div className="wt-note">
              {item?.note}
              {item?.pending && <> <span className="pending">Peopled render in production, showing the configurator frame.</span></>}
            </div>
            <div className="wt-nav">
              <button className="btn-ghost sm" onClick={() => nav(-1)}>Previous</button>
              <div className="wt-dots">
                {frames.map((_, i) => <button key={i} className={`wt-dot${i === idx ? ' on' : ''}`} aria-label={`Frame ${i + 1}`}
                  onClick={() => set('walkthrough/frame', { wtIdx: i })} />)}
              </div>
              <button className="btn-ghost sm" onClick={() => nav(1)}>Next</button>
              <button className="btn sm" onClick={() => go('configurator')}>Configure this home</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
