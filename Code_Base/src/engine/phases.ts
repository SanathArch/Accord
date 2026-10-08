/* The flow, in order. Phase ids match the reference build (accord-demo/app.js PHASES),
   with brands and bespoke as side branches. See ACCORD-DEVELOPER-BRIEF.md §4.1 and §7. */

export const PHASES = [
  'entry', 'residence', 'intro', 'persona', 'persona-reveal', 'register', 'visual',
  'resolving', 'palette', 'palette-map', 'walkthrough', 'configurator', 'coherence', 'summary'
] as const;

export type MainPhase = typeof PHASES[number];
export type Phase = MainPhase | 'brands' | 'bespoke';

export const RAIL_LABEL: Record<Phase, string> = {
  entry: '',
  residence: '01 · Residence',
  intro: '02 · The process',
  persona: '03 · Who you are',
  'persona-reveal': '03 · Who you are',
  register: '04 · Register',
  visual: '05 · Instinct',
  resolving: '06 · Resolving',
  palette: '07 · Your palette',
  'palette-map': '07 · Your palette',
  walkthrough: '08 · Walk through',
  configurator: '09 · Configure',
  coherence: '10 · Coherence',
  summary: '11 · The Accord',
  brands: 'Featured brands',
  bespoke: 'Bespoke'
};

/** 0 to 1 along the main flow; side branches hold the position they were opened from. */
export function progressOf(phase: Phase): number {
  const i = (PHASES as readonly string[]).indexOf(phase);
  if (i < 0) return 1;
  return i / (PHASES.length - 1);
}
