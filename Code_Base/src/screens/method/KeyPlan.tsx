/* ══════════════════════════════════════════════════════════════
   KEY PLAN · the buyer's own floor and residence
   Draws the floor plate chosen on the Residence tower, with every
   residence outlined and the chosen one filled in the accent.
   Used on the configurator stage and on the Accord.
   If no floor was chosen on the tower, it shows the residence type's
   own unit on the first floor that type is sold on, drawn the same
   way, so every plan in the app looks alike.
   ══════════════════════════════════════════════════════════════ */
import { floorsOf, ordinal, parseFloors, plateRange } from '../../engine/tower';
import { useMethod } from './common';

export function useChosenPlate() {
  const { state, edition, residence } = useMethod();
  const tower = edition.tower;
  if (!tower) return null;
  const floors = floorsOf(tower);
  // 1. the floor and residence picked on the tower
  if (state.floor != null && state.unit) {
    const f = floors.find(x => x.n === state.floor);
    const unit = f?.plate?.units.find(u => u.id === state.unit);
    if (f?.plate && unit) return { tower, floor: f.n, plate: f.plate, unit, typical: f.typical, chosen: true };
  }
  // 2. otherwise the residence type's own unit, on the first floor it is sold on
  for (const n of parseFloors(residence.floors)) {
    const f = floors.find(x => x.n === n);
    if (!f?.plate) continue;
    const unit = f.plate.units.find(u => u.id === residence.unit && (!u.residenceId || u.residenceId === residence.id))
      ?? f.plate.units.find(u => u.residenceId === residence.id);
    if (unit) return { tower, floor: f.n, plate: f.plate, unit, typical: f.typical, chosen: false };
  }
  return null;
}

/** "4 BHK Sky Residence · 38th floor · unit F2", or without the floor when none was picked */
export function unitLine(name: string, c: NonNullable<ReturnType<typeof useChosenPlate>>) {
  return `${name}${c.chosen ? ` · ${ordinal(c.floor)} floor` : ''} · unit ${c.unit.id}`;
}

/** "Typical Sky floor, floors 35–42, 3 residences" */
export function plateLine(c: NonNullable<ReturnType<typeof useChosenPlate>>) {
  const n = c.plate.units.length;
  return `${c.plate.title}${c.typical ? `, floors ${plateRange(c.plate)}` : ''}, ${n} residence${n === 1 ? '' : 's'}`;
}

export function KeyPlanDrawing({ className }: { className?: string }) {
  const { EA } = useMethod();
  const c = useChosenPlate();
  if (!c) return null;
  const { tower, plate, unit } = c;

  // frame the plate: bounding box of its residences, with a margin
  const pts = plate.units.flatMap(u => u.points.split(' ').map(p => p.split(',').map(Number)));
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const pad = 40;
  const x0 = Math.max(0, Math.min(...xs) - pad), y0 = Math.max(0, Math.min(...ys) - pad);
  const x1 = Math.min(tower.width, Math.max(...xs) + pad), y1 = Math.min(tower.height, Math.max(...ys) + pad);

  return (
    <svg className={className} viewBox={`${x0} ${y0 - 70} ${x1 - x0} ${y1 - y0 + 70}`}
      role="img" aria-label={`Key plan, ${ordinal(c.floor)} floor, residence ${unit.id}`}>
      <image href={EA(plate.stack)} x="0" y="0" width={tower.width} height={tower.height} opacity="0.9" />
      {plate.units.map(u => (
        <polygon key={u.id} points={u.points}
          fill={u.id === unit.id ? 'var(--accent)' : 'rgba(243,237,227,.04)'}
          fillOpacity={u.id === unit.id ? 0.9 : 1}
          stroke={u.id === unit.id ? 'var(--accent)' : 'rgba(243,237,227,.45)'}
          strokeWidth={u.id === unit.id ? 5 : 3} />
      ))}
      <text x={x0 + 12} y={y0 - 20} fill="var(--accent)" fontFamily="Space Mono, monospace" fontSize="44" letterSpacing="2">{unit.id}</text>
    </svg>
  );
}
