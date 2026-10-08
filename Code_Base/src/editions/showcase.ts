/* ══════════════════════════════════════════════════════════════
   ACCORD · SHOWCASE EDITION
   Project-neutral, for first meetings before a developer's drawings
   arrive. Ported from accord-demo/editions/showcase/edition.js.
   ══════════════════════════════════════════════════════════════ */
import type { Edition } from '../engine/types';

export const showcase: Edition = {
  id: 'showcase', project: 'Accord', label: 'Showcase Edition',
  location: 'Illustrative market: Dubai, UAE', refPrefix: 'ACC',
  hero: 'library/rooms/living-03.jpg', heroAlt: 'Accord library interior, White Walls palette',
  lede: 'Nine interiors. The method is the same in every market; only the numbers change.',

  currency: 'AED', locale: 'en-AE', fx: 22.7, costIndex: 1.55,
  areaUnit: 'sqm', loading: 1.25, rates: null,
  pricingNote: 'Illustrative pricing for a first conversation. Rates are set per edition from local quotes at onboarding.',

  palettes: ['seeker-p01', 'host-p02', 'settler-p02'],
  registers: ['COMPOSED', 'PROVENANCE', 'ATELIER', 'BESPOKE'],
  brandRegions: ['IN'],

  residences: [
    { id: '1br', name: 'One Bedroom', unit: 'Typical', saleable: 850, floors: 'Typical floors', baths: 1, plan: null, keyplan: null, plate: null,
      note: 'Generic typology. Replaced by the developer’s own units at onboarding.' },
    { id: '2br', name: 'Two Bedroom', unit: 'Typical', saleable: 1350, floors: 'Typical floors', baths: 2, plan: null, keyplan: null, plate: null,
      note: 'Generic typology.' },
    { id: '3br', name: 'Three Bedroom', unit: 'Typical', saleable: 2100, floors: 'Typical floors', baths: 3, plan: null, keyplan: null, plate: null,
      note: 'Generic typology.' },
    { id: 'ph', name: 'Penthouse', unit: 'Typical', saleable: 5200, floors: 'Upper floors', baths: 5, plan: null, keyplan: null, plate: null,
      note: 'Generic typology.' }
  ],
  defaultResidence: '2br',
  rooms: ['Living Room', 'Dining', 'Kitchen', 'Master Bedroom'],

  contact: { name: 'OuTSDe', email: 'office.insde@gmail.com', city: 'Mangaluru, India' },
  accent: null
};
