/* ══════════════════════════════════════════════════════════════
   ACCORD · ENGINE TYPES
   The engine never names a project, city, currency or unit size.
   Everything project-specific arrives as an Edition.
   ══════════════════════════════════════════════════════════════ */

export type PersonaId = 'HOST' | 'SEEKER' | 'SETTLER';
export type RegisterId = 'COMPOSED' | 'PROVENANCE' | 'ATELIER' | 'BESPOKE';
export type AreaUnit = 'sqft' | 'sqm';

/** One residence type an edition sells. Areas are always held in sq ft. */
export interface Residence {
  id: string;
  rooms?: string[];          // configurable rooms; defaults to the edition's
  name: string;
  unit: string;
  saleable: number;          // sq ft
  carpet?: number;           // sq ft; else saleable / loading
  floors: string;
  baths: number;
  plan: string | null;       // edition asset path
  keyplan: string | null;    // edition asset path (vector)
  plate: string | null;
  note: string;
}

/* ── the tower: stacked floor plates (optional per edition) ── */
export interface PlateUnit {
  id: string;                 // tag in the drawing: F1, F2…
  typology: string;           // '3 BHK', read from the drawing
  residenceId: string | null; // the edition residence it sells as; null = not set up yet
  points: string;             // SVG polygon points in plan pixels
  tag: [number, number];      // where the unit's tag sits
  note?: string;
}
export interface Plate {
  id: string;                 // drawing name, e.g. '35-42'
  from: number;               // first floor this plate is used on
  to: number;                 // last floor (same as from for a one-off floor)
  title: string;
  plan: string;               // flat plan image (edition asset)
  stack: string;              // stack image: outline
  stackMark: string;          // outline in the accent (residence type sold here)
  stackOn: string;            // full drawing in the accent (floor being read)
  units: PlateUnit[];
}
export interface GhostRange { from: number; to: number; stack: string; title: string; }
export interface Tower {
  lowest: number;
  highest: number;
  width: number;              // plan pixel space shared by every plate
  height: number;
  plates: Plate[];
  ghosts: GhostRange[];       // floors with no drawing yet
}

/* ── unit availability from the developer's CRM (optional per edition) ── */
export interface EditionCrm {
  file: string;                          // the spreadsheet's name, for the interface
  floorAlias?: Record<number, number>;   // floor → floor whose units it belongs to (duplex upper levels)
  snapshot?: import('./crm').Inventory;  // copy taken at build time
}

export interface EditionContact { name: string; email: string; city: string; }

/** A developer project on Accord (a tenant). Data only, never logic. */
export interface Edition {
  id: string;
  project: string;
  label: string;
  location: string;
  refPrefix: string;
  hero: string;              // path under public/
  heroAlt: string;
  lede: string;
  currency: string;
  locale: string;
  fx: number;
  costIndex: number;
  areaUnit: AreaUnit;
  loading: number;
  rates: Partial<Record<RegisterId, { low: number; mid?: number; high: number }>> | null;
  pricingNote?: string;
  palettes: string[];
  registers: RegisterId[];
  brandRegions: string[];
  residences: Residence[];
  defaultResidence: string;
  rooms: string[];
  /* project imagery (reference: edition.js): a peopled walkthrough per palette, a palette reveal image */
  walkthrough?: Record<string, { img: string; title: string; note: string }[]>;
  paletteHero?: Record<string, string>;
  brandAnchors?: string[] | null;
  tower?: Tower;
  crm?: EditionCrm;
  contact: EditionContact;
  accent: string | null;
}

export interface StudioCredit { name: string; role: string; }
export interface Studio {
  mark: string;
  expansion: string;
  office: string;
  city: string;
  credits: StudioCredit[];
  rights: string;
}
