# Accord · Assets

Every image the Accord app (Code_Base) loads, gathered in one place. Copied 8 Oct 2026; the originals were left where they were.
Folders mirror the app's `public/` folder, so `Library/` = `public/library/` and `Editions/yamuna-sky-city/` = `public/editions/yamuna-sky-city/`.

| Folder | Used by | Files |
|---|---|---|
| `Library/quiz/` | 03 Who you are (persona questions) and 04–06 visual pairs | 28 |
| `Library/rooms/` | Configurator variants, seeker walkthrough; `white-walls__living__…` are production renders the configurator looks for first | 14 |
| `Library/preset/` | Host palette configurator frames | 15 |
| `Editions/yamuna-sky-city/` | Home page hero | 1 |
| `Editions/yamuna-sky-city/plans/` | Residence floor-plate images (edition data) | 4 |
| `Editions/yamuna-sky-city/keyplans/` | Key plan fallback when no floor/unit is chosen | 14 |
| `Editions/yamuna-sky-city/preset/` | Yamuna walkthrough (10 frames) and palette hero | 15 |
| `Editions/yamuna-sky-city/tower/` | 01 Residence: axonometric tower plates (generated from CAD_Plans) | 42 |
| `CAD_Plans/` | Source drawings for the tower plates (already here, untouched) | — |
| `Home_Page_Video/` | Empty, kept for the home page video | — |

## Where each file came from

Most files are copies of `Code_Base/public/`. Two groups were not in the app yet:

- `Editions/yamuna-sky-city/plans/` (4 files): from `ePI.2026.004_Accord/accord-demo/editions/yamuna-sky-city/assets/plans/`. The edition data points at these, but `Code_Base/public/` has no `plans` folder.
- `Library/rooms/white-walls__living__wall-oak__light-*` (6 files): from `ePI.2026.004_Accord/output/accord-renders/`. They follow the production render name the configurator looks for first.

## Not here yet

- Walkthrough renders named `<palette>__walkthrough__<room>__<day|night>.jpg`: none exist yet. The app falls back to the preset frames.
- The rest of the production render set (`accord-render-prompts.md`): only 6 of them exist.
- Home page video: none found in the Accord folder.

## File list

| File | Bytes | Source |
|---|---:|---|
| Library/quiz/dens-a.jpg | 108,913 | Accord_Structured/Code_Base/public/library/quiz/dens-a.jpg |
| Library/quiz/dens-b.jpg | 208,538 | Accord_Structured/Code_Base/public/library/quiz/dens-b.jpg |
| Library/quiz/form-a.jpg | 277,535 | Accord_Structured/Code_Base/public/library/quiz/form-a.jpg |
| Library/quiz/form-b.jpg | 194,191 | Accord_Structured/Code_Base/public/library/quiz/form-b.jpg |
| Library/quiz/obj-a.jpg | 111,976 | Accord_Structured/Code_Base/public/library/quiz/obj-a.jpg |
| Library/quiz/obj-b.jpg | 126,079 | Accord_Structured/Code_Base/public/library/quiz/obj-b.jpg |
| Library/quiz/p-q1_opt1.jpg | 81,806 | Accord_Structured/Code_Base/public/library/quiz/p-q1_opt1.jpg |
| Library/quiz/p-q1_opt2.jpg | 60,154 | Accord_Structured/Code_Base/public/library/quiz/p-q1_opt2.jpg |
| Library/quiz/p-q1_opt3.jpg | 88,375 | Accord_Structured/Code_Base/public/library/quiz/p-q1_opt3.jpg |
| Library/quiz/p-q2_opt1.jpg | 63,507 | Accord_Structured/Code_Base/public/library/quiz/p-q2_opt1.jpg |
| Library/quiz/p-q2_opt2.jpg | 52,160 | Accord_Structured/Code_Base/public/library/quiz/p-q2_opt2.jpg |
| Library/quiz/p-q2_opt3.jpg | 43,520 | Accord_Structured/Code_Base/public/library/quiz/p-q2_opt3.jpg |
| Library/quiz/p-q3_opt1.jpg | 64,722 | Accord_Structured/Code_Base/public/library/quiz/p-q3_opt1.jpg |
| Library/quiz/p-q3_opt2.jpg | 94,740 | Accord_Structured/Code_Base/public/library/quiz/p-q3_opt2.jpg |
| Library/quiz/p-q3_opt3.jpg | 67,244 | Accord_Structured/Code_Base/public/library/quiz/p-q3_opt3.jpg |
| Library/quiz/p-q4_opt1.jpg | 94,762 | Accord_Structured/Code_Base/public/library/quiz/p-q4_opt1.jpg |
| Library/quiz/p-q4_opt2.jpg | 78,590 | Accord_Structured/Code_Base/public/library/quiz/p-q4_opt2.jpg |
| Library/quiz/p-q4_opt3.jpg | 87,418 | Accord_Structured/Code_Base/public/library/quiz/p-q4_opt3.jpg |
| Library/quiz/p-q5_opt1.jpg | 52,676 | Accord_Structured/Code_Base/public/library/quiz/p-q5_opt1.jpg |
| Library/quiz/p-q5_opt2.jpg | 59,077 | Accord_Structured/Code_Base/public/library/quiz/p-q5_opt2.jpg |
| Library/quiz/p-q5_opt3.jpg | 75,747 | Accord_Structured/Code_Base/public/library/quiz/p-q5_opt3.jpg |
| Library/quiz/root-a.jpg | 154,562 | Accord_Structured/Code_Base/public/library/quiz/root-a.jpg |
| Library/quiz/root-b.jpg | 185,394 | Accord_Structured/Code_Base/public/library/quiz/root-b.jpg |
| Library/quiz/style-01.jpg | 67,796 | Accord_Structured/Code_Base/public/library/quiz/style-01.jpg |
| Library/quiz/style-02.jpg | 75,415 | Accord_Structured/Code_Base/public/library/quiz/style-02.jpg |
| Library/quiz/style-03.jpg | 96,138 | Accord_Structured/Code_Base/public/library/quiz/style-03.jpg |
| Library/quiz/warm-a.jpg | 97,786 | Accord_Structured/Code_Base/public/library/quiz/warm-a.jpg |
| Library/quiz/warm-b.jpg | 161,231 | Accord_Structured/Code_Base/public/library/quiz/warm-b.jpg |
| Library/rooms/bedroom-01.jpg | 236,174 | Accord_Structured/Code_Base/public/library/rooms/bedroom-01.jpg |
| Library/rooms/dining-01.jpg | 185,764 | Accord_Structured/Code_Base/public/library/rooms/dining-01.jpg |
| Library/rooms/kitchen-01.jpg | 164,100 | Accord_Structured/Code_Base/public/library/rooms/kitchen-01.jpg |
| Library/rooms/living-01.jpg | 308,137 | Accord_Structured/Code_Base/public/library/rooms/living-01.jpg |
| Library/rooms/living-02.jpg | 281,856 | Accord_Structured/Code_Base/public/library/rooms/living-02.jpg |
| Library/rooms/living-03.jpg | 293,701 | Accord_Structured/Code_Base/public/library/rooms/living-03.jpg |
| Library/rooms/living-04.jpg | 216,213 | Accord_Structured/Code_Base/public/library/rooms/living-04.jpg |
| Library/rooms/living-05.jpg | 246,013 | Accord_Structured/Code_Base/public/library/rooms/living-05.jpg |
| Library/rooms/white-walls__living__wall-oak__light-bead__day.jpg | 620,772 | ePI.2026.004_Accord/output/accord-renders/white-walls__living__wall-oak__light-bead__day.jpg |
| Library/rooms/white-walls__living__wall-oak__light-bead__night.jpg | 556,644 | ePI.2026.004_Accord/output/accord-renders/white-walls__living__wall-oak__light-bead__night.jpg |
| Library/rooms/white-walls__living__wall-oak__light-lamps__day.jpg | 579,537 | ePI.2026.004_Accord/output/accord-renders/white-walls__living__wall-oak__light-lamps__day.jpg |
| Library/rooms/white-walls__living__wall-oak__light-lamps__night.jpg | 510,693 | ePI.2026.004_Accord/output/accord-renders/white-walls__living__wall-oak__light-lamps__night.jpg |
| Library/rooms/white-walls__living__wall-oak__light-ring__day.jpg | 621,844 | ePI.2026.004_Accord/output/accord-renders/white-walls__living__wall-oak__light-ring__day.jpg |
| Library/rooms/white-walls__living__wall-oak__light-ring__night.jpg | 529,185 | ePI.2026.004_Accord/output/accord-renders/white-walls__living__wall-oak__light-ring__night.jpg |
| Library/preset/bedroom-04.jpg | 252,115 | Accord_Structured/Code_Base/public/library/preset/bedroom-04.jpg |
| Library/preset/cigar.jpg | 166,276 | Accord_Structured/Code_Base/public/library/preset/cigar.jpg |
| Library/preset/dining-alt.jpg | 141,656 | Accord_Structured/Code_Base/public/library/preset/dining-alt.jpg |
| Library/preset/dining.jpg | 157,707 | Accord_Structured/Code_Base/public/library/preset/dining.jpg |
| Library/preset/entrance.jpg | 203,014 | Accord_Structured/Code_Base/public/library/preset/entrance.jpg |
| Library/preset/kitchen-detail.jpg | 258,432 | Accord_Structured/Code_Base/public/library/preset/kitchen-detail.jpg |
| Library/preset/kitchen.jpg | 207,047 | Accord_Structured/Code_Base/public/library/preset/kitchen.jpg |
| Library/preset/living-detail.jpg | 267,635 | Accord_Structured/Code_Base/public/library/preset/living-detail.jpg |
| Library/preset/living.jpg | 135,014 | Accord_Structured/Code_Base/public/library/preset/living.jpg |
| Library/preset/master-bath-2.jpg | 167,677 | Accord_Structured/Code_Base/public/library/preset/master-bath-2.jpg |
| Library/preset/master-bath.jpg | 152,424 | Accord_Structured/Code_Base/public/library/preset/master-bath.jpg |
| Library/preset/master-bedroom-view.jpg | 188,067 | Accord_Structured/Code_Base/public/library/preset/master-bedroom-view.jpg |
| Library/preset/master-bedroom.jpg | 194,533 | Accord_Structured/Code_Base/public/library/preset/master-bedroom.jpg |
| Library/preset/powder.jpg | 200,353 | Accord_Structured/Code_Base/public/library/preset/powder.jpg |
| Library/preset/theatre.jpg | 132,543 | Accord_Structured/Code_Base/public/library/preset/theatre.jpg |
| Editions/yamuna-sky-city/hero.jpg | 289,143 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/hero.jpg |
| Editions/yamuna-sky-city/plans/fullfloor.jpg | 155,593 | ePI.2026.004_Accord/accord-demo/editions/yamuna-sky-city/assets/plans/fullfloor.jpg |
| Editions/yamuna-sky-city/plans/grand.jpg | 174,176 | ePI.2026.004_Accord/accord-demo/editions/yamuna-sky-city/assets/plans/grand.jpg |
| Editions/yamuna-sky-city/plans/sky.jpg | 166,054 | ePI.2026.004_Accord/accord-demo/editions/yamuna-sky-city/assets/plans/sky.jpg |
| Editions/yamuna-sky-city/plans/typical.jpg | 181,597 | ePI.2026.004_Accord/accord-demo/editions/yamuna-sky-city/assets/plans/typical.jpg |
| Editions/yamuna-sky-city/keyplans/fullfloor-f1.svg | 11,100 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/keyplans/fullfloor-f1.svg |
| Editions/yamuna-sky-city/keyplans/grand-f1.svg | 11,252 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/keyplans/grand-f1.svg |
| Editions/yamuna-sky-city/keyplans/grand-f2.svg | 11,252 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/keyplans/grand-f2.svg |
| Editions/yamuna-sky-city/keyplans/sky-f1.svg | 11,481 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/keyplans/sky-f1.svg |
| Editions/yamuna-sky-city/keyplans/sky-f2.svg | 11,481 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/keyplans/sky-f2.svg |
| Editions/yamuna-sky-city/keyplans/sky-f3.svg | 11,481 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/keyplans/sky-f3.svg |
| Editions/yamuna-sky-city/keyplans/typical-f1.svg | 12,401 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/keyplans/typical-f1.svg |
| Editions/yamuna-sky-city/keyplans/typical-f2.svg | 12,401 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/keyplans/typical-f2.svg |
| Editions/yamuna-sky-city/keyplans/typical-f3.svg | 12,401 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/keyplans/typical-f3.svg |
| Editions/yamuna-sky-city/keyplans/typical-f4.svg | 12,401 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/keyplans/typical-f4.svg |
| Editions/yamuna-sky-city/keyplans/typical-f5.svg | 12,401 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/keyplans/typical-f5.svg |
| Editions/yamuna-sky-city/keyplans/typical-f6.svg | 12,401 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/keyplans/typical-f6.svg |
| Editions/yamuna-sky-city/keyplans/typical-f7.svg | 12,401 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/keyplans/typical-f7.svg |
| Editions/yamuna-sky-city/keyplans/typical-f8.svg | 12,401 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/keyplans/typical-f8.svg |
| Editions/yamuna-sky-city/preset/bedroom-04.jpg | 252,115 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/preset/bedroom-04.jpg |
| Editions/yamuna-sky-city/preset/cigar.jpg | 166,276 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/preset/cigar.jpg |
| Editions/yamuna-sky-city/preset/dining-alt.jpg | 141,656 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/preset/dining-alt.jpg |
| Editions/yamuna-sky-city/preset/dining.jpg | 157,707 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/preset/dining.jpg |
| Editions/yamuna-sky-city/preset/entrance.jpg | 203,014 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/preset/entrance.jpg |
| Editions/yamuna-sky-city/preset/kitchen-detail.jpg | 258,432 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/preset/kitchen-detail.jpg |
| Editions/yamuna-sky-city/preset/kitchen.jpg | 207,047 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/preset/kitchen.jpg |
| Editions/yamuna-sky-city/preset/living-detail.jpg | 267,635 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/preset/living-detail.jpg |
| Editions/yamuna-sky-city/preset/living.jpg | 135,014 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/preset/living.jpg |
| Editions/yamuna-sky-city/preset/master-bath-2.jpg | 167,677 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/preset/master-bath-2.jpg |
| Editions/yamuna-sky-city/preset/master-bath.jpg | 152,424 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/preset/master-bath.jpg |
| Editions/yamuna-sky-city/preset/master-bedroom-view.jpg | 188,067 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/preset/master-bedroom-view.jpg |
| Editions/yamuna-sky-city/preset/master-bedroom.jpg | 194,533 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/preset/master-bedroom.jpg |
| Editions/yamuna-sky-city/preset/powder.jpg | 200,353 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/preset/powder.jpg |
| Editions/yamuna-sky-city/preset/theatre.jpg | 132,543 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/preset/theatre.jpg |
| Editions/yamuna-sky-city/tower/ghost-4-32.webp | 8,614 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/ghost-4-32.webp |
| Editions/yamuna-sky-city/tower/ghost-53-58.webp | 7,876 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/ghost-53-58.webp |
| Editions/yamuna-sky-city/tower/plan-33.webp | 266,628 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/plan-33.webp |
| Editions/yamuna-sky-city/tower/plan-34.webp | 258,400 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/plan-34.webp |
| Editions/yamuna-sky-city/tower/plan-35-42.webp | 235,532 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/plan-35-42.webp |
| Editions/yamuna-sky-city/tower/plan-4-32.webp | 289,134 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/plan-4-32.webp |
| Editions/yamuna-sky-city/tower/plan-43.webp | 250,556 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/plan-43.webp |
| Editions/yamuna-sky-city/tower/plan-44.webp | 224,598 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/plan-44.webp |
| Editions/yamuna-sky-city/tower/plan-45-50.webp | 257,288 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/plan-45-50.webp |
| Editions/yamuna-sky-city/tower/plan-51.webp | 281,370 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/plan-51.webp |
| Editions/yamuna-sky-city/tower/plan-52.webp | 270,698 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/plan-52.webp |
| Editions/yamuna-sky-city/tower/plan-53-58.webp | 171,410 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/plan-53-58.webp |
| Editions/yamuna-sky-city/tower/stack-33-mark.webp | 8,612 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/stack-33-mark.webp |
| Editions/yamuna-sky-city/tower/stack-33-on.webp | 96,840 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/stack-33-on.webp |
| Editions/yamuna-sky-city/tower/stack-33.webp | 8,642 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/stack-33.webp |
| Editions/yamuna-sky-city/tower/stack-34-mark.webp | 8,630 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/stack-34-mark.webp |
| Editions/yamuna-sky-city/tower/stack-34-on.webp | 92,158 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/stack-34-on.webp |
| Editions/yamuna-sky-city/tower/stack-34.webp | 8,660 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/stack-34.webp |
| Editions/yamuna-sky-city/tower/stack-35-42-mark.webp | 8,406 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/stack-35-42-mark.webp |
| Editions/yamuna-sky-city/tower/stack-35-42-on.webp | 86,394 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/stack-35-42-on.webp |
| Editions/yamuna-sky-city/tower/stack-35-42.webp | 8,430 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/stack-35-42.webp |
| Editions/yamuna-sky-city/tower/stack-4-32-mark.webp | 8,590 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/stack-4-32-mark.webp |
| Editions/yamuna-sky-city/tower/stack-4-32-on.webp | 102,692 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/stack-4-32-on.webp |
| Editions/yamuna-sky-city/tower/stack-4-32.webp | 8,616 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/stack-4-32.webp |
| Editions/yamuna-sky-city/tower/stack-43-mark.webp | 8,406 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/stack-43-mark.webp |
| Editions/yamuna-sky-city/tower/stack-43-on.webp | 89,722 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/stack-43-on.webp |
| Editions/yamuna-sky-city/tower/stack-43.webp | 8,434 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/stack-43.webp |
| Editions/yamuna-sky-city/tower/stack-44-mark.webp | 8,344 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/stack-44-mark.webp |
| Editions/yamuna-sky-city/tower/stack-44-on.webp | 83,346 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/stack-44-on.webp |
| Editions/yamuna-sky-city/tower/stack-44.webp | 8,374 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/stack-44.webp |
| Editions/yamuna-sky-city/tower/stack-45-50-mark.webp | 8,378 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/stack-45-50-mark.webp |
| Editions/yamuna-sky-city/tower/stack-45-50-on.webp | 94,246 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/stack-45-50-on.webp |
| Editions/yamuna-sky-city/tower/stack-45-50.webp | 8,408 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/stack-45-50.webp |
| Editions/yamuna-sky-city/tower/stack-51-mark.webp | 8,436 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/stack-51-mark.webp |
| Editions/yamuna-sky-city/tower/stack-51-on.webp | 99,488 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/stack-51-on.webp |
| Editions/yamuna-sky-city/tower/stack-51.webp | 8,466 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/stack-51.webp |
| Editions/yamuna-sky-city/tower/stack-52-mark.webp | 8,386 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/stack-52-mark.webp |
| Editions/yamuna-sky-city/tower/stack-52-on.webp | 92,546 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/stack-52-on.webp |
| Editions/yamuna-sky-city/tower/stack-52.webp | 8,416 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/stack-52.webp |
| Editions/yamuna-sky-city/tower/stack-53-58-mark.webp | 7,850 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/stack-53-58-mark.webp |
| Editions/yamuna-sky-city/tower/stack-53-58-on.webp | 63,468 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/stack-53-58-on.webp |
| Editions/yamuna-sky-city/tower/stack-53-58.webp | 7,878 | Accord_Structured/Code_Base/public/editions/yamuna-sky-city/tower/stack-53-58.webp |
