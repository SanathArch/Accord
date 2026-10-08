/* ══════════════════════════════════════════════════════════════
   LIBRARY · METHOD PARAMETERS
   The numbers the method runs on (brief §4.2, §4.4, §4.5). They are
   library settings, owned by the OuTSDe research team, not constants
   in the engine. Change a value here and every edition follows.
   ══════════════════════════════════════════════════════════════ */
import type { Axis, PersonaId } from './method';

export const METHOD_PARAMS = {
  /** Up to this many people can answer the persona questions in one session (household mode). */
  maxParticipants: 3,

  /** A persona is part of the combination when its share of the score is at least this (0 to 1). */
  blendMin: 0.28,

  /** On a tie that the answers cannot break, this order decides (brief §4.2: Settler first). */
  tieOrder: ['SETTLER', 'SEEKER', 'HOST'] as PersonaId[],

  /** Visual instinct: how far one answer moves its axis (A = −step, both or neither = 0, B = +step). */
  visualStep: 2.5,

  /** Palette distance: weight of each axis. All equal by default. */
  axisWeight: { warmth: 1, density: 1, indiaRoot: 1, formality: 1, objectDom: 1 } as Record<Axis, number>,

  /** Palette distance: a palette authored for a persona in your combination is brought this much closer,
      scaled by that persona's share relative to your leading persona (the lead gets all of it). */
  personaWeight: 1.5,

  /** Resolving screen: the longest it may run, in milliseconds (brief §11, defect 13). */
  resolvingMs: 3000
};

/** Display names, in the order the method reads them. */
export const PERSONA_ORDER: PersonaId[] = ['HOST', 'SEEKER', 'SETTLER'];
export const PERSONA_NAME: Record<PersonaId, string> = { HOST: 'Host', SEEKER: 'Seeker', SETTLER: 'Settler' };

/** Interface copy for the redesigned persona and palette screens (brief §8.7 voice). */
export const WHO_COPY = {
  kicker: 'Who you are',
  progress: (i: number, n: number) => `Question ${String(i).padStart(2, '0')} of ${String(n).padStart(2, '0')}`,
  answering: 'Answering',
  addPerson: 'Add a person',
  personPlaceholder: 'Name',
  previous: 'Previous question',
  handover: (name: string) => `Now, ${name}.`,
  handoverSub: 'The same five questions. Answer for yourself, not for the household.',
  handoverGo: 'Begin',
  liveScores: 'Live reading',
  revealKicker: 'You are',
  revealKickerHousehold: 'Your household is',
  composition: 'Composition',
  balanced: 'A balance of all three',
  withA: (name: string) => `With the ${name}'s instinct.`,
  agreeAll: (n: number, name: string) => `${n === 2 ? 'You both' : 'You all'} lead with the ${name}.`,
  leadSplit: 'You lead with different instincts.',
  splitOn: (topic: string) => `You split on ${topic}.`,
  agreeOn: 'You answered every question the same way.',
  addAnother: 'Add another person',
  cont: 'Continue'
};

export const INSTINCT_COPY = {
  kicker: 'Instinct',
  progress: (i: number, n: number) => `Image ${String(i).padStart(2, '0')} of ${String(n).padStart(2, '0')}`,
  middle: 'Both, or neither',
  middleSub: 'Leaves this one in the middle',
  previous: 'Previous image',
  readout: 'Your five axes'
};

export const RESOLVING_COPY = {
  kicker: 'Resolving',
  title: 'Measuring the distance to nine interiors.',
  skip: 'Skip'
};

export const PALETTE_COPY = {
  residenceFor: (label: string) => `A residence for the ${label}`,
  colourCode: 'The colour code',
  whyKicker: 'Why this palette',
  you: 'You',
  palette: 'Palette',
  nearest: 'Nearest alternative',
  walk: 'Walk through this home',
  how: 'See how this was resolved',
  mapKicker: 'Resolution map',
  mapTitleA: 'Nine interiors. ',
  mapTitleEm: 'Yours',
  mapTitleB: ' is the closest.',
  mapSub: 'Each palette holds a position on the five axes. Accord measures the distance from your answers to each one, brings the palettes written for your persona a little closer, and recommends the nearest one that is ready. You may choose another: the system stays coherent either way.',
  distance: 'Distance',
  personaPull: 'Persona pull',
  recommended: 'Recommended',
  chosen: 'Chosen',
  available: 'Available',
  notInEdition: 'Not in this edition',
  inProduction: 'Render set in production',
  choose: 'Choose this palette',
  continueCfg: 'Continue to the configurator',
  back: 'Back',
  resetNote: 'A new palette starts the rooms again from its defaults.'
};
