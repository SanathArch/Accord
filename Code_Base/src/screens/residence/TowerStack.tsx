/* ══════════════════════════════════════════════════════════════
   TOWER STACK · the building as stacked floor plates, axonometric
   Every floor from the edition's lowest to highest is one slab. A
   typical plate ("35-42") is drawn once per floor it covers. Floors
   without a drawing are outline ghosts. Tags on the right name each
   floor; brackets name each typical band.
   Hover reads a floor, click selects it. The floors are spaced wider
   than the stage, so the mouse wheel moves up and down the tower;
   it opens at the ground floor.
   ══════════════════════════════════════════════════════════════ */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Tower } from '../../engine/types';
import type { UnitStatus } from '../../engine/crm';
import { floorsOf, plateRange } from '../../engine/tower';

const RX = 58;   // tilt, degrees
const RZ = -22;  // turn, degrees
const SPREAD = 3; // floor spacing, as a multiple of the spacing that would fit the stage; >1 means the tower scrolls
const rad = (d: number) => (d * Math.PI) / 180;

interface Props {
  tower: Tower;
  src: (p: string) => string;
  hovered: number | null;
  selected: number | null;
  marked: Set<number>;               // floors where the chosen residence type is sold
  onHover: (n: number | null) => void;
  onSelect: (n: number) => void;
  statusOf?: (floor: number, tag: string) => UnitStatus | null;   // from the CRM
}

export function TowerStack({ tower, src, hovered, selected, marked, onHover, onSelect, statusOf }: Props) {
  const floors = useMemo(() => floorsOf(tower), [tower]);
  const wrap = useRef<HTMLDivElement>(null);      // scrolling viewport
  const content = useRef<HTMLDivElement>(null);   // the full height of the tower
  const lastY = useRef<number | null>(null);
  const floorEls = useRef<(HTMLDivElement | null)[]>([]);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [ys, setYs] = useState<number[]>([]);

  // size the stack to the stage
  useEffect(() => {
    const el = wrap.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const n = floors.length;
  const aspect = tower.height / tower.width;
  const layout = useMemo(() => {
    if (!box.w || !box.h) return null;
    let pw = Math.min(box.w * 0.74, 640);
    const plateProj = (w: number) => (w * Math.abs(Math.sin(rad(RZ))) + w * aspect * Math.cos(rad(RZ))) * Math.cos(rad(RX));
    let gap = (box.h * 0.9 - plateProj(pw)) / ((n - 1) * Math.sin(rad(RX)));
    if (gap < 6) { gap = 6; pw = Math.min(pw, (box.h * 0.9 - (n - 1) * gap * Math.sin(rad(RX))) / ((Math.abs(Math.sin(rad(RZ))) + aspect * Math.cos(rad(RZ))) * Math.cos(rad(RX)))); }
    gap = Math.min(gap, 16) * SPREAD;
    const step = gap * Math.sin(rad(RX));
    const pad = box.h * 0.12;
    return { pw, ph: pw * aspect, gap, step, height: plateProj(pw) + (n - 1) * step + pad * 2 };
  }, [box, n, aspect]);

  // where each floor lands on screen, for the tags and for hover
  useLayoutEffect(() => {
    if (!layout || !content.current) return;
    const top = content.current.getBoundingClientRect().top;
    setYs(floorEls.current.map(el => {
      if (!el) return 0;
      const r = el.getBoundingClientRect();
      return r.top + r.height / 2 - top;
    }));
  }, [layout]);

  // open at the ground floor
  const opened = useRef(false);
  useLayoutEffect(() => {
    if (!layout || !wrap.current || opened.current) return;
    wrap.current.scrollTop = wrap.current.scrollHeight;
    opened.current = true;
  }, [layout]);

  function floorAt(clientY: number): number | null {
    if (!content.current || !ys.length) return null;
    const y = clientY - content.current.getBoundingClientRect().top;
    let best = -1, d = Infinity;
    ys.forEach((fy, i) => { const dd = Math.abs(fy - y); if (dd < d) { d = dd; best = i; } });
    return best >= 0 && d < (layout ? layout.step + 30 : 30) ? floors[best].n : null;
  }

  const hoveredPlate = hovered != null ? floors.find(f => f.n === hovered)?.plate ?? null : null;
  const showEvery = layout && layout.step < 9 ? 2 : 1;

  return (
    <div className="tower-wrap" ref={wrap}
      onPointerMove={e => { lastY.current = e.clientY; onHover(floorAt(e.clientY)); }}
      onPointerLeave={() => { lastY.current = null; onHover(null); }}
      onScroll={() => { if (lastY.current != null) onHover(floorAt(lastY.current)); }}
      onClick={e => { const f = floorAt(e.clientY); if (f != null) onSelect(f); }}
      role="group" aria-label="Floors of the tower">
      <div className="tower-content" ref={content} style={{ height: layout ? layout.height : '100%' }}>
      {layout && (
        <div className="tower-scene" style={{
          width: layout.pw, height: layout.ph,
          transform: `translate(-50%, -50%) translateY(${((n - 1) * layout.step) / 2}px) rotateX(${RX}deg) rotateZ(${RZ}deg)`
        }}>
          {floors.map((f, i) => {
            const isHover = hovered === f.n, isSel = selected === f.n;
            const sibling = !isHover && hoveredPlate && f.plate === hoveredPlate;
            const state = isSel ? 'sel' : isHover ? 'hover' : sibling ? 'sibling' : marked.has(f.n) ? 'marked' : 'idle';
            return (
              <div key={f.n} ref={el => { floorEls.current[i] = el; }}
                className={`floor floor-${state}${hovered != null ? ' dimmed' : ''}${f.plate ? '' : ' ghost'}`}
                style={{ transform: `translateZ(${i * layout.gap}px)` }}>
                {f.plate ? <>
                  {statusOf && (
                    <svg className="floor-status" viewBox={`0 0 ${tower.width} ${tower.height}`} aria-hidden="true">
                      {f.plate.units.map(u => {
                        const st = statusOf(f.n, u.id);
                        return st === 'sold' || st === 'blocked'
                          ? <polygon key={u.id} className={`st-${st}`} points={u.points} /> : null;
                      })}
                    </svg>
                  )}
                  <img className="line" src={src(f.plate.stack)} alt="" draggable={false} />
                  <img className="mark" src={src(f.plate.stackMark)} alt="" draggable={false} />
                  <img className="on" src={src(f.plate.stackOn)} alt="" draggable={false} />
                </> : f.ghost ? <img className="line" src={src(f.ghost.stack)} alt="" draggable={false} /> : null}
              </div>
            );
          })}
        </div>
      )}

      {/* floor tags and typical bands */}
      <div className="tower-tags" aria-hidden="true">
        {ys.length === n && floors.map((f, i) => {
          const on = hovered === f.n || selected === f.n;
          if (!on && f.n % showEvery !== 0 && f.n !== tower.highest) return null;
          return (
            <span key={f.n} className={`ftag${on ? ' on' : ''}${marked.has(f.n) ? ' marked' : ''}${f.plate ? '' : ' none'}`}
              style={{ top: ys[i] }}>{f.n === 0 ? 'G' : f.n}</span>
          );
        })}
        {ys.length === n && tower.plates.filter(p => p.to > p.from).map(p => {
          const iFrom = floors.findIndex(f => f.n === p.from), iTo = floors.findIndex(f => f.n === p.to);
          const y1 = ys[iTo], y2 = ys[iFrom];
          const active = hoveredPlate === p, h = Math.max(2, y2 - y1);
          return (
            <div key={p.id} className={`band${active ? ' on' : ''}`} style={{ top: y1, height: h }}
              title={`Typical floors ${plateRange(p)}`}>
              {h >= 34 && <span>{plateRange(p)}</span>}
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}
