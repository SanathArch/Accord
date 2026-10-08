/* ══════════════════════════════════════════════════════════════
   07 · YOUR PALETTE  and  THE RESOLUTION MAP
   Redesigned to the Home and Residence language.
   Palette: full-bleed image + panel; the colour code (five named
   colours with their codes) and why it was resolved (your axes
   against the palette's).
   Map: all nine palettes ranked as a chart, the persona pull shown
   as part of each distance; choose any palette that is ready.
   ══════════════════════════════════════════════════════════════ */
import { useEffect, useState } from 'react';
import { PALETTES, REGISTERS, type Palette } from '../../library/method';
import { PALETTE_COPY, PERSONA_NAME } from '../../library/params';
import { householdBlend, isAvailable, type RankRow } from '../../engine/method';
import { asset } from '../../editions/registry';
import { LA, useMethod } from './common';
import { AxisTracks } from './Visual';
import { blendLabel } from './Persona';
import './method.css';
import './who.css';

/** The palette's five colours, named, with their codes. */
export function ColourCode({ p, size = 'lg' }: { p: Palette; size?: 'lg' | 'sm' }) {
  return (
    <div className={`code code-${size}`}>
      {p.colors.map((c, i) => (
        <div key={i} className="code-chip" style={{ animationDelay: `${i * 80}ms` }}>
          <span className="code-sw" style={{ background: c }} />
          {p.colorNames?.[i] && <span className="code-name">{p.colorNames[i]}</span>}
          <span className="code-hex">{c.toUpperCase()}</span>
        </div>
      ))}
    </div>
  );
}

function rowsOf(m: { ranking: RankRow[]; distances: { id: string; d: number }[] }): RankRow[] {
  return m.ranking.length ? m.ranking : m.distances.map(d => ({ id: d.id, raw: d.d, pull: 0, d: d.d }));
}

export function PaletteScreen() {
  const { m, edition: E, EA, go } = useMethod();
  const p = PALETTES[m.palette!], R = m.register ? REGISTERS[m.register] : null;
  const img = (E.paletteHero && E.paletteHero[m.palette!]) ? EA(E.paletteHero[m.palette!]) : (p.hero ? LA(p.hero) : asset(E.hero));
  const blend = m.blend ?? householdBlend(m.participants);
  const lead = m.persona ?? blend.lead;
  const alt = rowsOf(m).filter(d => d.id !== m.palette && isAvailable(E, d.id))[0]
    ?? rowsOf(m).filter(d => d.id !== m.palette)[0];

  return (
    <section id="p-palette" className="phase pal2 active">
      <div className="pal2-media"><img src={img} alt="" /></div>
      <div className="pal2-panel">
        <div className="kicker">{PALETTE_COPY.residenceFor(blendLabel(blend))}</div>
        <h2 className="pal2-name">{p.name}</h2>
        <div className="pal2-tags">
          {R && <span className="pill">{R.name} register</span>}
          {p.family && <span className="pill dim">{p.family}</span>}
        </div>

        <div className="pal2-block">
          <div className="micro">{PALETTE_COPY.colourCode}</div>
          <ColourCode p={p} />
        </div>

        <p className="tagline">{p.voice ? p.voice[lead] : p.line}</p>
        {p.body && <p className="sub">{p.body}</p>}

        <div className="pal2-block">
          <div className="micro">{PALETTE_COPY.whyKicker}</div>
          <AxisTracks axes={m.axes} other={p.axes} labels={[PALETTE_COPY.you, p.short || p.name]} />
        </div>

        {alt && <div className="pal2-alt micro">{PALETTE_COPY.nearest}: <b>{PALETTES[alt.id].name}</b> · {alt.d.toFixed(1)}</div>}

        <div className="row">
          <button className="btn" onClick={() => go('walkthrough')}>{PALETTE_COPY.walk}</button>
          <button className="btn-ghost" onClick={() => go('palette-map')}>{PALETTE_COPY.how}</button>
        </div>
      </div>
    </section>
  );
}

export function PaletteMapScreen() {
  const { m, edition: E, set, go, showToast } = useMethod();
  const rows = rowsOf(m);
  const [focus, setFocus] = useState<string>(m.palette ?? rows[0]?.id);
  useEffect(() => { if (m.palette) setFocus(m.palette); }, [m.palette]);
  const maxRaw = Math.max(...rows.map(r => r.raw), 1);
  const f = PALETTES[focus];
  const fRow = rows.find(r => r.id === focus);
  const fReady = isAvailable(E, focus);

  const status = (id: string) => {
    const p = PALETTES[id];
    if (id === m.recommended) return PALETTE_COPY.recommended;
    if (isAvailable(E, id)) return PALETTE_COPY.available;
    return p.status === 'ready' ? PALETTE_COPY.notInEdition : PALETTE_COPY.inProduction;
  };

  function choose(id: string) {
    if (!isAvailable(E, id) || id === m.palette) return;
    set('palette/choose', { palette: id, rooms: {} });
    showToast(PALETTES[id].name + ' selected. ' + PALETTE_COPY.resetNote);
  }

  return (
    <section id="p-palette-map" className="phase center active">
      <div className="col wide map2">
        <div className="kicker">{PALETTE_COPY.mapKicker}</div>
        <h2 className="display">{PALETTE_COPY.mapTitleA}<em>{PALETTE_COPY.mapTitleEm}</em>{PALETTE_COPY.mapTitleB}</h2>
        <p className="sub">{PALETTE_COPY.mapSub}</p>

        <div className="map2-grid">
          <div className="map2-list" role="listbox" aria-label="Palettes by distance">
            <div className="map2-legend micro">
              <span>{PALETTE_COPY.distance}</span>
              <span className="map2-key"><i className="k-d" />{PALETTE_COPY.distance}</span>
              <span className="map2-key"><i className="k-pull" />{PALETTE_COPY.personaPull}</span>
            </div>
            {rows.map((r, i) => {
              const p = PALETTES[r.id];
              const ready = isAvailable(E, r.id);
              return (
                <button key={r.id} role="option" aria-selected={focus === r.id}
                  className={`map2-row${focus === r.id ? ' focus' : ''}${r.id === m.palette ? ' chosen' : ''}${ready ? '' : ' off'}${r.id === m.recommended ? ' rec' : ''}`}
                  onClick={() => setFocus(r.id)} onDoubleClick={() => choose(r.id)}>
                  <span className="map2-n">{String(i + 1).padStart(2, '0')}</span>
                  <span className="map2-sw">{p.colors.map((c, j) => <i key={j} style={{ background: c }} />)}</span>
                  <span className="map2-name"><b>{p.name}</b><span>{PERSONA_NAME[p.persona]} · {r.id === m.palette ? PALETTE_COPY.chosen : status(r.id)}</span></span>
                  <span className="map2-bar">
                    <span className="map2-d" style={{ width: `${Math.max(1, r.d / maxRaw * 100)}%` }} />
                    {r.pull > 0 && <span className="map2-pull" style={{ left: `${Math.max(1, r.d / maxRaw * 100)}%`, width: `${r.pull / maxRaw * 100}%` }} />}
                  </span>
                  <span className="map2-v">{r.d.toFixed(1)}</span>
                </button>
              );
            })}
          </div>

          {f && (
            <div className="map2-detail" key={focus}>
              <div className="micro">{PERSONA_NAME[f.persona]} · {focus === m.palette ? PALETTE_COPY.chosen : status(focus)}</div>
              <h3 className="map2-title">{f.name}</h3>
              <ColourCode p={f} size="sm" />
              {f.line && <p className="sub">{f.line}</p>}
              <AxisTracks axes={m.axes} other={f.axes} labels={[PALETTE_COPY.you, f.short || f.name]} />
              {fRow && <div className="map2-math micro">
                {fRow.raw.toFixed(1)}{fRow.pull > 0 ? ` − ${fRow.pull.toFixed(1)} ${PALETTE_COPY.personaPull.toLowerCase()}` : ''} = <b>{fRow.d.toFixed(1)}</b>
              </div>}
              {fReady && focus !== m.palette && <button className="btn" onClick={() => choose(focus)}>{PALETTE_COPY.choose}</button>}
            </div>
          )}
        </div>

        <div className="row">
          <button className="btn" onClick={() => go('configurator')}>{PALETTE_COPY.continueCfg}</button>
          <button className="btn-ghost" onClick={() => go('palette')}>{PALETTE_COPY.back}</button>
        </div>
      </div>
    </section>
  );
}
