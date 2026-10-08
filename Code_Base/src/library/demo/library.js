/* Ported verbatim from accord-demo/library/library.js (the reference build). Edit content here. */
// @ts-nocheck
/* ══════════════════════════════════════════════════════════════
   ACCORD · THE LIBRARY
   OuTSDe · Outlook for Theoreticals & Speculative Design
   ------------------------------------------------------------------
   Everything that is the same in every edition of Accord: the
   method (personas, questions, registers), the palettes, the
   material options, the render library, the rules, the studio.

   Nothing here names a project, a city, a currency or a unit size.
   Those live in editions/<id>/edition.js. A new developer never
   touches this file.

   Money in this file is held in one base currency (INR) and one
   base unit (per sq ft). The engine converts to each edition's
   currency, cost index and area unit at display time.
   ══════════════════════════════════════════════════════════════ */

/* ── 2. REGISTERS ──────────────────────────────────────────────
   Base rates: INR per carpet sq ft, all-in (material, execution,
   design fee, studio margin), calibrated on a Tier-2 Indian city.
   Each edition scales them with its own costIndex and currency, or
   overrides them outright with measured local rates.
   ────────────────────────────────────────────────────────────── */
const REGISTERS = {
  COMPOSED: {
    id:'COMPOSED', name:'Composed', rateLow:3400, rateHigh:4500, rate:3900,
    headline:'Considered · Honest · Well-made',
    lines:[
      'Quality materials from established Indian manufacturers.',
      'Standard finishes, professional installation, complete handover.',
      'A coherent interior with nothing gratuitous and nothing missing.'
    ]
  },
  PROVENANCE: {
    id:'PROVENANCE', name:'Provenance', rateLow:5450, rateHigh:7400, rate:6300,
    headline:'Sourced · Specific · Lasting',
    lines:[
      'Specialist Indian and imported materials, selected for character.',
      'Artisan and small-batch finishes where they carry the room.',
      'Furniture and objects with documented origin.'
    ]
  },
  ATELIER: {
    id:'ATELIER', name:'Atelier', rateLow:8700, rateHigh:12400, rate:10400,
    headline:'Commissioned · Named · Precise',
    lines:[
      'Bespoke material selection, specified for this residence alone.',
      'Named craftspeople and ateliers for the pieces that matter.',
      'Full design development: drawings, mock-ups, site supervision.'
    ]
  },
  BESPOKE: {
    id:'BESPOKE', name:'Bespoke', rateLow:null, rateHigh:null, rate:null,
    headline:'No catalogue. Everything made.',
    lines:[
      'Not a budget tier. A brief.',
      'Every material researched, every object commissioned.',
      'The process begins with a conversation, not a price.'
    ]
  }
};
const REGISTER_ORDER = ['COMPOSED','PROVENANCE','ATELIER'];

/* ── 3. PERSONA QUESTIONS ──────────────────────────────────────
   Five situational questions. Images are the existing Accord
   persona set (Design/References/Existing Accord).
   ────────────────────────────────────────────────────────────── */
const PERSONA_QS = [
  { label:'01 · Space and time',
    text:'A Sunday with no plans opens in front of you. The house is quiet. What does the next hour look like?',
    opts:[
      { img:'p-q1_opt1', text:'You notice something that has been bothering you: a chair in the wrong position, a corner that never quite worked. You fix it. The hour disappears.', scores:{HOST:3,SEEKER:1,SETTLER:0} },
      { img:'p-q1_opt2', text:'Something catches your attention: a book half-read, an object you have not really looked at in months. You pick it up and follow where it leads.', scores:{HOST:0,SEEKER:3,SETTLER:1} },
      { img:'p-q1_opt3', text:'Nothing in particular. You find somewhere comfortable and let the time pass without keeping track of it.', scores:{HOST:0,SEEKER:1,SETTLER:3} }
    ]},
  { label:'02 · The object',
    text:'You are in someone else’s home for the first time. What do you remember when you leave?',
    opts:[
      { img:'p-q2_opt1', text:'The way it was put together: the proportions, the decisions behind it, whether it was considered or accidental.', scores:{HOST:3,SEEKER:1,SETTLER:0} },
      { img:'p-q2_opt2', text:'One specific thing in it. Where it might have come from. What it meant to the person who kept it.', scores:{HOST:0,SEEKER:3,SETTLER:1} },
      { img:'p-q2_opt3', text:'How it felt to be in. Whether you could have stayed longer. Whether the light was right.', scores:{HOST:1,SEEKER:0,SETTLER:3} }
    ]},
  { label:'03 · Arrival',
    text:'You come home after a long trip. The flat is exactly as you left it. What do you do first?',
    opts:[
      { img:'p-q3_opt1', text:'Walk through it slowly. Notice what works and what you would change now that you have been away from it.', scores:{HOST:3,SEEKER:1,SETTLER:0} },
      { img:'p-q3_opt2', text:'Go to the thing that always makes it feel like yours: a lamp, a shelf, a particular corner.', scores:{HOST:0,SEEKER:3,SETTLER:1} },
      { img:'p-q3_opt3', text:'Put your bag down. Exhale. You are back, and that is enough.', scores:{HOST:0,SEEKER:0,SETTLER:3} }
    ]},
  { label:'04 · The difficult room',
    text:'A room you have been in felt wrong, immediately and unmistakably. What was the problem, usually?',
    opts:[
      { img:'p-q4_opt1', text:'The space itself. Scale, proportion, the way the furniture was placed. The room had no internal logic.', scores:{HOST:3,SEEKER:0,SETTLER:1} },
      { img:'p-q4_opt2', text:'Nothing to look at. Nowhere for the eye to go. Everything neutralised in a way that felt like absence.', scores:{HOST:1,SEEKER:3,SETTLER:0} },
      { img:'p-q4_opt3', text:'It did not feel lived in. Kept rather than used. Too finished, not enough life in it.', scores:{HOST:0,SEEKER:1,SETTLER:3} }
    ]},
  { label:'05 · The photograph',
    text:'Someone photographs your home, not for you, for a record you will not keep. What matters about how it looks?',
    opts:[
      { img:'p-q5_opt1', text:'That the space reads clearly. The logic of it comes through. The relationship between things is visible.', scores:{HOST:3,SEEKER:1,SETTLER:0} },
      { img:'p-q5_opt2', text:'That the specific things in it are visible, and that each one was clearly chosen with intention.', scores:{HOST:1,SEEKER:3,SETTLER:0} },
      { img:'p-q5_opt3', text:'That it looks inhabited. Not a set, not curated. Recognisably someone’s home.', scores:{HOST:0,SEEKER:0,SETTLER:3} }
    ]}
];

/* ── 4. VISUAL QUESTIONS ───────────────────────────────────────
   Five paired images, one per axis. Imagery is drawn from the
   curated style and palette references (Design/References).
   ────────────────────────────────────────────────────────────── */
const VISUAL_QS = [
  { axis:'warmth',    label:'Visual 01 of 05', text:'You walk into a room for the first time. Which one keeps you there?',
    a:{ img:'warm-a', caption:'Pale, even, quiet' }, b:{ img:'warm-b', caption:'Wood, lamplight, shadow' } },
  { axis:'density',   label:'Visual 02 of 05', text:'A room you admire. What do you notice first?',
    a:{ img:'dens-a', caption:'What is not there' },  b:{ img:'dens-b', caption:'How much is in it' } },
  { axis:'indiaRoot', label:'Visual 03 of 05', text:'Which of these rooms could only belong to one place?',
    a:{ img:'root-a', caption:'Could be anywhere' },  b:{ img:'root-b', caption:'Could only be here' } },
  { axis:'formality', label:'Visual 04 of 05', text:'At the end of a long day, how should the room receive you?',
    a:{ img:'form-a', caption:'Everything in its place' }, b:{ img:'form-b', caption:'It adjusts to you' } },
  { axis:'objectDom', label:'Visual 05 of 05', text:'Someone leaves your home. What do they describe to a friend?',
    a:{ img:'obj-a',  caption:'The space itself' },   b:{ img:'obj-b',  caption:'Something in it' } }
];

/* ── 5. PALETTES ───────────────────────────────────────────────
   Nine palettes resolve; three are demo-ready with imagery.
   axes: 0-10 on warmth, density, indiaRoot, formality, objectDom.
   ────────────────────────────────────────────────────────────── */
const PALETTES = {
  'seeker-p01': {
    id:'seeker-p01', persona:'SEEKER', name:'White Walls & Wandering Objects', short:'White Walls',
    status:'ready', family:'Style 01',
    line:'Pale plaster and travertine that exist to hold what is placed against them.',
    body:'Architecture is restrained almost to neutrality. Oak, travertine and lime plaster set a warm ground; the objects, the art and the view do the rest of the work.',
    colors:['#EFE6D8','#C9A882','#8C6A4A','#2E2A26','#3E4A38'],
    colorNames:['Lime plaster','Travertine','Burnt sienna','Walnut shadow','Deep olive'],
    axes:{ warmth:5, density:4, indiaRoot:3, formality:4, objectDom:8 },
    complexityBudget:13,
    hero:'rooms/living-03.jpg',
    voice:{
      HOST:'You composed the canvas before you placed anything on it. Sightlines, negative space, the distance between things.',
      SEEKER:'The wall exists only to hold what is placed against it. Each object earned its position.',
      SETTLER:'The walls were pale when you arrived. Everything since has simply been kept, not curated.'
    }
  },
  'host-p02': {
    id:'host-p02', persona:'HOST', name:'Tobacco & Dusk', short:'Tobacco & Dusk',
    status:'ready', family:'Style 02',
    line:'Walnut floor to ceiling. The joinery is the ornament. Amber light pools, never floods.',
    body:'Olive lacquer, burl walnut, oxblood and brass. Rooms that read as one continuous object, at their best after sundown.',
    colors:['#3D2B1F','#F0E8D8','#C47A3A','#6B6B3A','#1C1008'],
    colorNames:['Deep walnut','Warm ivory','Burnt amber','Olive lacquer','Dark chocolate'],
    axes:{ warmth:7, density:5, indiaRoot:2, formality:8, objectDom:3 },
    complexityBudget:17,
    hero:'preset/living.jpg',
    voice:{
      HOST:'Every panel was specified. The amber pooling is deliberate: not incidental warmth, placed warmth.',
      SEEKER:'You found the wood-lined room and added the one piece that has no business being there.',
      SETTLER:'Your father’s study looked like this. You reproduced a feeling without meaning to.'
    }
  },
  'settler-p02': {
    id:'settler-p02', persona:'SETTLER', name:'Teak & Monsoon', short:'Teak & Monsoon',
    status:'direction', family:'Style 03',
    line:'Oxide floors, lime walls, teak joinery, cane, and plants that are alive because someone waters them.',
    body:'A South Asian domestic language held to a luxury standard: deep verandah shade, cross-ventilated rooms, teak that darkens over decades.',
    colors:['#F0EDE0','#4A2A10','#C03820','#C8A870','#1A1008'],
    colorNames:['Lime white','Dark teak','Oxide red','Natural cane','Shadow brown'],
    axes:{ warmth:7, density:5, indiaRoot:8, formality:3, objectDom:4 },
    complexityBudget:15,
    hero:'quiz/style-03.jpg',
    voice:{
      HOST:'You designed this from memory and built the nostalgia deliberately. The teak joinery is bespoke.',
      SEEKER:'You kept looking for this particular quiet after you left the country where you first found it.',
      SETTLER:'The oxide floor is just the floor. The teak table is where the family eats.'
    }
  },
  /* resolution-only palettes: shown in the resolution map, not yet rendered */
  'host-p01':   { id:'host-p01',   persona:'HOST',    name:'Stone & Shadow',        status:'roadmap', axes:{warmth:3,density:2,indiaRoot:1,formality:8,objectDom:2}, colors:['#B0A898','#E8E0D0','#4A5240','#8C8C8C','#2A2A28'] },
  'host-p03':   { id:'host-p03',   persona:'HOST',    name:'Noir & Amber',          status:'roadmap', axes:{warmth:8,density:6,indiaRoot:5,formality:9,objectDom:4}, colors:['#1A1510','#C45C3A','#D4880A','#6B4A2A','#0A0A08'] },
  'seeker-p02': { id:'seeker-p02', persona:'SEEKER',  name:'Grey Plaster & Living Art', status:'roadmap', axes:{warmth:4,density:7,indiaRoot:7,formality:3,objectDom:9}, colors:['#A8A8A0','#1A1A18','#2855A0','#B88040','#141412'] },
  'seeker-p03': { id:'seeker-p03', persona:'SEEKER',  name:'Grand & Indian',        status:'roadmap', axes:{warmth:9,density:9,indiaRoot:9,formality:7,objectDom:10}, colors:['#F0E8D0','#8C1A1A','#C8A028','#C8A028','#0A0A14'] },
  'settler-p01':{ id:'settler-p01',persona:'SETTLER', name:'Mud & Linen',           status:'roadmap', axes:{warmth:6,density:5,indiaRoot:4,formality:3,objectDom:5}, colors:['#C8A878','#E0D4B8','#8B4A2A','#B08040','#3A2A18'] },
  'settler-p03':{ id:'settler-p03',persona:'SETTLER', name:'Dusk & Gather',         status:'roadmap', axes:{warmth:7,density:6,indiaRoot:5,formality:3,objectDom:5}, colors:['#3A3A38','#E0D4B8','#C89020','#D07828','#1A1A18'] }
};

const PERSONA_COPY = {
  HOST:    { line:'You design the room before you live in it. Architecture is deliberate. Every decision is a position.',
             sub:'The room speaks before you do.' },
  SEEKER:  { line:'Your home is a private museum. Every object has a reason to be there, and the room reveals itself slowly.',
             sub:'Nothing accidental. Everything earned.' },
  SETTLER: { line:'Comfort is not a compromise. Your home needs no explanation, it simply fits. Things find their way in.',
             sub:'Collected slowly. Nothing new. Everything home.' }
};

/* ── 6. THE RENDER VARIANT TABLE ───────────────────────────────
   The demonstration configurator is render-backed for the Living
   Room of the White Walls palette: five authored renders, each
   tagged with the four attributes that vary between them.
   The engine resolves a selection to the nearest authored render
   and says so when the match is not exact.
   ────────────────────────────────────────────────────────────── */
const VARIANTS = {
  'seeker-p01': {
    'Living Room': [
      { img:'rooms/living-01.jpg', attrs:{ wall:'oak',    light:'lamps', seating:'classic', rug:'jute'    } },
      { img:'rooms/living-02.jpg', attrs:{ wall:'fluted', light:'lamps', seating:'modular', rug:'shag'    } },
      { img:'rooms/living-03.jpg', attrs:{ wall:'fluted', light:'ring',  seating:'modular', rug:'shag'    } },
      { img:'rooms/living-04.jpg', attrs:{ wall:'marble', light:'bead',  seating:'curved',  rug:'emerald' } },
      { img:'rooms/living-05.jpg', attrs:{ wall:'marble', light:'bead',  seating:'modular', rug:'shag'    } }
    ],
    'Dining':         [ { img:'rooms/dining-01.jpg',  attrs:{} } ],
    'Kitchen':        [ { img:'rooms/kitchen-01.jpg', attrs:{} } ],
    'Master Bedroom': [ { img:'rooms/bedroom-01.jpg', attrs:{} } ]
  },
  'host-p02': {
    'Living Room':    [ { img:'preset/living.jpg',         attrs:{} } ],
    'Dining':         [ { img:'preset/dining.jpg',         attrs:{ wall:'plaster' } },
                        { img:'preset/dining-alt.jpg',     attrs:{ wall:'olive'   } } ],
    'Kitchen':        [ { img:'preset/kitchen.jpg',        attrs:{} } ],
    'Master Bedroom': [ { img:'preset/master-bedroom.jpg', attrs:{} } ]
  },
  'settler-p02': {
    'Living Room':    [ { img:'quiz/style-03.jpg', attrs:{} } ],
    'Dining':         [ { img:'quiz/style-03.jpg', attrs:{} } ],
    'Kitchen':        [ { img:'quiz/style-03.jpg', attrs:{} } ],
    'Master Bedroom': [ { img:'quiz/style-03.jpg', attrs:{} } ]
  }
};

/* Attribute weights used by the nearest-render resolver */
const ATTR_WEIGHT = { wall:3, light:2, seating:2, rug:1 };

/* ── 7. OPTIONS ────────────────────────────────────────────────
   Per palette, per room, per category. Costs are deltas in ₹ per
   carpet sq ft (surfaces) or ₹ lump sum (loose items), measured
   against the register baseline, so the estimate always lands
   inside a defensible band.
     tier      : register the option belongs to
     attr/value: which render attribute this option drives
     warmth    : 1 cool · 2 neutral · 3 warm   (coherence engine)
     texture / pattern : 1-3 (complexity engine)
     lead      : weeks
     lock      : booking | three_months | six_weeks
   ────────────────────────────────────────────────────────────── */
const OPTIONS = {
  'seeker-p01': {
    'Living Room': {
      wall: [
        { id:'w-oak',    name:'Oak Slat Panelling',            brand:'Fantoni, Italy / Bengaluru joinery', tier:'COMPOSED',   d:0,    attr:'wall', value:'oak',
          warmth:3, texture:2, pattern:2, lead:8,  lock:'booking', swatch:'#C39A6B',
          note:'Vertical oak battens, clear matt lacquer. Warms the whole room and absorbs a little sound.' },
        { id:'w-fluted', name:'Fluted Lime Plaster + Onyx Niche', brand:'Pandomo (Ardex) / Bharat Stone', tier:'PROVENANCE', d:210,  attr:'wall', value:'fluted',
          warmth:2, texture:3, pattern:2, lead:10, lock:'booking', swatch:'#E3D8C6',
          note:'Hand-applied plaster with a machined flute. The onyx niche is backlit and holds three objects, no more.' },
        { id:'w-marble', name:'Nero Marquina + Lacquer Panel',  brand:'Antolini, Italy',                   tier:'ATELIER',    d:520,  attr:'wall', value:'marble',
          warmth:1, texture:2, pattern:3, lead:16, lock:'booking', swatch:'#2B2B2E',
          note:'Book-matched dark marble framing ivory lacquer. The most formal reading of this palette.' }
      ],
      lighting: [
        { id:'l-lamps', name:'Table and Floor Lamps Only',     brand:'Klove Studio, Delhi',        tier:'COMPOSED',   d:0,      attr:'light', value:'lamps',
          warmth:3, texture:1, pattern:1, lead:6,  lock:'three_months', swatch:'#E8D2A8', lump:180000,
          note:'No ceiling fixture. Light pools at seated height, which is how the room is actually used.' },
        { id:'l-ring',  name:'Blackened Steel Ring Pendant',   brand:'Apparatus / Klove commission', tier:'PROVENANCE', d:0,    attr:'light', value:'ring',
          warmth:2, texture:2, pattern:2, lead:12, lock:'three_months', swatch:'#1E1E1E', lump:520000,
          note:'A single 1.6 m ring with opal globes. Reads as architecture at night, disappears by day.' },
        { id:'l-bead',  name:'Bead Chandelier, Brass or Nickel', brand:'Commission via OuTSDe',   tier:'ATELIER',    d:0,     attr:'light', value:'bead',
          warmth:3, texture:2, pattern:3, lead:18, lock:'three_months', swatch:'#B9924F', lump:1450000,
          note:'Hand-assembled bead arcs. Made to the ceiling drop of this residence, not to a catalogue length.' }
      ],
      seating: [
        { id:'s-classic', name:'Classic Bouclé Three-Seater',  brand:'Gulmohar Lane / Ethnicraft', tier:'COMPOSED',   d:0, attr:'seating', value:'classic',
          warmth:2, texture:2, pattern:1, lead:10, lock:'three_months', swatch:'#EDE4D6', lump:640000,
          note:'One long sofa, two lounge chairs, one ottoman. The arrangement most residences settle into anyway.' },
        { id:'s-modular', name:'Modular Bouclé System',        brand:'Poliform / Bombay Atelier',  tier:'PROVENANCE', d:0, attr:'seating', value:'modular',
          warmth:2, texture:2, pattern:1, lead:14, lock:'three_months', swatch:'#E5DACA', lump:1320000,
          note:'Five modules that can be re-composed after handover. Deep seat, low back, built for the view.' },
        { id:'s-curved',  name:'Curved Sculptural Sofa',       brand:'Commission / Phantom Hands', tier:'ATELIER',    d:0, attr:'seating', value:'curved',
          warmth:2, texture:2, pattern:2, lead:18, lock:'three_months', swatch:'#DCD2C2', lump:2450000,
          note:'A single curved piece drawn to the arc of the balcony line. Upholstered to order.' }
      ],
      textiles: [
        { id:'r-jute',    name:'Jute Loop Rug, Undyed',        brand:'Jaipur Rugs',        tier:'COMPOSED',   d:0, attr:'rug', value:'jute',
          warmth:3, texture:3, pattern:1, lead:8,  lock:'six_weeks', swatch:'#C9B18A', lump:95000,
          note:'Heavy hand-looped jute. Takes salt air and bare feet better than wool.' },
        { id:'r-shag',    name:'Monochrome Shag, Hand-Tufted', brand:'Obeetee, Mirzapur',  tier:'PROVENANCE', d:0, attr:'rug', value:'shag',
          warmth:2, texture:3, pattern:3, lead:12, lock:'six_weeks', swatch:'#4A4643', lump:310000,
          note:'Cream and charcoal graphic field. The strongest pattern decision available in this palette.' },
        { id:'r-emerald', name:'Emerald Wool, Hand-Knotted',   brand:'Obeetee custom',     tier:'ATELIER',    d:0, attr:'rug', value:'emerald',
          warmth:2, texture:2, pattern:1, lead:20, lock:'six_weeks', swatch:'#3E5140', lump:780000,
          note:'Solid deep green, knotted to size. Grounds the room and answers the view.' }
      ],
      flooring: [
        { id:'f-trav',  name:'Classico Travertine, Honed',     brand:'Bhandari Marble',    tier:'COMPOSED',   d:0,   warmth:3, texture:2, pattern:2, lead:10, lock:'booking', swatch:'#D8C7AC',
          note:'900 × 900 vein-cut, filled and honed. The floor the whole palette is built on.' },
        { id:'f-trav-l',name:'Travertine, Large Format Slab',  brand:'Antolini',           tier:'PROVENANCE', d:260, warmth:3, texture:1, pattern:2, lead:14, lock:'booking', swatch:'#E0D0B6',
          note:'1200 × 2400 slabs, fewer joints, book-matched at the thresholds.' }
      ]
    },
    'Dining': {
      wall: [
        { id:'dw-plaster', name:'Lime Plaster, Warm White',    brand:'Pandomo (Ardex)',    tier:'COMPOSED',   d:0,   attr:'wall', value:'plaster',
          warmth:2, texture:2, pattern:1, lead:8,  lock:'booking', swatch:'#EDE3D2',
          note:'Flat hand-applied plaster. Lets the table and the pendant carry the room.' },
        { id:'dw-timber',  name:'Walnut Ribbed Wall + Bar',    brand:'Bengaluru joinery',  tier:'PROVENANCE', d:340, attr:'wall', value:'walnut',
          warmth:3, texture:3, pattern:2, lead:12, lock:'booking', swatch:'#6B4526',
          note:'Ribbed walnut with an integrated bar and glass store behind.' },
        { id:'dw-stone',   name:'Vein-Cut Travertine Wall',    brand:'RMS Stonex',         tier:'ATELIER',    d:480, attr:'wall', value:'stone',
          warmth:3, texture:2, pattern:2, lead:16, lock:'booking', swatch:'#D9C4A3',
          note:'The floor material turned vertical and vein-matched across four slabs.' }
      ],
      lighting: [
        { id:'dl-linear', name:'Linear Opal Pendant',          brand:'Astro / Klove',      tier:'COMPOSED',   d:0, lump:240000, attr:'light', value:'linear',
          warmth:3, texture:1, pattern:1, lead:8,  lock:'three_months', swatch:'#F0E7D2',
          note:'One horizontal fixture at 750 mm above the table. Diffused, no glare across the glass.' },
        { id:'dl-paper',  name:'Pleated Shade Cluster',        brand:'Sogani / commission',tier:'PROVENANCE', d:0, lump:460000, attr:'light', value:'cluster',
          warmth:3, texture:2, pattern:2, lead:14, lock:'three_months', swatch:'#E2D2AE',
          note:'Three pleated shades on separate drops, staggered along the table length.' },
        { id:'dl-globe',  name:'Opal Globe Row on Brass Rail', brand:'Klove Studio',       tier:'ATELIER',    d:0, lump:820000, attr:'light', value:'globe',
          warmth:3, texture:1, pattern:2, lead:18, lock:'three_months', swatch:'#F0E7D2',
          note:'Five hand-blown globes on one brass rail, dimmed to candle level for dinner.' }
      ],
      seating: [
        { id:'ds-black',  name:'Blackened Oak Dining Chairs',  brand:'Phantom Hands',      tier:'PROVENANCE', d:0, lump:520000, warmth:2, texture:2, pattern:1, lead:12, lock:'three_months', swatch:'#2A2320',
          note:'Eight chairs, blackened oak frame, bouclé seat. Made in Bengaluru.' },
        { id:'ds-cane',   name:'Cane and Teak Dining Chairs',  brand:'Phantom Hands',      tier:'COMPOSED',   d:0, lump:340000, warmth:3, texture:3, pattern:2, lead:10, lock:'three_months', swatch:'#C29A63',
          note:'Woven cane over teak. Lighter in the room and in the hand.' }
      ]
    },
    'Kitchen': {
      cabinetry: [
        { id:'kc-bone',    name:'Matt Lacquer, Bone',           brand:'H\u00e4cker / Sleek',  tier:'COMPOSED',   d:0, lump:1250000, attr:'cab', value:'bone',
          warmth:2, texture:1, pattern:1, lead:12, lock:'booking', swatch:'#E8E1D3',
          note:'Handleless bone lacquer, Blum soft-close, Hettich internals.' },
        { id:'kc-oak',     name:'Oak Veneer, Routed Pull',      brand:'Greenlam / joinery', tier:'PROVENANCE', d:0, lump:1850000, attr:'cab', value:'oak',
          warmth:3, texture:2, pattern:2, lead:14, lock:'booking', swatch:'#C39A6B',
          note:'Rift-sawn oak with a routed finger pull, no hardware on the face.' },
        { id:'kc-brass',   name:'Brushed Brass over Oak',       brand:'Commission',         tier:'ATELIER',    d:0, lump:3200000, attr:'cab', value:'brass',
          warmth:3, texture:2, pattern:2, lead:20, lock:'booking', swatch:'#A8823F',
          note:'Brass-faced uppers over oak bases. Patinates. Expect it to look better in year three.' }
      ],
      wall: [
        { id:'kw-stone',   name:'Stone Splashback, Full Height',brand:'Classic Marble',     tier:'PROVENANCE', d:0,   attr:'splash', value:'stone',
          warmth:2, texture:1, pattern:3, lead:14, lock:'booking', swatch:'#4A4C42',
          note:'The counter material carried up the full wall. No joints behind the hob.' },
        { id:'kw-tile',    name:'Hand-Glazed Ceramic Field',    brand:'Orvi / REB zellige', tier:'COMPOSED',   d:-60, attr:'splash', value:'tile',
          warmth:3, texture:2, pattern:2, lead:8,  lock:'booking', swatch:'#2E3A33',
          note:'Slim hand-glazed tile with visible glaze pooling at the edges.' },
        { id:'kw-plaster', name:'Sealed Tadelakt',              brand:'Cementolime',        tier:'ATELIER',    d:120, attr:'splash', value:'plaster',
          warmth:3, texture:2, pattern:1, lead:10, lock:'booking', swatch:'#D7C7AE',
          note:'Burnished lime plaster, waxed and sealed. Seamless behind the counter.' }
      ]
    },
    'Master Bedroom': {
      wall: [
        { id:'mw-oak',    name:'Oak Slat Headboard Wall',      brand:'Bengaluru joinery',   tier:'COMPOSED',   d:0,   attr:'wall', value:'oak',
          warmth:3, texture:2, pattern:2, lead:10, lock:'booking', swatch:'#C39A6B',
          note:'The living room language carried through, in a narrower 30mm batten.' },
        { id:'mw-linen',  name:'Upholstered Linen Panels',     brand:'Ikai by Ragini Ahuja',tier:'PROVENANCE', d:290, attr:'wall', value:'linen',
          warmth:3, texture:3, pattern:1, lead:12, lock:'booking', swatch:'#DCCDB4',
          note:'Naturally dyed linen stretched on frames. Softens the acoustics behind the bed.' },
        { id:'mw-plaster',name:'Lime Plaster + Timber Rail',   brand:'Pandomo (Ardex)',     tier:'ATELIER',    d:180, attr:'wall', value:'plaster',
          warmth:2, texture:2, pattern:1, lead:10, lock:'booking', swatch:'#E6DACA',
          note:'Plain plaster with a picture rail at 2.1m, so the wall can change without a contractor.' }
      ],
      lighting: [
        { id:'ml-sconce', name:'Paired Wall Sconces',          brand:'Klove Studio',        tier:'COMPOSED',   d:0, lump:160000, attr:'light', value:'sconce',
          warmth:3, texture:1, pattern:1, lead:8,  lock:'three_months', swatch:'#E8D2A8',
          note:'Reading light at the bedhead, switched at the bed. No ceiling light over the bed.' },
        { id:'ml-drum',   name:'Pleated Drum + Sconces',       brand:'Commission',          tier:'PROVENANCE', d:0, lump:390000, attr:'light', value:'drum',
          warmth:3, texture:2, pattern:2, lead:14, lock:'three_months', swatch:'#EBDCBE',
          note:'A single soft drum on a dimmer, sconces retained for reading.' },
        { id:'ml-pendant',name:'Asymmetric Pendant, One Side', brand:'Oorjaa',              tier:'ATELIER',    d:0, lump:520000, attr:'light', value:'pendant',
          warmth:3, texture:2, pattern:2, lead:16, lock:'three_months', swatch:'#D8BE92',
          note:'One paper-and-brass pendant dropped low on the window side. Deliberately unbalanced.' }
      ],
      textiles: [
        { id:'mt-wool',  name:'Wool Loop Rug, Sand',           brand:'Jaipur Rugs',         tier:'COMPOSED',   d:0, lump:140000,
          warmth:3, texture:2, pattern:1, lead:8,  lock:'six_weeks', swatch:'#CDBB9C',
          note:'Runs past the bed on three sides, which is the only size that works.' },
        { id:'mt-silk',  name:'Wool and Silk, Hand-Knotted',   brand:'Obeetee',             tier:'ATELIER',    d:0, lump:620000,
          warmth:2, texture:2, pattern:2, lead:18, lock:'six_weeks', swatch:'#B7A488',
          note:'Knotted to the room dimension with a 60mm border in the palette accent.' }
      ]
    }
  }
};

/* ── 7b. OPTIONS · TOBACCO & DUSK ──────────────────────────── */
OPTIONS['host-p02'] = {
  'Living Room': {
    wall: [
      { id:'tw-plaster', name:'Warm Plaster + Stone Hearth', brand:'Pandomo (Ardex) / Bhandari Marble', tier:'COMPOSED', d:0,
        warmth:3, texture:2, pattern:1, lead:8, lock:'booking', swatch:'#D8C6AC',
        note:'Flat warm plaster with a single stone hearth wall. The quietest reading of this palette.' },
      { id:'tw-walnut',  name:'Burl Walnut Panelling',       brand:'Bengaluru joinery / Fantoni',       tier:'PROVENANCE', d:380,
        warmth:3, texture:3, pattern:3, lead:14, lock:'booking', swatch:'#5A3A20',
        note:'Figured walnut, hand-jointed, wrapping two walls. The joinery is the ornament.' },
      { id:'tw-lacquer', name:'Olive Lacquer + Brass Reveal',brand:'Commission via OuTSDe',           tier:'ATELIER',    d:640,
        warmth:2, texture:1, pattern:2, lead:18, lock:'booking', swatch:'#5C5A32',
        note:'Ten coats of hand-rubbed olive lacquer with a brass shadow reveal at every junction.' }
    ],
    lighting: [
      { id:'tl-lamp',    name:'Table Lamps and Wall Washers', brand:'Klove Studio',      tier:'COMPOSED',   d:0, lump:220000,
        warmth:3, texture:1, pattern:1, lead:8, lock:'three_months', swatch:'#E0B978',
        note:'Amber pools at seated height. Nothing overhead. Evening rooms do not want a ceiling light.' },
      { id:'tl-cascade', name:'Cascading Glass Chandelier',   brand:'Klove Studio commission', tier:'ATELIER', d:0, lump:1850000,
        warmth:3, texture:2, pattern:3, lead:20, lock:'three_months', swatch:'#C9A255',
        note:'Hand-blown glass on staggered drops, made to the double-height void.' }
    ],
    seating: [
      { id:'ts-low',  name:'Low Bouclé Sofa Pair',      brand:'Gulmohar Lane / Ethnicraft', tier:'COMPOSED',   d:0, lump:720000,
        warmth:2, texture:2, pattern:1, lead:10, lock:'three_months', swatch:'#E7DECC',
        note:'Two facing sofas across a low table, which is how this room is used after dinner.' },
      { id:'ts-leather', name:'Leather and Walnut Lounge', brand:'Phantom Hands / Minotti', tier:'PROVENANCE', d:0, lump:1560000,
        warmth:3, texture:2, pattern:1, lead:16, lock:'three_months', swatch:'#6B4222',
        note:'Tan saddle leather over solid walnut. Ages visibly, which is the point.' }
    ],
    textiles: [
      { id:'tt-emerald', name:'Emerald Wool Rug',      brand:'Obeetee', tier:'PROVENANCE', d:0, lump:420000,
        warmth:2, texture:2, pattern:1, lead:14, lock:'six_weeks', swatch:'#2F4230',
        note:'Deep green ground under the seating. Holds the walnut and the brass together.' },
      { id:'tt-kilim',   name:'Antique Kilim, Sourced',brand:'Travancore Antiques', tier:'ATELIER', d:0, lump:680000,
        warmth:3, texture:3, pattern:3, lead:6, lock:'six_weeks', swatch:'#8A3A24',
        note:'One sourced piece, not a matched set. Condition and provenance documented at purchase.' }
    ]
  },
  'Dining': {
    wall: [
      { id:'tdw-plaster', name:'Pale Plaster + Wine Store', brand:'Pandomo (Ardex)', tier:'COMPOSED', d:0, attr:'wall', value:'plaster',
        warmth:2, texture:2, pattern:1, lead:8, lock:'booking', swatch:'#E4DACB',
        note:'Pale plaster behind the table, curved walnut wine store to the left.' },
      { id:'tdw-olive',   name:'Olive Lacquer + Wine Store', brand:'Commission via OuTSDe', tier:'PROVENANCE', d:290, attr:'wall', value:'olive',
        warmth:2, texture:2, pattern:1, lead:12, lock:'booking', swatch:'#5C5A32',
        note:'The same room in olive lacquer. Darker, later, better for long dinners.' }
    ],
    lighting: [
      { id:'tdl-linear', name:'Opal Globe Row',        brand:'Astro / Klove', tier:'COMPOSED', d:0, lump:280000,
        warmth:3, texture:1, pattern:2, lead:8, lock:'three_months', swatch:'#F0E3C6',
        note:'Five opal globes on one rail, centred on the table.' }
    ],
    seating: [
      { id:'tds-black', name:'Blackened Oak Dining Chairs', brand:'Phantom Hands', tier:'PROVENANCE', d:0, lump:540000,
        warmth:2, texture:2, pattern:1, lead:12, lock:'three_months', swatch:'#241D19',
        note:'Eight chairs, blackened oak, bouclé seat.' }
    ]
  },
  'Kitchen': {
    cabinetry: [
      { id:'tkc-stone', name:'Stone-Wrapped Island + Dark Cabinetry', brand:'Häcker / Antolini', tier:'PROVENANCE', d:0, lump:2100000,
        warmth:2, texture:1, pattern:3, lead:16, lock:'booking', swatch:'#3E4238',
        note:'Travertine island against full-height dark stone. The kitchen reads as one object.' },
      { id:'tkc-oak',   name:'Oak and Bronze Cabinetry',              brand:'Commission',        tier:'ATELIER',    d:0, lump:3400000,
        warmth:3, texture:2, pattern:2, lead:20, lock:'booking', swatch:'#8A6534',
        note:'Fumed oak with bronze mesh uppers. Patinates with use.' }
    ]
  },
  'Master Bedroom': {
    wall: [
      { id:'tmw-mural', name:'Painted Silk Mural Panel', brand:'Commission via OuTSDe', tier:'ATELIER', d:520,
        warmth:3, texture:2, pattern:3, lead:22, lock:'booking', swatch:'#6E6440',
        note:'Hand-painted landscape panel behind the bed, framed in walnut. One-off, signed.' },
      { id:'tmw-timber',name:'Walnut Headboard Wall',    brand:'Bengaluru joinery',       tier:'PROVENANCE', d:240,
        warmth:3, texture:2, pattern:2, lead:12, lock:'booking', swatch:'#5A3A20',
        note:'Full-width walnut headboard with integrated side tables and reading light.' }
    ],
    textiles: [
      { id:'tmt-indigo', name:'Indigo Wool Rug',  brand:'Jaipur Rugs', tier:'PROVENANCE', d:0, lump:380000,
        warmth:2, texture:2, pattern:2, lead:14, lock:'six_weeks', swatch:'#2C3550',
        note:'Deep indigo ground running past the bed on three sides.' }
    ],
    lighting: [
      { id:'tml-drum', name:'Pleated Drum + Sconces', brand:'Commission', tier:'PROVENANCE', d:0, lump:410000,
        warmth:3, texture:2, pattern:2, lead:14, lock:'three_months', swatch:'#EBDCBE',
        note:'A single soft drum on a dimmer with reading sconces either side.' }
    ]
  }
};

/* Palettes without an authored option set fall back to the
   White Walls set so the demo never dead-ends. Flagged in the UI. */
const CATEGORY_LABEL = {
  wall:'Wall & backdrop', lighting:'Light', seating:'Seating',
  textiles:'Textiles', flooring:'Floor', cabinetry:'Cabinetry'
};

/* ── 8. LOCK STAGES ────────────────────────────────────────────*/
const LOCK_STAGES = {
  booking:      { id:'booking',      label:'At booking',            sub:'Long-lead surfaces, kitchen, sanitaryware and electrical go to procurement.' },
  three_months: { id:'three_months', label:'3 months to possession',sub:'Lighting, wardrobes and furniture confirmed and ordered.' },
  six_weeks:    { id:'six_weeks',    label:'6 weeks to possession', sub:'Statement lighting, soft furnishings, artwork and styling.' }
};

/* ── 10. THE STUDIO ────────────────────────────────────────────*/
const STUDIO = {
  mark:'OuTSDe',
  expansion:'Outlook for Theoreticals & Speculative Design',
  office:'[office]',
  email:'office.insde@gmail.com',
  city:'Mangaluru, Karnataka',
  credits:[
    { name:'Ar. Shruthadev Bantwal', role:'Research Director' },
    { name:'Ar. Kajal Diwakar',      role:'Design Director' },
    { name:'Ar. Aryan Shetty',       role:'Managing Director' }
  ],
  rights:'Accord, the Accord method, the persona and palette system, the compatibility matrix and all renders and drawings in this application are the intellectual property of OuTSDe (Outlook for Theoreticals & Speculative Design). \u00A9 2026 OuTSDe. All rights reserved. Accord\u2122 is a trade mark of OuTSDe.'
};

/* ── 11. RENDER RESOLUTION ─────────────────────────────────────
   Production file name:
     assets/rooms/<palette>__<room>__<axisA>__<axisB>__<day|night>.jpg
   The generated set from accord-render-prompts.md drops straight in.
   Until a file exists the resolver falls back, in order:
     exact file  ->  day version of the same combination
                 ->  the nearest authored legacy render
   so the demo never shows a broken frame.
   ────────────────────────────────────────────────────────────── */
const PALETTE_SLUG = { 'seeker-p01':'white-walls', 'host-p02':'tobacco-dusk', 'settler-p02':'teak-monsoon' };
const ROOM_SLUG    = { 'Living Room':'living', 'Dining':'dining', 'Kitchen':'kitchen', 'Master Bedroom':'master' };
const AXIS_ORDER   = { 'Living Room':['wall','light'], 'Dining':['wall','light'],
                       'Kitchen':['cab','splash'], 'Master Bedroom':['wall','light'] };

/* Which attribute each category drives, per room. Options carry attr/value;
   this is the fallback when an option set does not declare one. */
const CATEGORY_ATTR = { wall:'wall', lighting:'light', cabinetry:'cabinetry', seating:'seating', textiles:'rug', flooring:'floor' };

/* ── 12. WALKTHROUGH (the peopled set) ─────────────────────────*/
const WALKTHROUGH = {
  'seeker-p01':[
    { img:'rooms/living-03.jpg',       title:'Living Room',    note:'Fluted plaster, ring pendant, late afternoon.', pending:true },
    { img:'rooms/dining-01.jpg',       title:'Dining',         note:'Travertine table for eight, pleated shade.',    pending:true },
    { img:'rooms/kitchen-01.jpg',      title:'Kitchen',        note:'Bone lacquer, brass uppers, stone splashback.', pending:true },
    { img:'rooms/bedroom-01.jpg',      title:'Master Bedroom', note:'Oak headboard wall, jute, the view at the foot of the bed.', pending:true }
  ],
  'host-p02':[],   /* library frames still to be generated; editions may supply their own */
  'settler-p02':[
    { img:'quiz/style-03.jpg', title:'Direction', note:'Material direction. Render set in production.', pending:true }
  ]
};

/* ── 14. BRANDS ────────────────────────────────────────────────
   library/brands.js is the research database; ANCHORS are the
   default showcase. Editions can replace the anchors. */
const BRAND_ANCHORS = ['phantom-hands','jaipur-rugs','klove-studio','bharat-floorings',
  'classic-marble-company','gaggenau','axor-hansgrohe','obeetee','gallery-sumukha','maya-organic'];

export { REGISTERS, REGISTER_ORDER, PERSONA_QS, VISUAL_QS, PALETTES, PERSONA_COPY, VARIANTS, ATTR_WEIGHT, OPTIONS, CATEGORY_LABEL, LOCK_STAGES, STUDIO, PALETTE_SLUG, ROOM_SLUG, AXIS_ORDER, CATEGORY_ATTR, WALKTHROUGH, BRAND_ANCHORS };
