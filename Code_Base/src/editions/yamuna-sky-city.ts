/* ══════════════════════════════════════════════════════════════
   ACCORD · YAMUNA SKY CITY EDITION
   Ported from accord-demo/editions/yamuna-sky-city/edition.js.
   Everything project-specific lives here and in
   public/editions/yamuna-sky-city/. Walkthrough and palette hero
   imagery are added when those screens are built.
   ══════════════════════════════════════════════════════════════ */
import type { Edition } from '../engine/types';
import { yamunaTower } from './yamuna-sky-city.tower';
import { yamunaCrmSnapshot } from './yamuna-sky-city.crm-snapshot';

export const yamunaSkyCity: Edition = {
  id: 'yamuna-sky-city',
  project: 'Yamuna Sky City',
  label: 'Yamuna Sky City Edition',
  location: 'Mangaluru, Karnataka, India',
  refPrefix: 'YSC',
  hero: 'editions/yamuna-sky-city/hero.jpg',
  heroAlt: 'Yamuna Sky City, sea elevation',
  lede: 'Nine interiors, one of them yours, resolved in about six minutes.',

  currency: 'INR', locale: 'en-IN', fx: 1, costIndex: 1.0,
  areaUnit: 'sqft', loading: 1.32, rates: null,

  palettes: ['seeker-p01', 'host-p02', 'settler-p02'],
  registers: ['COMPOSED', 'PROVENANCE', 'ATELIER', 'BESPOKE'],
  brandRegions: ['IN'],

  residences: [
    { id: '2bhk', name: '2 BHK', unit: 'F3', saleable: 1580, floors: '6th to 18th, 20th to 28th, 30th to 32nd',
      baths: 2, plan: 'plans/typical.jpg', keyplan: 'keyplans/typical-f3.svg', plate: 'Typical floor plate, 8 residences',
      note: 'Eight residences to a floor. Sea-facing and hill-facing stacks.' },
    { id: '3bhk', name: '3 BHK', unit: 'F1', saleable: 2205, floors: '6th to 18th, 20th to 28th, 30th to 32nd',
      baths: 3, plan: 'plans/typical.jpg', keyplan: 'keyplans/typical-f1.svg', plate: 'Typical floor plate, 8 residences',
      note: 'Corner residence. Living and master both hold the sea elevation.' },
    { id: '4bhk', name: '4 BHK Sky Residence', unit: 'F2', saleable: 4764, floors: '35th to 37th, 39th to 42nd',
      baths: 4, plan: 'plans/sky.jpg', keyplan: 'keyplans/sky-f2.svg', plate: 'Sky floor plate, 3 residences',
      note: 'Three residences to a floor. Double aspect, 250 ft balcony band.' },
    { id: '4bhk-g', name: '4 BHK Grand', unit: 'F1', saleable: 8297, floors: '45th to 46th, 48th to 50th',
      baths: 5, plan: 'plans/grand.jpg', keyplan: 'keyplans/grand-f1.svg', plate: 'Grand floor plate, 2 residences',
      note: 'Two residences to a floor. 300 ft continuous balcony.' },
    { id: '5bhk', name: '5 BHK Full Floor', unit: 'F1', saleable: 11544, floors: '53rd to 55th, 57th to 58th',
      baths: 6, plan: 'plans/fullfloor.jpg', keyplan: 'keyplans/fullfloor-f1.svg', plate: 'Full floor, one residence',
      note: 'One residence to a floor. Private lift lobby, 300 ft balcony.' }
  ],
  defaultResidence: '3bhk',
  rooms: ['Living Room', 'Dining', 'Kitchen', 'Master Bedroom'],

  /* project imagery, ported from accord-demo/editions/yamuna-sky-city/edition.js.
     A walkthrough set rendered for this building; where a palette has none here,
     the library's frames are used. */
  walkthrough: {
    'host-p02': [
      { img: 'preset/entrance.jpg', title: 'Arrival', note: 'Walnut lift lobby, olive runner, marble threshold.' },
      { img: 'preset/living.jpg', title: 'Living Room', note: 'Curved plaster, emerald rug, fire and sea on one axis.' },
      { img: 'preset/dining.jpg', title: 'Dining', note: 'Wine store, travertine table, opal globe row.' },
      { img: 'preset/kitchen.jpg', title: 'Kitchen', note: 'Travertine island, olive lacquer, dark stone.' },
      { img: 'preset/master-bedroom.jpg', title: 'Master Bedroom', note: 'Painted mural panel, indigo rug, sunrise over the bay.' },
      { img: 'preset/master-bath.jpg', title: 'Master Bath', note: 'Travertine, lapis stone counter, stone tub.' },
      { img: 'preset/powder.jpg', title: 'Powder Room', note: 'Burl walnut, dark marble basin, cranes.' },
      { img: 'preset/cigar.jpg', title: 'Cigar Room', note: 'Oxblood lacquer, green leather, moon over the water.' },
      { img: 'preset/theatre.jpg', title: 'Home Theatre', note: 'Ribbed walnut, mohair banquette, photography wall.' },
      { img: 'preset/bedroom-04.jpg', title: 'Guest Bedroom', note: 'Mirrored wardrobe wall, rust suede headboard.' }
    ]
  },
  paletteHero: { 'host-p02': 'preset/living.jpg' },
  brandAnchors: null,

  /* the stacked tower on the Residence screen, floors 0 to 60 */
  tower: yamunaTower,

  /* sold and unsold residences, from the developer's CRM spreadsheet.
     Floor 44 is the upper level of the floor 43 duplexes. */
  crm: {
    file: 'Sold Unsold Units - Yamuna Sky City.xlsx',
    floorAlias: { 44: 43 },
    snapshot: yamunaCrmSnapshot
  },

  // TODO(open item): legacy studio address carried over from the demo; replace with an OuTSDe address.
  contact: { name: 'OuTSDe', email: 'office.insde@gmail.com', city: 'Mangaluru, Karnataka' },
  accent: null
};
