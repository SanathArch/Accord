/* ══════════════════════════════════════════════════════════════
   ACCORD · TOWER LOGIC
   Expands an edition's plates into one entry per floor, and reads
   which floors a residence is sold on. Pure functions, no DOM.
   ══════════════════════════════════════════════════════════════ */
import type { Plate, Residence, Tower } from './types';

export interface FloorEntry {
  n: number;                    // floor number
  plate: Plate | null;          // null = no drawing for this floor
  ghost: { stack: string; title: string } | null;
  typical: boolean;             // the plate repeats on more than one floor
}

export function floorsOf(t: Tower): FloorEntry[] {
  const out: FloorEntry[] = [];
  for (let n = t.lowest; n <= t.highest; n++) {
    const plate = t.plates.find(p => n >= p.from && n <= p.to) ?? null;
    const g = plate ? null : t.ghosts.find(r => n >= r.from && n <= r.to) ?? null;
    out.push({ n, plate, ghost: g ? { stack: g.stack, title: g.title } : null, typical: !!plate && plate.to > plate.from });
  }
  return out;
}

/** "6th to 18th, 20th to 28th" → [6..18, 20..28] */
export function parseFloors(text: string): number[] {
  const out: number[] = [];
  text.split(',').forEach(part => {
    const nums = (part.match(/\d+/g) || []).map(Number);
    if (nums.length === 1) out.push(nums[0]);
    if (nums.length >= 2) for (let n = nums[0]; n <= nums[1]; n++) out.push(n);
  });
  return out;
}

export function floorsForResidence(r: Residence): Set<number> { return new Set(parseFloors(r.floors)); }

export const ordinal = (n: number) => {
  if (n === 0) return 'Ground';
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export const plateRange = (p: Plate) => (p.to > p.from ? `${p.from}–${p.to}` : `${p.from}`);
