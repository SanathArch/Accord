/* ══════════════════════════════════════════════════════════════
   LIBRARY · THE METHOD (typed)
   The content itself is ported verbatim from the reference build in
   ./demo/library.js and ./demo/brands.js. This file only gives it
   types, so the screens and the engine can use it safely.
   ══════════════════════════════════════════════════════════════ */
import * as L from './demo/library.js';
import { BRAND_DB } from './demo/brands.js';

export type PersonaId = 'HOST' | 'SEEKER' | 'SETTLER';
export type RegisterKey = 'COMPOSED' | 'PROVENANCE' | 'ATELIER' | 'BESPOKE';
export type Axis = 'warmth' | 'density' | 'indiaRoot' | 'formality' | 'objectDom';
export type LockStage = 'booking' | 'three_months' | 'six_weeks';

export interface Register { id: RegisterKey; name: string; rateLow: number | null; rateHigh: number | null; rate: number | null; headline: string; lines: string[]; }
export interface PersonaOpt { img: string; text: string; scores: Record<PersonaId, number>; }
export interface PersonaQ { label: string; text: string; opts: PersonaOpt[]; }
export interface VisualQ { axis: Axis; label: string; text: string; a: { img: string; caption: string }; b: { img: string; caption: string }; }
export interface Palette {
  id: string; persona: PersonaId; name: string; short?: string; status: 'ready' | 'direction' | 'roadmap'; family?: string;
  axes: Record<Axis, number>; colors: string[]; colorNames?: string[]; voice?: Record<PersonaId, string>;
  line?: string; body?: string; hero?: string; complexityBudget?: number;
}
export interface Option {
  id: string; name: string; brand: string; tier: RegisterKey; note: string; swatch: string;
  d?: number; lump?: number; attr?: string; value?: string; warmth?: number; texture?: number; pattern?: number;
  lead: number; lock: LockStage;
}
export type OptionSet = Record<string, Option[]>;                       // category → options
export interface Variant { img: string; attrs: Record<string, string>; }
export interface WalkFrame { img: string; title: string; note: string; pending?: boolean; }
export interface Brand {
  id: string; name: string; category: string; subcategory: string; origin: string; founded?: string;
  india_contact: string; signature: string; why: string; lead_weeks: number; register: RegisterKey[];
  palettes: string[]; regions?: string[]; verified?: boolean;
}

export const REGISTERS = L.REGISTERS as unknown as Record<RegisterKey, Register>;
export const REGISTER_ORDER = L.REGISTER_ORDER as unknown as RegisterKey[];
export const PERSONA_QS = L.PERSONA_QS as unknown as PersonaQ[];
export const VISUAL_QS = L.VISUAL_QS as unknown as VisualQ[];
export const PALETTES = L.PALETTES as unknown as Record<string, Palette>;
export const PERSONA_COPY = L.PERSONA_COPY as unknown as Record<PersonaId, { line: string; sub: string }>;
export const VARIANTS = L.VARIANTS as unknown as Record<string, Record<string, Variant[]>>;
export const ATTR_WEIGHT = L.ATTR_WEIGHT as unknown as Record<string, number>;
export const OPTIONS = L.OPTIONS as unknown as Record<string, Record<string, OptionSet>>;
export const CATEGORY_LABEL = L.CATEGORY_LABEL as unknown as Record<string, string>;
export const LOCK_STAGES = L.LOCK_STAGES as unknown as Record<LockStage, { label: string; sub: string }>;
export const PALETTE_SLUG = L.PALETTE_SLUG as unknown as Record<string, string>;
export const ROOM_SLUG = L.ROOM_SLUG as unknown as Record<string, string>;
export const AXIS_ORDER = L.AXIS_ORDER as unknown as Record<string, string[]>;
export const WALKTHROUGH = L.WALKTHROUGH as unknown as Record<string, WalkFrame[]>;
export const BRAND_ANCHORS = L.BRAND_ANCHORS as unknown as string[];
export const DEMO_STUDIO = L.STUDIO as unknown as { email: string; city: string; rights: string };
export const ALL_BRANDS = ((BRAND_DB as unknown as { brands: Brand[] }).brands) || [];

export const AXIS_LABEL: Record<Axis, string> = { warmth: 'Warmth', density: 'Density', indiaRoot: 'Rootedness', formality: 'Formality', objectDom: 'The object' };
export const MISS_LABEL: Record<string, string> = { wall: 'wall finish', light: 'light fitting', seating: 'seating', rug: 'rug', cab: 'cabinetry', splash: 'splashback' };
export const CAT_LABEL: Record<string, string> = { stone: 'Stone & tile', surface: 'Surfaces', flooring: 'Flooring', kitchen: 'Kitchen',
  sanitary: 'Sanitaryware', tapware: 'Tapware', lighting: 'Lighting', furniture: 'Furniture',
  textile: 'Rugs & textiles', hardware: 'Hardware', art: 'Art, craft & objects' };
export const ROOM_SHARE: Record<string, number> = { 'Living Room': 0.24, 'Dining': 0.13, 'Kitchen': 0.09, 'Master Bedroom': 0.17 };
export const RESOLVE_STEPS = ['Reading your responses', 'Mapping the five axes', 'Applying persona weighting', 'Measuring palette distance', 'Checking register availability'];
