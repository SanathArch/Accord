/* ══════════════════════════════════════════════════════════════
   01 · RESIDENCE
   Purpose: confirm the home (brief §7, phase 1).
   Left: the tower as stacked plates (TowerStack). Hover a floor to
   read it, click to open its plan. Right: the plan of that floor
   with its units live (FloorPlan), the residence types, Continue.
   Sold and blocked residences come from the developer's CRM file
   (crm/CrmProvider) and are shaded on the tower and on the plan.
   Writes: residence/choose (residence, floor, unit).
   An edition without a tower shows the residence types only.
   ══════════════════════════════════════════════════════════════ */
import { useMemo, useState } from 'react';
import { TowerStack } from './TowerStack';
import { FloorPlan } from './FloorPlan';
import { floorsOf, floorsForResidence, ordinal, plateRange } from '../../engine/tower';
import { editionAsset } from '../../editions/registry';
import { useSession } from '../../state/SessionProvider';
import { useCrm } from '../../crm/CrmProvider';
import { statusOf, type UnitStatus } from '../../engine/crm';
import type { Edition, Residence } from '../../engine/types';
import './residence.css';

const SQM = 10.7639;
function area(e: Edition, sqft: number) {
  const v = e.areaUnit === 'sqm' ? sqft / SQM : sqft;
  return `${Math.round(v).toLocaleString(e.locale)} ${e.areaUnit === 'sqm' ? 'sq m' : 'sq ft'}`;
}
const carpet = (e: Edition, r: Residence) => Math.round(r.carpet ?? r.saleable / (e.loading || 1));

export function ResidenceScreen() {
  const { state, edition, dispatch, showToast } = useSession();
  const crm = useCrm();
  const alias = edition.crm?.floorAlias;
  const st = (floor: number, tag: string): UnitStatus | null => statusOf(crm.inventory, floor, tag, alias);
  const tower = edition.tower;
  const src = (p: string) => editionAsset(edition, p);
  const floors = useMemo(() => (tower ? floorsOf(tower) : []), [tower]);
  const residence = edition.residences.find(r => r.id === state.residenceId) ?? edition.residences[0];
  const marked = useMemo(() => floorsForResidence(residence), [residence]);

  const [hoverFloor, setHoverFloor] = useState<number | null>(null);
  const [hoverUnit, setHoverUnit] = useState<string | null>(null);
  const [openFloor, setOpenFloor] = useState<number | null>(state.floor);

  const shownFloor = hoverFloor ?? openFloor;
  const shown = shownFloor != null ? floors.find(f => f.n === shownFloor) ?? null : null;
  const openPlate = openFloor != null ? floors.find(f => f.n === openFloor)?.plate ?? null : null;
  const unit = openPlate?.units.find(u => u.id === (hoverUnit ?? (state.floor === openFloor ? state.unit : null))) ?? null;

  function chooseResidence(r: Residence) {
    dispatch({ type: 'residence/choose', residenceId: r.id, floor: null, unit: null });
  }
  function selectFloor(n: number) {
    const f = floors.find(x => x.n === n);
    if (!f?.plate) { showToast(`${ordinal(n)} floor: drawing not supplied yet`); return; }
    setOpenFloor(n); setHoverUnit(null);
  }
  function chooseUnit(id: string) {
    if (openFloor == null || !openPlate) return;
    const u = openPlate.units.find(x => x.id === id); if (!u) return;
    const status = st(openFloor, u.id);
    if (status === 'sold' || status === 'blocked') { showToast(`${u.id} on the ${ordinal(openFloor)} floor is ${status}`); return; }
    if (!u.residenceId) { showToast(`${u.typology} on the ${ordinal(openFloor)} floor is not set up for pricing yet`); return; }
    dispatch({ type: 'residence/choose', residenceId: u.residenceId, floor: openFloor, unit: u.id });
    const r = edition.residences.find(x => x.id === u.residenceId);
    showToast(`${r?.name ?? u.typology} · ${ordinal(openFloor)} floor · ${u.id}`);
  }

  /* ── no tower in this edition: residence types only ── */
  if (!tower) {
    return (
      <section className="phase residence residence-simple">
        <div className="res-panel">
          <Head edition={edition} title={<>Choose your <em>residence</em>.</>} sub="The floor plates and key plans appear here once the developer's drawings are loaded." />
          <ResidenceCards edition={edition} selectedId={residence.id} onChoose={chooseResidence} />
          <Actions onContinue={() => dispatch({ type: 'nav/go', phase: 'intro' })} />
        </div>
      </section>
    );
  }

  const units = shown?.plate?.units.length ?? 0;
  const soldHere = shown?.plate ? shown.plate.units.filter(u => { const x = st(shown.n, u.id); return x === 'sold' || x === 'blocked'; }).length : 0;
  const unitStatus = unit && openFloor != null ? st(openFloor, unit.id) : null;
  return (
    <section className="phase residence">
      <div className="res-stage">
        <TowerStack tower={tower} src={src} hovered={hoverFloor} selected={openFloor}
          marked={marked} onHover={setHoverFloor} onSelect={selectFloor}
          statusOf={edition.crm ? st : undefined} />
        <div className="res-stage-cap">
          {edition.crm && (
            <span className="legend">
              <i className="sw sold" />Sold<i className="sw blocked" />Blocked<i className="sw open" />Available
            </span>
          )}
          <span className="micro">Floors {tower.lowest === 0 ? 'G' : tower.lowest} to {tower.highest}</span>
          <span className="micro dim">Scroll to rise through the tower. Hover to read a floor, click to open its plan.</span>
        </div>
      </div>

      <div className="res-panel">
        <Head edition={edition}
          title={shown ? <>{shown.n === 0 ? 'Ground' : <>{ordinal(shown.n)}</>} <em>floor</em></> : <>Choose your <em>floor</em>.</>}
          sub={shown
            ? shown.plate
              ? `${shown.plate.title} · ${shown.typical ? `floors ${plateRange(shown.plate)}` : 'one floor'} · ${units} residence${units === 1 ? '' : 's'}${edition.crm ? ` · ${units - soldHere} available` : ''}`
              : `${shown.ghost?.title ?? 'Level'} · drawing not supplied yet`
            : `${floors.length} levels, from the ground to the ${ordinal(tower.highest)}. Floors marked in the accent are where the ${residence.name} is offered.`} />

        {edition.crm && <Availability file={edition.crm.file} />}

        <div className={`res-plan${openPlate ? '' : ' empty'}`}>
          {openPlate ? (
            <>
              <FloorPlan plate={openPlate} width={tower.width} height={tower.height} src={src}
                hoveredUnit={hoverUnit} selectedUnit={state.floor === openFloor ? state.unit : null}
                onHoverUnit={setHoverUnit} onChooseUnit={chooseUnit}
                statusOf={edition.crm ? (tag => st(openFloor!, tag)) : undefined} />
              <div className="res-plan-cap">
                <span className="micro">{ordinal(openFloor!)} floor plan · {openPlate.title}</span>
                {hoverFloor != null && hoverFloor !== openFloor && <span className="micro dim">Click the tower to open the {ordinal(hoverFloor)}</span>}
              </div>
            </>
          ) : (
            <p className="res-plan-hint">Select a floor in the tower to open its plan. Each residence on the plan can be chosen.</p>
          )}
        </div>

        <div className="res-unit" aria-live="polite">
          {unit ? (
            <>
              <b>{unit.id}</b>
              {unitStatus && unitStatus !== 'unsold' && <em className={`st-badge ${unitStatus}`}>{unitStatus}</em>}
              <span>{unit.typology}{unit.residenceId ? ` · ${edition.residences.find(r => r.id === unit.residenceId)?.name}` : ''}</span>
              {(() => { const r = edition.residences.find(x => x.id === unit.residenceId); return r ? <span className="dim">{area(edition, r.saleable)} saleable · {area(edition, carpet(edition, r))} carpet · {r.baths} baths</span> : <span className="dim">Not set up for pricing yet</span>; })()}
              {unit.note && <span className="dim">{unit.note}</span>}
            </>
          ) : state.floor != null && state.unit ? (
            <><b>{state.unit}</b><span>{residence.name} · {ordinal(state.floor)} floor</span><span className="dim">Your residence</span></>
          ) : (
            <span className="dim">{openPlate ? 'Hover a residence on the plan to read it. Click to choose it.' : ' '}</span>
          )}
        </div>

        <ResidenceCards edition={edition} selectedId={residence.id} onChoose={chooseResidence} />
        <Actions onContinue={() => dispatch({ type: 'nav/go', phase: 'intro' })} />
      </div>
    </section>
  );
}

function Head({ edition, title, sub }: { edition: Edition; title: React.ReactNode; sub: string }) {
  return (
    <header className="res-head">
      <div className="kicker">01 · Residence · {edition.project}</div>
      <h2 className="display sm">{title}</h2>
      <p className="res-sub">{sub}</p>
    </header>
  );
}

/* availability counts and the link to the CRM spreadsheet */
function Availability({ file }: { file: string }) {
  const crm = useCrm();
  const c = crm.counts;
  const when = crm.inventory?.fileModified ?? crm.inventory?.readAt;
  const time = when ? new Date(when).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
  return (
    <div className="avail">
      <div className="avail-counts">
        <span><b className="sold">{c.sold}</b> sold</span>
        <span><b className="blocked">{c.blocked}</b> blocked</span>
        <span><b>{c.unsold}</b> available</span>
      </div>
      <div className="avail-src">
        <span className={`dot ${crm.mode}`} />
        <span className="micro dim">
          {crm.mode === 'live' ? `Live from ${crm.inventory?.source ?? file} · saved ${time}` :
           crm.mode === 'reconnect' ? `${file} was connected before. Allow reading it again.` :
           crm.mode === 'snapshot' ? `Snapshot of ${file} · ${time}` : 'No CRM data'}
        </span>
        {crm.mode !== 'live' && (crm.canLink
          ? <button className="chip" onClick={crm.mode === 'reconnect' ? crm.reconnect : crm.connect}>
              {crm.mode === 'reconnect' ? 'Reconnect' : 'Connect CRM file'}
            </button>
          : <label className="chip">Load CRM file
              <input type="file" accept=".xlsx" hidden onChange={e => { const f = e.target.files?.[0]; if (f) crm.loadOnce(f); }} />
            </label>)}
      </div>
      {crm.error && <span className="micro avail-err">Last read failed: {crm.error}. Showing the previous data.</span>}
    </div>
  );
}

function ResidenceCards({ edition, selectedId, onChoose }: { edition: Edition; selectedId: string; onChoose: (r: Residence) => void }) {
  return (
    <div className="res-cards" role="group" aria-label="Residence type">
      {edition.residences.map(r => (
        <button key={r.id} className="res-card" aria-pressed={r.id === selectedId} onClick={() => onChoose(r)}>
          <b>{r.name}</b>
          <span>{area(edition, r.saleable)} saleable</span>
        </button>
      ))}
    </div>
  );
}

function Actions({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="res-actions">
      <button className="btn" onClick={onContinue}>Continue</button>
    </div>
  );
}
