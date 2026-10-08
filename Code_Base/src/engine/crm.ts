/* ══════════════════════════════════════════════════════════════
   ACCORD · INVENTORY (CRM) RULES
   Unit numbers follow the developer's scheme: floor, then a two-
   digit position on that floor (301 = floor 3, residence 1; 1204 =
   floor 12, residence 4). Position n is the unit tagged Fn in the
   floor drawing. Pure functions, no DOM.
   ══════════════════════════════════════════════════════════════ */

export type UnitStatus = 'sold' | 'blocked' | 'unsold';

export interface Inventory {
  source: string;                         // file name it was read from
  readAt: string;                         // ISO time it was read
  fileModified: string | null;            // the file's own save time, if known
  units: Record<string, UnitStatus>;      // "floor-position" → status, e.g. "33-2"
  configs: Record<string, string>;        // "floor-position" → config as written, e.g. "3BHK"
  skipped: number;                        // rows that could not be read
}

export const unitKey = (floor: number, position: number) => `${floor}-${position}`;

export function parseUnitNo(v: unknown): { floor: number; position: number } | null {
  const s = String(v ?? '').trim();
  if (!/^\d{3,4}$/.test(s)) return null;
  return { floor: Number(s.slice(0, -2)), position: Number(s.slice(-2)) };
}

export function parseStatus(v: unknown): UnitStatus | null {
  const s = String(v ?? '').trim().toLowerCase();
  if (!s) return null;
  if (s.startsWith('unsold') || s.startsWith('avail') || s === 'open') return 'unsold';
  if (s.startsWith('sold') || s.startsWith('booked')) return 'sold';
  if (s.startsWith('block') || s.startsWith('hold') || s.startsWith('reserved')) return 'blocked';
  return null;
}

/** Build an inventory from table rows (first matching header row decides the columns). */
export function inventoryFromRows(rows: unknown[][], source: string, fileModified: string | null): Inventory {
  const hdr = rows.findIndex(r => r.some(c => /unit\s*no/i.test(String(c ?? ''))) && r.some(c => /sold/i.test(String(c ?? ''))));
  if (hdr < 0) throw new Error('No header row with "Unit No" and "Sold / Unsold" was found');
  const h = rows[hdr].map(c => String(c ?? '').trim());
  const cUnit = h.findIndex(c => /unit\s*no/i.test(c));
  const cStatus = h.findIndex(c => /sold/i.test(c));
  const cConfig = h.findIndex(c => /^config/i.test(c));
  const units: Record<string, UnitStatus> = {}, configs: Record<string, string> = {};
  let skipped = 0;
  for (const r of rows.slice(hdr + 1)) {
    const u = parseUnitNo(r[cUnit]);
    if (!u) { if (r[cUnit] != null && String(r[cUnit]).trim() && !/total/i.test(String(r[cUnit]))) skipped++; continue; }
    const st = parseStatus(r[cStatus]);
    if (!st) { skipped++; continue; }
    units[unitKey(u.floor, u.position)] = st;
    if (cConfig >= 0 && r[cConfig] != null) configs[unitKey(u.floor, u.position)] = String(r[cConfig]).trim();
  }
  return { source, readAt: new Date().toISOString(), fileModified, units, configs, skipped };
}

/** Status of the unit tagged `tag` (F1, F2…) on `floor`. `alias` maps a floor to the floor
 *  whose units it belongs to (the upper level of a duplex). */
export function statusOf(inv: Inventory | null, floor: number, tag: string, alias?: Record<number, number>): UnitStatus | null {
  if (!inv) return null;
  const m = /^F?(\d+)$/i.exec(tag.trim()); if (!m) return null;
  const f = alias?.[floor] ?? floor;
  return inv.units[unitKey(f, Number(m[1]))] ?? null;
}

export function summarize(inv: Inventory | null) {
  const out = { sold: 0, blocked: 0, unsold: 0, total: 0 };
  if (!inv) return out;
  Object.values(inv.units).forEach(s => { out[s]++; out.total++; });
  return out;
}
