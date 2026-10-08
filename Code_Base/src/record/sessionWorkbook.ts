/* ══════════════════════════════════════════════════════════════
   SESSION RECORD
   Everything the buyer selects in one session, as rows for Excel.
   Pure functions: session state + edition in, sheets out.
   The activity log is rebuilt by replaying the session's actions,
   so each row can say in words what was chosen.
   ══════════════════════════════════════════════════════════════ */
import type { Edition } from '../engine/types';
import type { Action, SessionState } from '../engine/session';
import { RAIL_LABEL, type Phase } from '../engine/phases';
import {
  area, carpet, computeTotal, configId, findOpt, initialMethod, money, selected,
  type MethodState, type Participant, type PersonaBlend, type VisualAnswer
} from '../engine/method';
import { CATEGORY_LABEL, PALETTES, PERSONA_QS, REGISTERS, VISUAL_QS, AXIS_LABEL, type Axis } from '../library/method';
import { PERSONA_NAME } from '../library/params';
import type { Cell, OutSheet } from './xlsxWrite';

export interface RecordContext {
  unitStatus?: string | null;      // from the CRM, if the unit was chosen on the tower
}

const pct = (x: number) => Math.round(x * 100);
const when = (iso: string | null | undefined) => (iso ? new Date(iso) : null);
export const stamp = (iso: string | null | undefined) => {
  const d = when(iso); if (!d) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};
const label = (b: PersonaBlend | null) => {
  if (!b) return '';
  const n = b.components.map(k => PERSONA_NAME[k] ?? k);
  return n.length === 1 ? n[0] : n.length === 2 ? `${n[0]} & ${n[1]}` : `${n[0]}, ${n[1]} & ${n[2]}`;
};
const screenName = (p: Phase) => (p === 'entry' ? '00 · Home' : RAIL_LABEL[p] || p);
const paletteName = (id: string | null | undefined) => (id ? PALETTES[id]?.name ?? id : '');
const registerName = (k: string | null | undefined) => (k ? (REGISTERS as Record<string, { name: string }>)[k]?.name ?? k : '');
const catName = (c: string) => CATEGORY_LABEL[c] || c;
const visualText = (qi: number, a: VisualAnswer | null) => {
  const q = VISUAL_QS[qi]; if (!q || !a) return '';
  return a === 'a' ? `A · ${q.a.caption}` : a === 'b' ? `B · ${q.b.caption}` : 'Both or neither';
};
const personaText = (qi: number, oi: number | null) => {
  const q = PERSONA_QS[qi]; if (!q || oi == null) return '';
  return `Option ${oi + 1} · ${q.opts[oi]?.text ?? ''}`;
};

/** File name for a session: Accord_<date>_<time>_<buyer>_<unit ref>.xlsx */
export function sessionFileName(s: SessionState): string {
  const d = when(s.startedAt) ?? new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  const safe = (x: string) => x.trim().replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, '-').slice(0, 40) || 'buyer';
  return `Accord_${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}_${safe(s.buyerName)}_${safe(s.unitRef)}.xlsx`;
}

/** The session id kept in the All Sessions sheet (one row per session). */
export const sessionId = (s: SessionState) => `${s.startedAt ?? ''}|${s.buyerName}|${s.unitRef}`;

/* ── activity log: replay the actions and describe each in words ── */
function describe(a: Action, prev: MethodState, next: MethodState, e: Edition): { what: string; detail: string } {
  switch (a.type) {
    case 'session/start': return { what: 'Session started', detail: `Buyer ${a.buyerName.trim()} · unit reference ${a.unitRef}` };
    case 'session/restart': return { what: 'Session restarted', detail: '' };
    case 'edition/select': return { what: 'Edition', detail: a.editionId };
    case 'residence/choose': {
      const r = e.residences.find(x => x.id === a.residenceId);
      return { what: 'Residence chosen', detail: [r?.name ?? a.residenceId, a.floor != null ? `floor ${a.floor}` : '', a.unit ? `unit ${a.unit}` : ''].filter(Boolean).join(' · ') };
    }
    case 'nav/go': return { what: 'Screen', detail: screenName(a.phase) };
    case 'nav/back': return { what: 'Back', detail: '' };   // the screen column shows where it went from
    case 'm/set': break;
  }
  const ev = a.event;
  const changedAnswer = () => {
    const out: string[] = [];
    next.participants.forEach((p, pi) => p.answers.forEach((ans, qi) => {
      const before = prev.participants[pi]?.answers[qi];
      if (ans !== before) {
        out.push(ans == null
          ? `${p.name} · ${PERSONA_QS[qi]?.label ?? 'Q' + (qi + 1)}: answer cleared`
          : `${p.name} · ${PERSONA_QS[qi]?.label ?? 'Q' + (qi + 1)}: ${personaText(qi, ans)}${p.dwell[qi] != null ? ` (${(p.dwell[qi]! / 1000).toFixed(1)} s)` : ''}`);
      }
    }));
    return out.join('; ');
  };
  switch (ev) {
    case 'persona/start': return { what: 'Persona questions started', detail: next.participants.map(p => p.name).join(', ') };
    case 'persona/answer': return { what: 'Persona answer', detail: changedAnswer() };
    case 'persona/previous': return { what: 'Persona answer cleared', detail: changedAnswer() };
    case 'persona/resolved': return { what: 'Persona resolved', detail: [changedAnswer(), `Persona: ${label(next.blend)}`].filter(Boolean).join('; ') };
    case 'persona/participant-add': return { what: 'Person added', detail: next.participants[next.participants.length - 1]?.name ?? '' };
    case 'persona/participant-remove': {
      const gone = prev.participants.filter(p => !next.participants.includes(p)).map(p => p.name);
      return { what: 'Person removed', detail: gone.join(', ') };
    }
    case 'register/pick': return { what: 'Register chosen', detail: registerName(next.register) };
    case 'visual/answer':
    case 'visual/previous': {
      const out: string[] = [];
      const n = Math.max(prev.visualAnswers.length, next.visualAnswers.length);
      for (let i = 0; i < n; i++) {
        const x = next.visualAnswers[i] ?? null, y = prev.visualAnswers[i] ?? null;
        if (x !== y) out.push(`${VISUAL_QS[i]?.label ?? 'Visual ' + (i + 1)}: ${x ? visualText(i, x) : 'answer cleared'}`);
      }
      return { what: ev === 'visual/answer' ? 'Instinct answer' : 'Instinct answer cleared', detail: out.join('; ') };
    }
    case 'palette/resolved': return { what: 'Palette recommended', detail: paletteName(next.recommended) };
    case 'palette/choose': return { what: 'Palette chosen', detail: paletteName(next.palette) };
    case 'walkthrough/enter': return { what: 'Walk through opened', detail: paletteName(next.palette) };
    case 'walkthrough/frame': return { what: 'Walk through frame', detail: `Frame ${next.wtIdx + 1}` };
    case 'configurator/enter': return { what: 'Configurator opened', detail: next.room };
    case 'configurator/room': return { what: 'Room', detail: next.room };
    case 'configurator/tod': return { what: 'Time of day', detail: next.tod };
    case 'configurator/reset-room': return { what: 'Room reset to curated default', detail: next.room };
    case 'configurator/select': {
      const out: string[] = [];
      Object.keys(next.rooms).forEach(room => Object.entries(next.rooms[room] || {}).forEach(([cat, id]) => {
        if ((prev.rooms[room] || {})[cat] !== id) {
          const o = findOpt(next, room, cat, id);
          out.push(`${room} · ${catName(cat)}: ${o ? `${o.name} (${o.brand})` : id}`);
        }
      }));
      return { what: 'Selection', detail: out.join('; ') };
    }
    case 'coherence/run': return { what: 'Coherence reviewed', detail: next.coherence != null ? `${next.coherence} / 100` : '' };
    case 'brands/open': return { what: 'Brands opened', detail: '' };
    case 'brands/filter': return { what: 'Brands filter', detail: `category ${next.brandFilter.cat} · register ${next.brandFilter.reg}` };
    default: return { what: ev, detail: Object.keys(a.patch).join(', ') };
  }
}

function activityRows(s: SessionState, e: Edition): Cell[][] {
  let m = initialMethod(), phase: Phase = 'entry', hist: Phase[] = [];
  const start = s.startedAt;
  const rows: Cell[][] = [['Time', 'Screen', 'Step', 'What was selected', 'Event']];
  let inSession = false;
  s.log.forEach(({ t, action: a }) => {
    if (a.type === 'session/restart' || a.type === 'edition/select') m = initialMethod();
    const prev = m;
    if (a.type === 'm/set') m = { ...m, ...a.patch };
    if (a.type === 'session/start' && t === start) inSession = true;
    if (inSession) {
      const d = describe(a, prev, m, e);
      rows.push([stamp(t), screenName(phase), d.what, d.detail, a.type === 'm/set' ? a.event : a.type]);
    }
    if (a.type === 'nav/go' && a.phase !== phase) { hist.push(phase); phase = a.phase; }
    if (a.type === 'nav/back' && hist.length) phase = hist.pop()!;
    if (a.type === 'session/start') { hist = ['entry']; phase = 'residence'; }
    if (a.type === 'session/restart') { hist = []; phase = 'entry'; inSession = false; }
  });
  return rows;
}

/* ── the overview row: also used, one line per session, in the All Sessions workbook ── */
export const SUMMARY_COLS = [
  'Session ID', 'Started', 'Last updated', 'Buyer', 'Unit reference', 'Project', 'Edition', 'Residence', 'Saleable area', 'Carpet area',
  'Floor', 'Unit', 'Unit status (CRM)', 'People answering', 'Persona', 'Lead persona', 'Second persona',
  'Host share %', 'Seeker share %', 'Settler share %', 'Register',
  'Warmth', 'Density', 'Rootedness', 'Formality', 'The object',
  'Recommended palette', 'Chosen palette', 'Rooms configured', 'Selections', 'Coherence', 'Indicative total', 'Band low', 'Band high',
  'Configuration ID', 'Current screen', 'Excel file'
] as const;

export function summaryRow(s: SessionState, e: Edition, ctx: RecordContext = {}): Record<string, Cell> {
  const m = s.m;
  const res = e.residences.find(r => r.id === s.residenceId) ?? e.residences[0];
  const t = m.register ? computeTotal(e, m, res) : null;
  const sh = m.blend?.shares;
  const nSel = Object.keys(m.rooms).reduce((n, room) => n + (m.palette ? selected(m, room).length : 0), 0);
  const axis = (k: Axis) => (m.visualAnswers.length || m.palette ? Math.round(m.axes[k] * 10) / 10 : null);
  let cid = '';
  try { if (m.palette && m.register) cid = configId(e, m, s.unitRef, when(s.startedAt) ?? new Date()); } catch { /* palette without code */ }
  return {
    'Session ID': sessionId(s),
    'Started': stamp(s.startedAt),
    'Last updated': stamp(s.log[s.log.length - 1]?.t ?? null),
    'Buyer': s.buyerName,
    'Unit reference': s.unitRef,
    'Project': e.project,
    'Edition': e.label,
    'Residence': res?.name ?? s.residenceId,
    'Saleable area': res ? area(e, res.saleable) : '',
    'Carpet area': res ? area(e, carpet(e, res)) : '',
    'Floor': s.floor,
    'Unit': s.unit,
    'Unit status (CRM)': ctx.unitStatus === 'unsold' ? 'available' : ctx.unitStatus ?? '',
    'People answering': m.participants.map(p => p.name).join(', '),
    'Persona': label(m.blend),
    'Lead persona': m.persona ? PERSONA_NAME[m.persona] ?? m.persona : '',
    'Second persona': m.secondPersona ? PERSONA_NAME[m.secondPersona] ?? m.secondPersona : '',
    'Host share %': sh ? pct(sh.HOST) : null,
    'Seeker share %': sh ? pct(sh.SEEKER) : null,
    'Settler share %': sh ? pct(sh.SETTLER) : null,
    'Register': registerName(m.register),
    'Warmth': axis('warmth'), 'Density': axis('density'), 'Rootedness': axis('indiaRoot'),
    'Formality': axis('formality'), 'The object': axis('objectDom'),
    'Recommended palette': paletteName(m.recommended),
    'Chosen palette': paletteName(m.palette),
    'Rooms configured': Object.keys(m.rooms).filter(r => Object.keys(m.rooms[r] || {}).length).join(', '),
    'Selections': nSel || null,
    'Coherence': m.coherence,
    'Indicative total': t ? money(e, t.total) : '',
    'Band low': t ? money(e, t.low) : '',
    'Band high': t ? money(e, t.high) : '',
    'Configuration ID': cid,
    'Current screen': screenName(s.phase),
    'Excel file': sessionFileName(s)
  };
}

/* ── the session workbook ── */
export function sessionWorkbook(s: SessionState, e: Edition, ctx: RecordContext = {}): OutSheet[] {
  const m = s.m;
  const sum = summaryRow(s, e, ctx);

  const overview: Cell[][] = [['Field', 'Value'], ...SUMMARY_COLS.map(k => [k, sum[k]] as Cell[])];

  const persona: Cell[][] = [['Person', 'Question', 'Question text', 'Answer', 'Answered at', 'Time taken (s)', 'Host', 'Seeker', 'Settler']];
  m.participants.forEach((p: Participant) => p.answers.forEach((ans, qi) => {
    const q = PERSONA_QS[qi], sc = ans != null ? q?.opts[ans]?.scores : null;
    persona.push([p.name, q?.label ?? `Q${qi + 1}`, q?.text ?? '', personaText(qi, ans), stamp(p.at[qi]),
      p.dwell[qi] != null ? Math.round(p.dwell[qi]! / 100) / 10 : null, sc?.HOST ?? null, sc?.SEEKER ?? null, sc?.SETTLER ?? null]);
  }));

  const instinct: Cell[][] = [['Question', 'Axis', 'Question text', 'Answer', 'Axis value (0–10)']];
  VISUAL_QS.forEach((q, i) => {
    const ans = m.visualAnswers[i] ?? null;
    instinct.push([q.label, AXIS_LABEL[q.axis], q.text, visualText(i, ans), ans ? m.axes[q.axis] : null]);
  });

  const ranking: Cell[][] = [['Rank', 'Palette', 'Palette id', 'Distance', 'Axis distance', 'Persona pull', 'Recommended', 'Chosen']];
  m.ranking.forEach((r, i) => ranking.push([i + 1, paletteName(r.id), r.id, +r.d.toFixed(3), +r.raw.toFixed(3), +r.pull.toFixed(3),
    r.id === m.recommended ? 'yes' : '', r.id === m.palette ? 'yes' : '']));

  const config: Cell[][] = [['Room', 'Category', 'Option id', 'Selection', 'Brand', 'Tier', 'Lead time (weeks)', 'Lock stage', 'Note']];
  if (m.palette) Object.keys(m.rooms).forEach(room => selected(m, room).forEach(({ cat, opt }) => {
    config.push([room, catName(cat), opt.id, opt.name, opt.brand, registerName(opt.tier), opt.lead, opt.lock.replace(/_/g, ' '), opt.note]);
  }));

  return [
    { name: 'Overview', rows: overview, widths: [24, 60] },
    { name: 'Persona answers', rows: persona },
    { name: 'Instinct', rows: instinct },
    { name: 'Palette ranking', rows: ranking },
    { name: 'Configuration', rows: config },
    { name: 'Activity log', rows: activityRows(s, e), widths: [20, 22, 26, 80, 24] }
  ];
}
