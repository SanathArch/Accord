/* The persona as a position between three corners (Host, Seeker, Settler).
   A pure persona sits near its corner; a combination sits between them.
   Household mode: one small point per person, the household in the accent. */
import type { PersonaId } from '../../library/method';
import { PERSONA_NAME } from '../../library/params';

const W = 520, H = 470, PAD = 46;
const C: Record<PersonaId, [number, number]> = {
  HOST: [W / 2, PAD],
  SEEKER: [PAD, H - PAD],
  SETTLER: [W - PAD, H - PAD]
};
const KEYS: PersonaId[] = ['HOST', 'SEEKER', 'SETTLER'];

export function pointOf(shares: Record<PersonaId, number>): [number, number] {
  let x = 0, y = 0;
  KEYS.forEach(k => { x += shares[k] * C[k][0]; y += shares[k] * C[k][1]; });
  return [x, y];
}

function lerp(a: [number, number], b: [number, number], t: number): [number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

export interface ChartPoint { label: string; shares: Record<PersonaId, number>; main?: boolean; }

export function PersonaTriangle({ points, components }: { points: ChartPoint[]; components: PersonaId[] }) {
  const tri = KEYS.map(k => C[k].join(',')).join(' ');
  // fine grid at thirds, parallel to each side
  const grid: [number, number, number, number][] = [];
  [1 / 3, 2 / 3].forEach(t => {
    KEYS.forEach((k, i) => {
      const a = C[k], b = C[KEYS[(i + 1) % 3]], c = C[KEYS[(i + 2) % 3]];
      const p = lerp(a, b, t), q = lerp(a, c, t);
      grid.push([p[0], p[1], q[0], q[1]]);
    });
  });
  const main = points.find(p => p.main) ?? points[0];
  const mp = main ? pointOf(main.shares) : null;
  return (
    <svg className="ptri" viewBox={`0 0 ${W} ${H}`} role="img"
      aria-label={`Persona position: ${KEYS.map(k => `${PERSONA_NAME[k]} ${Math.round((main?.shares[k] ?? 0) * 100)} percent`).join(', ')}`}>
      <defs>
        <radialGradient id="ptri-glow">
          <stop offset="0" stopColor="var(--accent)" stopOpacity=".55" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <polygon points={tri} className="ptri-face" />
      {grid.map((g, i) => <line key={i} x1={g[0]} y1={g[1]} x2={g[2]} y2={g[3]} className="ptri-grid" />)}
      {/* pull lines from the point to each corner in the combination */}
      {mp && components.map(k => (
        <line key={k} x1={mp[0]} y1={mp[1]} x2={C[k][0]} y2={C[k][1]} className="ptri-pull" />
      ))}
      <polygon points={tri} className="ptri-edge" />
      {KEYS.map(k => {
        const [x, y] = C[k];
        const on = components.includes(k);
        const dy = k === 'HOST' ? -18 : 30;
        return (
          <g key={k} className={`ptri-corner${on ? ' on' : ''}`}>
            <circle cx={x} cy={y} r={on ? 5 : 3.5} />
            <text x={x} y={y + dy} textAnchor="middle">{PERSONA_NAME[k].toUpperCase()}</text>
            <text x={x} y={y + dy + (k === 'HOST' ? -15 : 17)} textAnchor="middle" className="ptri-pct">
              {Math.round((main?.shares[k] ?? 0) * 100)}%
            </text>
          </g>
        );
      })}
      {points.filter(p => !p.main).map((p, i) => {
        const [x, y] = pointOf(p.shares);
        return (
          <g key={i} className="ptri-person">
            <circle cx={x} cy={y} r="7" />
            <text x={x + 12} y={y + 4}>{p.label}</text>
          </g>
        );
      })}
      {mp && <>
        <circle cx={mp[0]} cy={mp[1]} r="46" fill="url(#ptri-glow)" className="ptri-halo" />
        <circle cx={mp[0]} cy={mp[1]} r="9" className="ptri-main" />
      </>}
    </svg>
  );
}
