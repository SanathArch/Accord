# Accord · Code Base
OuTSDe · Outlook for Theoreticals & Speculative Design

The production build of Accord, written from scratch against `ePI.2026.004_Accord/ACCORD-DEVELOPER-BRIEF.md`.
The reference for behaviour is `ePI.2026.004_Accord/accord-demo/`.

## Run it

**To look at it:** double-click `index.html` (it forwards to `dist/index.html`). No install needed.
Add `?view=buyer` to the address for the TV scale, `?edition=showcase` for the Showcase Edition.

**To develop:** install Node.js 18 or later once, then in this folder:

```
npm install        # once; creates node_modules (keep it out of Google Drive sync if you can)
npm run dev        # http://localhost:5173, reloads on save
npm run build      # rebuilds dist/index.html
```

## Structure (engine / library / edition, brief §3)

```
src/
  engine/          pure logic, no DOM, never names a project
    types.ts         Edition, Residence, Studio
    phases.ts        the flow, rail labels, progress
    session.ts       session state + reducer; every action is logged (brief §6.1)
    tower.ts         floors of a tower from its plates; residence floor ranges
    crm.ts           unit numbers, sold / unsold / blocked, counts
    method.ts        the method, ported function by function from accord-demo/app.js:
                     persona, palette distance, room defaults, cost, coherence, render matching, configuration id
  crm/             the live link to the CRM spreadsheet (read .xlsx in the browser, poll for saves)
  library/         shared by every edition (OuTSDe content)
    demo/            the reference build's library.js and brands.js, ported verbatim (edit content here)
    method.ts        typed access to that content
    params.ts        the method's numbers (persona weight, axis weights, blend threshold, visual step,
                     resolving time, household size) and the copy of the redesigned screens
    studio.ts        mark, credits, rights
    copy.ts          interface copy written by the studio (moves to copy_string later)
  editions/        one file per developer project (data only)
    yamuna-sky-city.ts, showcase.ts, registry.ts
    yamuna-sky-city.tower.ts   the stacked tower: plates, typical ranges, unit outlines (generated from the CAD SVGs)
  state/           React binding for the session; which view this window is
  design/          tokens.css (colour, two type scales), base.css (shared components)
  components/      StudioMark, Credits, Rail, Toast
  screens/
    home/            00 · Home (the Entry phase)   BUILT
    residence/       01 · Residence (tower + plan)  BUILT
    intro/           02 · The process (welcome)    BUILT
    method/          03 to 11, Bespoke, Brands     BUILT (Persona, Register, Visual, Palette, Walkthrough,
                     Configurator, Brands, Coherence, Summary; method.css = the reference styles)
    placeholder/     stand-in for phases not built yet (has Continue)
public/            images served beside the app (edition and library assets)
```

## Built so far

| Phase | Status |
|---|---|
| 00 · Home (Entry) | Built. Hero, mark, wordmark, edition label, lede, name (required) and unit reference, Begin, edition switch, credits. Console and buyer (TV) views. |
| Rail, Back, Restart | Built. Back works on every screen from the start. |
| 02 · The process (Intro) | Built to the reference (`accord-demo/index.html`, #p-intro): kicker, headline, three paragraphs word for word, Begin the questions, Change residence. |
| 01 · Residence | Built. Axonometric tower of floors G to 60 from Assets/CAD_Plans: a drawing named "35-42" repeats on floors 35 to 42. Floor tags and typical-band brackets. Hover a floor to read it, click to open its plan; units glow on hover and are chosen by click. Residence types mark the floors they are sold on. |
| CRM availability | Built. Sold residences are shaded red (blocked amber) on every slab of the tower and on the floor plan, and cannot be chosen. Data: `Accord_Structured/Data/CRM_Dataset/Sold Unsold Units - Yamuna Sky City.xlsx`. A snapshot is built in; press **Connect CRM file** on the Residence screen once and the app re-reads the spreadsheet every 3 seconds, so a save in Excel recolours the building. |
| 03 Who you are to 07 Your palette | Rebuilt 7 Oct 2026 in the Home/Residence design with the production method (see below). |
| 04 Register, 08 to 11, Bespoke, Featured brands | Built to the reference (`accord-demo`): same screens, wording, logic and styles. Persona questions and reveal, register, Bespoke, the five visual pairs, resolving, palette reveal, resolution map, walkthrough, configurator (renders, day/night, key plan, cost and band, coherence flags), brands, coherence review, and the Accord with Export PDF. Tested against the demo: identical text on every screen for the same session. |

## Who you are and the colour code (rebuilt 7 Oct 2026)
Screens 03 to 07 (persona questions and reveal, instinct, resolving, palette, resolution map) were rebuilt
in the Home and Residence design (panel + stage) with the production method from the developer brief:

- **Persona as a combination.** Shares of Host, Seeker and Settler; every persona at or above
  `blendMin` (28%) is part of it, e.g. "Seeker & Host". The reveal places you on a triangle between the three.
- **Ties** go to the persona that led the later answer, then Settler (brief §4.2).
- **Household mode.** Up to three people answer in turn (add them on the persona screen or the reveal,
  console only). The household is the sum of their answers; the reveal shows each person and where they agree or split.
- **Three-way visual answer.** A, both or neither, B (axis 2.5, 5 or 7.5). Answers are stored, axes derived.
- **Resolving** shows the real ranking, takes 3 s at most and can be skipped.
- **Palette distance** = weighted axis distance − persona pull; the pull applies to every persona in the
  combination, scaled by its share against the lead (the lead gets the full 1.5, as before).
  The ranked list with both parts is kept on the session.
- **Palette reveal** shows the colour code (five named colours with hex codes) and your axes against the palette's.
- **Resolution map** is a ranked chart: distance and persona pull per palette; click a row for detail, choose any ready palette.
Every answer is stored with its time and dwell. Numbers live in `src/library/params.ts`.

## Saving the buyer's selections (8 Oct 2026)
Everything selected in a session is saved as Excel in `Accord_Structured/Data/Retreving_Data` (src/record/).
- Connect once: on the home page, **Connect data folder** and choose `Retreving_Data` (Chrome or Edge). The folder is remembered; on a later visit the browser asks once to allow saving again, which the app requests when **Begin** is pressed (or press **Reconnect**).
- Per session: `Accord_<date>_<time>_<buyer>_<unit ref>.xlsx`, rewritten a moment after every selection. Sheets: Overview (buyer, unit ref, residence, floor, unit, CRM status, persona combination and shares, register, five axes, recommended and chosen palette, coherence, indicative total and band, configuration id, current screen), Persona answers (each person, question, option, time, seconds taken, scores), Instinct (each visual answer and axis value), Palette ranking, Configuration (room, category, option, brand, tier, lead time, lock stage), Activity log (every step in words, with time and screen).
- `Accord_All_Sessions.xlsx`: one row per session, updated in place (matched by Session ID). Columns added by hand are kept. If the file is open in Excel the save fails; the session file is still written and the row is retried on the next selection.
- While a session runs without a folder, the rail shows **Not saving · Connect data folder**. Browsers without folder access (Firefox, Safari) get **Download Excel** on the rail instead.
- The writer is src/record/xlsxWrite.ts (fflate, no new dependency); the content is src/record/sessionWorkbook.ts (pure); RecorderProvider.tsx holds the folder link and the saving.

## CRM spreadsheet
Read by column header, so columns can move: **Unit No** (floor then two-digit position: 301 = floor 3, residence 1)
and **Sold / Unsold** (Sold, Unsold or Blocked). Position n is the residence tagged Fn in the floor drawing.
Floor 44 is the upper level of the floor 43 duplexes and takes their status. The live link works in Chrome and Edge;
the browser asks once per visit to allow reading the file again ("Reconnect").
Code: `src/engine/crm.ts` (rules), `src/crm/` (reading the .xlsx, the live link).

## Tower drawings
Plates are generated from `Accord_Structured/Assets/CAD_Plans/Sky City Plans SVG`. Each SVG holds the plan
and a vector layer of unit outlines tagged F1, F2. To update: re-export the SVGs with the same canvas, then
rerun the generation (ask Claude: "regenerate the tower plates"). Unit colours set the typology:
red 2 BHK, yellow 3 BHK, blue 4 BHK, green 5 BHK.

## Rules carried from the brief
- The engine never names a project, city, currency or unit size.
- Editions hold data, never logic. An edition may change the accent and hero only.
- Text the buyer reads on the TV is never below 20 px (`[data-view="buyer"]` scale).
- Accord carries OuTSDe branding only.
