/* ══════════════════════════════════════════════════════════════
   FEATURED BRANDS
   Reference: accord-demo #p-brands; app.js openBrands,
   backFromBrands, renderBrands, setBrandFilter.
   ══════════════════════════════════════════════════════════════ */
import { BRAND_ANCHORS, CAT_LABEL, REGISTERS, type RegisterKey } from '../../library/method';
import { brandsFor } from '../../engine/method';
import type { Phase } from '../../engine/phases';
import { useMethod } from './common';
import './method.css';

export function BrandsScreen() {
  const { m, edition: E, set, go } = useMethod();
  const BRANDS = brandsFor(E);
  const back = () => go((m.prevPhase || 'configurator') as Phase);
  const f = m.brandFilter;
  const setFilter = (k: 'cat' | 'reg', v: string) => set('brands/filter', { brandFilter: { ...f, [k]: v } });

  if (!BRANDS.length) {
    return (
      <section id="p-brands" className="phase active">
        <div className="brands">
          <div className="brands-head">
            <div>
              <div className="kicker">Featured brands</div>
              <h2 className="display sm">The people who <em>make</em> it</h2>
              <p className="sub">No brands in the library are listed for this edition’s region yet. Regional sourcing is part of onboarding.</p>
            </div>
            <button className="btn-ghost sm" onClick={back}>Back</button>
          </div>
        </div>
      </section>
    );
  }

  const byId = Object.fromEntries(BRANDS.map(b => [b.id, b]));
  const cats = ['all', ...Array.from(new Set(BRANDS.map(b => b.category)))];
  const rows = BRANDS.filter(b => (f.cat === 'all' || b.category === f.cat) && (f.reg === 'all' || b.register.includes(f.reg as RegisterKey)))
    .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

  return (
    <section id="p-brands" className="phase active">
      <div className="brands">
        <div className="brands-head">
          <div>
            <div className="kicker">Featured brands</div>
            <h2 className="display sm">The people who <em>make</em> it</h2>
            <p className="sub">{`${BRANDS.length} suppliers researched, with a verified route to purchase for ${E.location}. `
              + 'Every one of them can be specified against a register, a palette and a lead time. This is the procurement spine of Accord: '
              + 'the renders are the argument, this is the proof.'}</p>
          </div>
          <button className="btn-ghost sm" onClick={back}>Back</button>
        </div>
        <div className="anchor-grid">
          {(E.brandAnchors || BRAND_ANCHORS).map(id => {
            const b = byId[id]; if (!b) return null;
            return (
              <article className="anchor" key={id}>
                <div className="anchor-top"><b>{b.name}</b><span className="tag">{b.register.join(' · ').toLowerCase()}</span></div>
                <div className="anchor-meta">{CAT_LABEL[b.category] || b.category} · {b.origin}{b.founded ? ' · est. ' + b.founded : ''}</div>
                <p className="anchor-sig">{b.signature}</p>
                <p className="anchor-why">{b.why}</p>
                <div className="anchor-foot"><span>{b.india_contact}</span><span>{b.lead_weeks} wks</span></div>
              </article>
            );
          })}
        </div>
        <h3 className="sec">Full catalogue</h3>
        <div className="brand-filters">
          {cats.map(c => <button key={c} className={`chip${f.cat === c ? ' on' : ''}`} onClick={() => setFilter('cat', c)}>{c === 'all' ? 'All categories' : (CAT_LABEL[c] || c)}</button>)}
          <span className="chip-sep" />
          {(['all', 'COMPOSED', 'PROVENANCE', 'ATELIER'] as const).map(r => (
            <button key={r} className={`chip${f.reg === r ? ' on' : ''}`} onClick={() => setFilter('reg', r)}>{r === 'all' ? 'All registers' : REGISTERS[r].name}</button>
          ))}
        </div>
        <div className="brand-table">
          <div className="brow brow-head"><span>Brand</span><span>What they make</span><span>Route to purchase</span><span>Register</span><span>Lead</span></div>
          {rows.map(b => (
            <div className="brow" key={b.id}>
              <span className="bname">{b.name}{!b.verified && <i className="unver" title="Not yet verified">unverified</i>}</span>
              <span className="bsig">{b.subcategory}<i>{b.origin}</i></span>
              <span className="broute">{b.india_contact}</span>
              <span className="breg">{b.register.map(r => r[0] + r.slice(1).toLowerCase()).join(', ')}</span>
              <span className="blead">{b.lead_weeks} wks</span>
            </div>
          ))}
        </div>
        <p className="fineprint">{`${rows.length} of ${BRANDS.length} shown. Brands marked unverified need a call before they are quoted to a resident. `
          + 'Prices and lead times are indicative and are confirmed at the booking lock stage.'}</p>
      </div>
    </section>
  );
}
