/* ══════════════════════════════════════════════════════════════
   FLOOR PLAN · one plate, flat, with its units as live areas
   The units are the outlines drawn in the architect's file. Hovering
   one makes it glow; clicking chooses it.
   ══════════════════════════════════════════════════════════════ */
import type { Plate } from '../../engine/types';
import type { UnitStatus } from '../../engine/crm';

interface Props {
  plate: Plate;
  width: number;
  height: number;
  src: (p: string) => string;
  hoveredUnit: string | null;
  selectedUnit: string | null;
  onHoverUnit: (id: string | null) => void;
  onChooseUnit: (id: string) => void;
  statusOf?: (tag: string) => UnitStatus | null;
}

export function FloorPlan({ plate, width, height, src, hoveredUnit, selectedUnit, onHoverUnit, onChooseUnit, statusOf }: Props) {
  return (
    <svg className="floorplan" viewBox={`0 0 ${width} ${height}`} role="group" aria-label={`${plate.title}, residences`}
      onPointerLeave={() => onHoverUnit(null)}>
      <defs>
        <filter id="unit-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <image href={src(plate.plan)} x="0" y="0" width={width} height={height} />
      {plate.units.map(u => {
        const state = selectedUnit === u.id ? 'sel' : hoveredUnit === u.id ? 'hover' : 'idle';
        const st = statusOf?.(u.id) ?? null;
        return (
          <g key={u.id} className={`unit unit-${state}${u.residenceId ? '' : ' unpriced'}${st ? ` st-${st}` : ''}`}
            onPointerEnter={() => onHoverUnit(u.id)}
            onClick={() => onChooseUnit(u.id)}
            tabIndex={0} role="button" aria-label={`${u.id}, ${u.typology}${st && st !== 'unsold' ? `, ${st}` : ''}`}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChooseUnit(u.id); } }}
            onFocus={() => onHoverUnit(u.id)}>
            <polygon className="unit-glow" points={u.points} filter="url(#unit-glow)" />
            <polygon className="unit-area" points={u.points} />
            <g className="unit-tag" transform={`translate(${u.tag[0]} ${u.tag[1]})`}>
              <circle r="22" />
              <text textAnchor="middle" dy="7">{u.id}</text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
