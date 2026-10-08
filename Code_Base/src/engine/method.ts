/* ══════════════════════════════════════════════════════════════
   ACCORD · THE METHOD ENGINE
   Ported function by function from the reference build
   (accord-demo/app.js). Same rules, same numbers. Pure functions:
   they take the edition, the session's method state and return
   values; nothing here touches the page.
   Function names match app.js so the two can be read side by side.
   ══════════════════════════════════════════════════════════════ */
import type { Edition, Residence } from './types';
import {
  REGISTERS, REGISTER_ORDER, PERSONA_QS, VISUAL_QS, PALETTES, OPTIONS, VARIANTS, ATTR_WEIGHT, PALETTE_SLUG, ROOM_SLUG,
  AXIS_ORDER, ROOM_SHARE, LOCK_STAGES, ALL_BRANDS,
  type Axis, type PersonaId, type RegisterKey, type Option, type OptionSet, type Brand
} from '../library/method';
import { METHOD_PARAMS } from '../library/params';

/* ── the method's part of the session ── */

/** One person answering the persona questions (household mode, brief §4.2). */
export interface Participant {
  name: string;
  answers: (number | null)[];      // option index per question
  at: (string | null)[];           // when each answer was given (ISO)
  dwell: (number | null)[];        // ms spent on each question before answering
}

/** The persona as a combination: shares of the three, the ones that count, and the lead. */
export interface PersonaBlend {
  scores: Record<PersonaId, number>;
  shares: Record<PersonaId, number>;
  ranked: PersonaId[];             // high to low, ties broken by the rule in §4.2
  components: PersonaId[];         // the personas in the combination, lead first
  lead: PersonaId;
}

/** Visual instinct answer: A, both or neither, B (brief §4.4, three-way). */
export type VisualAnswer = 'a' | 'mid' | 'b';

/** One palette in the resolution, with the parts of its distance kept for the map and the log. */
export interface RankRow { id: string; raw: number; pull: number; d: number; }

export interface MethodState {
  personaScores: Record<PersonaId, number>;   // the household's summed vector
  persona: PersonaId | null;                  // the lead persona
  secondPersona: PersonaId | null;            // the second in the combination, else the runner-up
  blend: PersonaBlend | null;
  participants: Participant[];
  pWho: number;                               // which participant is answering
  visualAnswers: (VisualAnswer | null)[];
  ranking: RankRow[];
  register: RegisterKey | null;
  axes: Record<Axis, number>;
  palette: string | null;
  recommended: string | null;
  distances: { id: string; d: number }[];
  pIdx: number;
  vIdx: number;
  room: string;
  rooms: Record<string, Record<string, string>>;   // rooms[room][category] = option id
  tod: 'day' | 'night';
  wtIdx: number;
  brandFilter: { cat: string; reg: string };
  prevPhase: string;
  coherence: number | null;
}

export const ZERO_SCORES = (): Record<PersonaId, number> => ({ HOST: 0, SEEKER: 0, SETTLER: 0 });
export const MID_AXES = (): Record<Axis, number> => ({ warmth: 5, density: 5, indiaRoot: 5, formality: 5, objectDom: 5 });

export const newParticipant = (name: string): Participant => ({
  name, answers: PERSONA_QS.map(() => null), at: PERSONA_QS.map(() => null), dwell: PERSONA_QS.map(() => null)
});

export function initialMethod(): MethodState {
  return {
    personaScores: ZERO_SCORES(), persona: null, secondPersona: null, register: null,
    blend: null, participants: [], pWho: 0, visualAnswers: [], ranking: [],
    axes: MID_AXES(), palette: null, recommended: null, distances: [],
    pIdx: 0, vIdx: 0, room: 'Living Room', rooms: {}, tod: 'day', wtIdx: 0,
    brandFilter: { cat: 'all', reg: 'all' }, prevPhase: 'configurator', coherence: null
  };
}

/* ── money and measure (app.js: carpet, conv, money, area, perArea, regRates, band) ── */
const SQFT_PER_SQM = 10.7639;
export const carpet = (e: Edition, r: Residence) => Math.round(r.carpet || (r.saleable / (e.loading || 1)));
export const conv = (e: Edition, inr: number) => inr * (e.costIndex || 1) / (e.fx || 1);

export function money(e: Edition, n: number | null | undefined): string {
  if (n == null) return '·';
  if (e.currency === 'INR') {
    if (Math.abs(n) >= 10000000) return '₹' + (n / 10000000).toFixed(2) + ' Cr';
    if (Math.abs(n) >= 100000) return '₹' + (n / 100000).toFixed(1) + ' L';
    return '₹' + Math.round(n).toLocaleString('en-IN');
  }
  const big = Math.abs(n) >= 100000;
  return new Intl.NumberFormat(e.locale || 'en', {
    style: 'currency', currency: e.currency,
    ...(big ? { notation: 'compact', maximumSignificantDigits: 3 } : { maximumFractionDigits: 0 })
  } as Intl.NumberFormatOptions).format(n);
}
export const unitLabel = (e: Edition) => e.areaUnit === 'sqm' ? 'sq m' : 'sq ft';
export function area(e: Edition, sqft: number) {
  const v = e.areaUnit === 'sqm' ? sqft / SQFT_PER_SQM : sqft;
  return Math.round(v).toLocaleString(e.locale || 'en-IN') + ' ' + unitLabel(e);
}
export function perArea(e: Edition, perSqft: number) {
  const v = e.areaUnit === 'sqm' ? perSqft * SQFT_PER_SQM : perSqft;
  return money(e, v) + '/' + (e.areaUnit === 'sqm' ? 'm²' : 'sq ft');
}
export function regRates(e: Edition, reg: RegisterKey) {
  const R = REGISTERS[reg]; if (!R || R.rate == null) return null;
  const o = e.rates && e.rates[reg];
  if (o) {
    const k = e.areaUnit === 'sqm' ? 1 / SQFT_PER_SQM : 1;
    return { low: o.low * k, high: o.high * k, mid: (o.mid || (o.low + o.high) / 2) * k };
  }
  return { low: conv(e, R.rateLow!), high: conv(e, R.rateHigh!), mid: conv(e, R.rate) };
}
export function band(e: Edition, reg: RegisterKey, res: Residence) {
  const rr = regRates(e, reg); if (!rr) return null;
  const c = carpet(e, res);
  return { low: rr.low * c, high: rr.high * c, mid: rr.mid * c };
}
export const isAvailable = (e: Edition, id: string) => !!PALETTES[id] && PALETTES[id].status === 'ready' && (e.palettes || []).includes(id);
export const roomsOf = (e: Edition, r: Residence) => r.rooms || e.rooms;

/* ── persona (brief §4.2, production rules) ──────────────────────
   Each answer adds its option's score vector. The persona is read as a
   combination: every persona whose share of the total reaches
   METHOD_PARAMS.blendMin is part of it, the highest first.
   Ties: the persona that led the later of the tied answers wins; if the
   answers cannot break it, METHOD_PARAMS.tieOrder decides (Settler first).
   Household: each participant is read on their own, and the household is
   the sum of their vectors. */
const PERSONAS: PersonaId[] = ['HOST', 'SEEKER', 'SETTLER'];

export function scoresOf(answers: (number | null)[]): Record<PersonaId, number> {
  const s = ZERO_SCORES();
  answers.forEach((oi, qi) => {
    if (oi == null) return;
    const sc = PERSONA_QS[qi].opts[oi].scores;
    PERSONAS.forEach(k => { s[k] += sc[k]; });
  });
  return s;
}

/** Answer sequence, latest last: each entry is the option's score vector. */
type AnswerSeq = Record<PersonaId, number>[];
function seqOf(people: Participant[]): AnswerSeq {
  const rows: { t: string; i: number; sc: Record<PersonaId, number> }[] = [];
  people.forEach(p => p.answers.forEach((oi, qi) => {
    if (oi == null) return;
    rows.push({ t: p.at[qi] || '', i: rows.length, sc: PERSONA_QS[qi].opts[oi].scores });
  }));
  rows.sort((a, b) => (a.t < b.t ? -1 : a.t > b.t ? 1 : a.i - b.i));
  return rows.map(r => r.sc);
}

/** Order personas high to low; break ties by the later answer, then by tieOrder. */
export function rankPersonas(scores: Record<PersonaId, number>, seq: AnswerSeq = []): PersonaId[] {
  const tieRank = (x: PersonaId) => METHOD_PARAMS.tieOrder.indexOf(x);
  const breakTie = (a: PersonaId, b: PersonaId) => {
    for (let i = seq.length - 1; i >= 0; i--) {
      const sa = seq[i][a], sb = seq[i][b];
      if (sa !== sb) return sb - sa;              // the one this answer favoured comes first
    }
    return tieRank(a) - tieRank(b);
  };
  return [...PERSONAS].sort((a, b) => (scores[b] - scores[a]) || breakTie(a, b));
}

export function blendOf(scores: Record<PersonaId, number>, seq: AnswerSeq = []): PersonaBlend {
  const total = PERSONAS.reduce((t, k) => t + scores[k], 0) || 1;
  const shares = { HOST: scores.HOST / total, SEEKER: scores.SEEKER / total, SETTLER: scores.SETTLER / total };
  const ranked = rankPersonas(scores, seq);
  const components = ranked.filter((k, i) => i === 0 || shares[k] >= METHOD_PARAMS.blendMin);
  return { scores, shares, ranked, components, lead: ranked[0] };
}

/** One participant's reading. */
export const blendOfParticipant = (p: Participant) => blendOf(scoresOf(p.answers), seqOf([p]));

/** The household's reading: the sum of every participant's vector. */
export function householdBlend(people: Participant[]): PersonaBlend {
  const s = ZERO_SCORES();
  people.forEach(p => { const v = scoresOf(p.answers); PERSONAS.forEach(k => { s[k] += v[k]; }); });
  return blendOf(s, seqOf(people));
}

/** Fields the rest of the app reads (persona, secondPersona), from a blend. */
export function resolvePersona(b: PersonaBlend) {
  return { persona: b.lead, secondPersona: b.components[1] ?? b.ranked[1], blend: b, personaScores: b.scores };
}

/** Where household members agree and differ (shown on the reveal). */
export function householdReading(people: Participant[]) {
  const done = people.filter(p => p.answers.every(a => a != null));
  const leads = done.map(p => blendOfParticipant(p).lead);
  const sameLead = leads.length > 1 && leads.every(l => l === leads[0]);
  // the first question where people chose options led by different personas
  let splitQ = -1;
  for (let qi = 0; qi < PERSONA_QS.length && splitQ < 0; qi++) {
    const ls = done.map(p => { const sc = PERSONA_QS[qi].opts[p.answers[qi]!].scores; return rankPersonas(sc)[0]; });
    if (ls.some(l => l !== ls[0])) splitQ = qi;
  }
  return { people: done, leads, sameLead, splitQ };
}

export const PERSONA_COUNT = PERSONA_QS.length;

/** The persona questions start again: one participant (the buyer), nothing answered. */
export const startPersonaPatch = (buyerName: string): Partial<MethodState> => ({
  pIdx: 0, pWho: 0, personaScores: ZERO_SCORES(), persona: null, secondPersona: null, blend: null,
  participants: [newParticipant(buyerName || 'You')]
});

/* ── visual instinct (brief §4.4, three-way answer) ──
   The answers are stored; the axis values are derived from them, so the
   mapping can change later without losing a session. */
export const VISUAL_DIR: Record<VisualAnswer, number> = { a: -1, mid: 0, b: 1 };
export function axesFrom(answers: (VisualAnswer | null)[]): Record<Axis, number> {
  const axes = MID_AXES();
  answers.forEach((ans, qi) => {
    if (!ans) return;
    const ax = VISUAL_QS[qi].axis;
    axes[ax] = Math.max(0, Math.min(10, 5 + VISUAL_DIR[ans] * METHOD_PARAMS.visualStep));
  });
  return axes;
}

/* ── palette (brief §4.5, production rules) ──────────────────────
   raw  = weighted Euclidean distance on the five axes
   pull = personaWeight × (share of the palette's persona ÷ share of the lead),
          only for personas in the combination; the lead gets the full weight
   d    = raw − pull
   recommended = nearest palette that is ready and offered by this edition. */
export function resolvePalette(e: Edition, axes: Record<Axis, number>, blend: PersonaBlend | PersonaId) {
  const b: PersonaBlend = typeof blend === 'string'
    ? blendOf({ ...ZERO_SCORES(), [blend]: 1 } as Record<PersonaId, number>)
    : blend;
  const W = METHOD_PARAMS.axisWeight;
  const lead = b.shares[b.lead] || 1;
  const ranking: RankRow[] = [];
  Object.values(PALETTES).forEach(p => {
    if (!p.axes) return;
    let raw = 0;
    (Object.keys(axes) as Axis[]).forEach(a => { raw += (W[a] ?? 1) * Math.pow(axes[a] - p.axes[a], 2); });
    raw = Math.sqrt(raw);
    const pull = b.components.includes(p.persona) ? METHOD_PARAMS.personaWeight * Math.min(1, b.shares[p.persona] / lead) : 0;
    ranking.push({ id: p.id, raw, pull, d: raw - pull });
  });
  ranking.sort((x, y) => x.d - y.d);
  const nearestReady = ranking.find(o => isAvailable(e, o.id)) || ranking[0];
  return { ranking, distances: ranking.map(r => ({ id: r.id, d: r.d })), recommended: nearestReady.id };
}

/* ── configurator (optionSet, applyDefaults, findOpt, selected) ── */
export function optionSet(palette: string, room: string): OptionSet {
  return (OPTIONS[palette] && OPTIONS[palette][room]) || OPTIONS['seeker-p01'][room] || {};
}
/** Every category of `room` that has no choice yet gets the highest-tier option at or below the register. */
export function applyDefaults(rooms: MethodState['rooms'], palette: string, room: string, register: RegisterKey) {
  const cur = { ...(rooms[room] || {}) };
  const set = optionSet(palette, room);
  const tierIdx = (t: RegisterKey) => REGISTER_ORDER.indexOf(t);
  Object.keys(set).forEach(cat => {
    if (cur[cat]) return;
    const opts = set[cat];
    let best = opts[0];
    opts.forEach(o => { if (tierIdx(o.tier) <= tierIdx(register) && tierIdx(o.tier) >= tierIdx(best.tier)) best = o; });
    cur[cat] = best.id;
  });
  return { ...rooms, [room]: cur };
}
export function findOpt(m: MethodState, room: string, cat: string, id?: string): Option | null {
  const set = optionSet(m.palette!, room);
  return (set[cat] || []).find(o => o.id === id) || null;
}
export function selected(m: MethodState, room: string) {
  const set = optionSet(m.palette!, room), out: { cat: string; opt: Option }[] = [];
  Object.keys(set).forEach(cat => {
    const o = findOpt(m, room, cat, (m.rooms[room] || {})[cat]);
    if (o) out.push({ cat, opt: o });
  });
  return out;
}
export const SIDEBAR_ORDER = ['wall', 'flooring', 'cabinetry', 'lighting', 'seating', 'textiles'];

/* ── render resolution (wantedAttrs, productionFile, legacyRender) ── */
export function wantedAttrs(m: MethodState, room: string) {
  const out: Record<string, string> = {};
  selected(m, room).forEach(({ opt }) => { if (opt.attr) out[opt.attr] = opt.value!; });
  return out;
}
export function productionFile(m: MethodState, room: string, tod: 'day' | 'night'): string | null {
  const pal = PALETTE_SLUG[m.palette!], rm = ROOM_SLUG[room], axes = AXIS_ORDER[room];
  if (!pal || !rm || !axes) return null;
  const want = wantedAttrs(m, room);
  if (axes.some(a => !want[a])) return null;
  return `rooms/${pal}__${rm}__${axes[0]}-${want[axes[0]]}__${axes[1]}-${want[axes[1]]}__${tod}.jpg`;
}
export function legacyRender(m: MethodState, room: string) {
  const variants = (VARIANTS[m.palette!] && VARIANTS[m.palette!][room]) || [];
  if (!variants.length) return { img: null as string | null, score: 0, max: 0, misses: [] as string[] };
  const want = wantedAttrs(m, room);
  let best = variants[0], bestScore = -1, bestMiss: string[] = [];
  variants.forEach(v => {
    let score = 0; const miss: string[] = [];
    Object.keys(want).forEach(a => {
      const w = ATTR_WEIGHT[a] || 1;
      if (v.attrs[a] === want[a]) score += w; else if (v.attrs[a] !== undefined || Object.keys(v.attrs).length) miss.push(a);
    });
    if (score > bestScore) { bestScore = score; best = v; bestMiss = miss; }
  });
  const max = Object.keys(want).reduce((t, a) => t + ((variants[0].attrs[a] !== undefined) ? (ATTR_WEIGHT[a] || 1) : 0), 0);
  return { img: best.img as string | null, score: bestScore, max, misses: bestMiss };
}

/* ── cost (computeTotal, categoryBaseline) ── */
function categoryBaseline(m: MethodState, room: string, cat: string) {
  const opts = (optionSet(m.palette!, room)[cat] || []).filter(o => o.lump);
  if (!opts.length) return 0;
  const mine = opts.find(o => o.tier === m.register);
  return (mine || opts[0]).lump!;
}
export function computeTotal(e: Edition, m: MethodState, res: Residence) {
  if (!m.register) return null;
  const c = carpet(e, res), b = band(e, m.register, res);
  if (!b) return null;
  let sqftDelta = 0, lump = 0, upgrades = 0;
  Object.keys(m.rooms).forEach(room => {
    selected(m, room).forEach(({ cat, opt }) => {
      if (opt.d) sqftDelta += conv(e, opt.d) * (ROOM_SHARE[room] || 0.15) * c;
      if (opt.lump) lump += conv(e, opt.lump - categoryBaseline(m, room, cat));
      if (REGISTER_ORDER.indexOf(opt.tier) > REGISTER_ORDER.indexOf(m.register!)) upgrades++;
    });
  });
  const base = b.mid;
  return { base, delta: sqftDelta + lump, total: base + sqftDelta + lump, low: b.low, high: b.high, upgrades };
}

/* ── coherence (warmthOf, complexityOf, coherenceWarning, runCoherence) ── */
function warmthOf(m: MethodState, room: string, excludeCat: string | null) {
  const vals = selected(m, room).filter(s => s.cat !== excludeCat).map(s => s.opt.warmth || 2);
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
}
function complexityOf(m: MethodState, room: string, excludeCat: string | null) {
  return selected(m, room).filter(s => s.cat !== excludeCat)
    .reduce((t, s) => t + Math.max(0, (s.opt.texture || 1) - 1) + Math.max(0, (s.opt.pattern || 1) - 1), 0);
}
export function coherenceWarning(m: MethodState, room: string, cat: string, opt: Option) {
  const anchor = warmthOf(m, room, cat);
  const budget = PALETTES[m.palette!].complexityBudget || 12;
  const cx = complexityOf(m, room, cat) + Math.max(0, (opt.texture || 1) - 1) + Math.max(0, (opt.pattern || 1) - 1);
  const w: string[] = [];
  if (anchor !== null && Math.abs((opt.warmth || 2) - anchor) > 1) w.push('Temperature conflict with this room');
  if (cx > budget) w.push('Complexity above the palette budget');
  return w.join(' · ');
}
export interface CoherenceItem { k: 'warn' | 'good'; t: string; s: string; }
export function runCoherence(e: Edition, m: MethodState, res: Residence) {
  const items: CoherenceItem[] = [];
  let score = 100;
  const budget = PALETTES[m.palette!].complexityBudget || 12;
  const R = REGISTERS[m.register!];
  const cxReadout: string[] = [];
  roomsOf(e, res).forEach(room => {
    if (!m.rooms[room]) return;
    const cx = complexityOf(m, room, null);
    cxReadout.push(room + ' ' + cx);
    const warmths = selected(m, room).map(s => s.opt.warmth || 2);
    const spread = warmths.length ? Math.max(...warmths) - Math.min(...warmths) : 0;
    if (cx > budget) {
      score -= 8;
      items.push({ k: 'warn', t: room + ': complexity ' + cx + ' against a budget of ' + budget,
        s: 'Two or more textured or patterned elements are competing here. The palette still holds, but the room will read busier than the reference interiors. Simplify one surface, usually the wall.' });
    }
    if (spread > 1) {
      score -= 6;
      items.push({ k: 'warn', t: room + ': temperature spread',
        s: 'A cool material and a warm material are sharing this room with nothing mediating between them. In this palette the floor is what usually bridges the two.' });
    }
  });
  items.push({ k: 'good', t: 'Complexity budget ' + budget + ' · ' + cxReadout.join(' · '),
    s: 'Every room is scored on texture and pattern against the budget this palette can carry. Rooms inside the budget read as composed rather than busy.' });

  const all: Option[] = [];
  Object.keys(m.rooms).forEach(room => selected(m, room).forEach(s => all.push(s.opt)));
  const above = all.filter(o => REGISTER_ORDER.indexOf(o.tier) > REGISTER_ORDER.indexOf(m.register!));
  if (above.length) {
    score -= Math.min(12, above.length * 4);
    items.push({ k: 'warn', t: above.length + ' selection' + (above.length > 1 ? 's' : '') + ' above the ' + R.name + ' register',
      s: above.map(o => o.name).join(', ') + '. Permitted, and priced in. Flagged because the rest of the home is specified a tier below and the difference will be visible.' });
  } else {
    items.push({ k: 'good', t: 'Register consistent throughout',
      s: 'Every selection sits at or below the ' + R.name + ' threshold. Nothing in the home will look out of place beside anything else.' });
  }

  const longest = all.reduce((mx, o) => Math.max(mx, o.lead || 0), 0);
  items.push({ k: 'good', t: 'Longest lead item: ' + longest + ' weeks',
    s: 'Procurement can be released at the booking lock stage without delaying handover, provided the surfaces are confirmed within four weeks of booking.' });

  const t = computeTotal(e, m, res);
  if (t && t.total > t.high) {
    score -= 10;
    items.push({ k: 'warn', t: 'Estimate above the register band',
      s: 'The configuration prices at ' + money(e, t.total) + ' against a ' + R.name + ' band of ' + money(e, t.low) + ' to ' + money(e, t.high) + '. Either move to the next register or return one upgraded selection to its tier.' });
  }
  score = Math.max(40, Math.min(100, score));
  const verdict = score >= 92 ? 'Fully coherent. This configuration is ready to lock.' :
    score >= 78 ? 'Coherent, with one or two decisions worth revisiting.' :
      'Workable, but the home is fighting itself in places.';
  return { score, verdict, items };
}

/* ── the Accord (configId) ── */
export function configId(e: Edition, m: MethodState, ref: string, now = new Date()) {
  const pc = ({ HOST: 'HST', SEEKER: 'SKR', SETTLER: 'STL' } as Record<string, string>)[m.persona || ''] || 'XXX';
  const pl = PALETTES[m.palette!].id.split('-')[1].toUpperCase();
  const rc = (m.register || '').slice(0, 3);
  const stamp = '' + now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0');
  const pre = e.refPrefix;
  return `${pre}-${ref.replace(new RegExp('^' + pre + '-'), '')}-${pc}-${pl}-${rc}-${stamp}`;
}

/* ── brands available to this edition (by region) ── */
export function brandsFor(e: Edition): Brand[] {
  return ALL_BRANDS.filter(b => (b.regions || ['IN']).some(x => (e.brandRegions || ['IN']).includes(x)));
}

export { LOCK_STAGES };
