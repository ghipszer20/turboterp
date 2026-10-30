# Special programs: course code check

Generated 2026-10-30 for every hand-drafted program in `packages/catalog/special-programs/registry.ts` (Scholars, Honors, LLPs, FIRE, UMD Fellows, departmental honors). Each course id from `programCourseIds` was checked against the Testudo snapshots (history 2025-01 … 2026-05, plus Fall 2026 `soc-202608` and Spring 2027 `soc-202701`) and the Academic Catalog cache. Topic codes count when their base course is known.

- **Fixed**: an old code replaced by the catalog course whose "Formerly" line names it.
- **Unknown**: in neither the snapshots nor the catalog; left as encoded with a `reviewNotes` line.
- **Not offered recently**: known, but in neither Fall 2026 nor Spring 2027 (catalog-only means no snapshot at all).
- **Seasonal**: offered in only one of Fall 2026 / Spring 2027; the terms are every snapshot term it appears in. Not a bug; left unchanged.

Totals over 56 programs (counted per program): 11 fixed, 17 unknown, 119 not offered recently, 384 seasonal.

## College Park Scholars: Arts (`scholars-arts`)

**Fixed**

- AASP211 → AAAS211 (source: "AASP211 Get Out: The Sunken Place of Race Relations…"; catalog AAAS211 "Formerly: AASP211")
- WMST275 → CMLT275 (source: "WGSS275 World Literature by Women (also WMST275, CMLT275…)"; WGSS275 and CMLT275 both "Formerly: WMST275"; WGSS275 was already listed)

**Unknown**: none

**Not offered recently**: ARHU158 (catalog only), JOUR452 (last Summer 2025), CPSP300 (catalog only), WEID138 (catalog only), EDDI110 (last Spring 2026)

**Seasonal**: CPSA100 (Fall 2025, Fall 2026), CPSA101 (Spring 2025, Spring 2026, Spring 2027), CPSA200 (Fall 2025, Fall 2026), CPSA201 (Spring 2025, Spring 2026, Spring 2027), CPSA240 (Spring 2025, Spring 2026, Spring 2027), CPSA250 (Spring 2025, Spring 2026, Spring 2027), CPSA260 (Spring 2025, Spring 2026, Spring 2027), AAST355 (Summer 2025, Fall 2025, Winter 2025, Summer 2026, Fall 2026), AAST440 (Fall 2025, Fall 2026), AMST204 (Fall 2025, Fall 2026), AMST320 (Fall 2025, Fall 2026), FREN242 (Fall 2025, Spring 2027), PHYS102 (Fall 2025, Fall 2026), PHYS103 (Fall 2025, Fall 2026), PHYS106 (Spring 2025, Spring 2026, Spring 2027), PHYS107 (Spring 2025, Spring 2026, Spring 2027), URSP372 (Spring 2025, Spring 2026, Spring 2027), URSP250 (Fall 2025, Fall 2026), CPSP210 (Spring 2025, Spring 2026, Spring 2027)

## College Park Scholars: Business, Society and Entrepreneurship (`scholars-bse`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: none

**Seasonal**: CPBE100 (Fall 2025, Fall 2026), BMGT161 (Fall 2025, Fall 2026), BMGT461S (Spring 2027), CPBE101 (Spring 2025, Spring 2026, Spring 2027), CPBE225 (Fall 2025, Fall 2026), CPBE200 (Fall 2026), CPBE230 (Spring 2025, Spring 2026, Spring 2027), CPBE240 (Spring 2025, Spring 2026, Spring 2027), CPBE250 (Spring 2025, Spring 2026, Spring 2027)

## College Park Scholars: Civic Engagement for Social Good (`scholars-cesg`)

**Fixed**: none

**Unknown**

- CPCV240: named by the source ("CPCV 240: Service-Learning"), no catalog course
- CPCV250: named by the source ("CPCV 250: Research"), no catalog course

**Not offered recently**: LARC162 (last Spring 2026)

**Seasonal**: CPCV100 (Fall 2025, Fall 2026), CPCV225 (Fall 2025, Fall 2026), CPCV101 (Spring 2025, Spring 2026, Spring 2027), CPCV200 (Fall 2025, Fall 2026), CHSE228C (Fall 2025, Fall 2026), CPCV230 (Spring 2025, Spring 2026, Spring 2027), AMST328T (Spring 2025, Spring 2026, Spring 2027), AMST328Y (Fall 2025, Fall 2026), AREC200 (Fall 2025, Fall 2026), ARTH260 (Fall 2026), CPSP220 (Fall 2025, Fall 2026), FMSC190S (Fall 2025, Fall 2026), HESI423 (Fall 2025, Fall 2026), LARC151 (Summer 2025, Fall 2025, Winter 2025, Summer 2026, Fall 2026), PEER312 (Fall 2025, Fall 2026), PHIL344 (Summer 2025, Fall 2025, Summer 2026, Fall 2026), URSP250 (Fall 2025, Fall 2026)

## College Park Scholars: Data Justice (`scholars-dj`)

**Fixed**

- AASP187 → AAAS187 (source: "AASP187: The New Jim Crow…"; AAAS187 "Formerly: AASP187")

**Unknown**

- JOUR289: not in the cached sources or the catalog

**Not offered recently**: CMSC116 (last Spring 2025), ENMA201 (last Spring 2026), LARC162 (last Spring 2026), PHYS137 (last Spring 2026), PLCY215 (last Spring 2025)

**Seasonal**: CPDJ100 (Fall 2025, Fall 2026), INST204S (Fall 2025, Fall 2026), CPDJ101 (Spring 2026, Spring 2027), CPDJ200 (Fall 2026), CPDJ240 (Spring 2026, Spring 2027), CPDJ230 (Spring 2026, Spring 2027), CPDJ250 (Spring 2026, Spring 2027), AMST260 (Spring 2025, Fall 2025, Fall 2026), PHIL271 (Spring 2025, Spring 2026, Spring 2027), WGSS115 (Spring 2025, Spring 2026, Spring 2027)

## College Park Scholars: Environment, Technology and Economy (`scholars-ete`)

**Fixed**

- GEOG372 → GEOG272 (code not in the cached sources; GEOG272 "Formerly: GEOG372")
- HESI217 → LEAD217 (source: "HESI217: Intro to Student Leadership"; LEAD217 "Formerly: HESI217")

**Unknown**

- ENST140: named by the source ("ENST140: Sustainability and History"), no catalog course
- GVPT205S: not in the cached sources or the catalog
- PLSC120: not in the cached sources or the catalog

**Not offered recently**: AMST250 (catalog only), ANSC227 (last Spring 2025), ANSC252 (last Fall 2025), ANTH298E (catalog only), ARCH272 (last Spring 2026), ARTH265 (last Fall 2025), ARTH488G (last Spring 2025), BSCI124 (catalog only), BSCI145 (last Winter 2025), BSOS240 (catalog only), BSOS388T (catalog only), ECON181 (catalog only), EDHI488E (catalog only), ENGL378 (catalog only), ENMA150 (catalog only), ENMA201 (last Spring 2026), ENSP250 (last Spring 2026), ENST100 (catalog only), GEOG110 (last Winter 2025), GEOG130 (last Summer 2026), GEOG332 (catalog only), GEOL200 (last Fall 2025), HIST131 (last Spring 2026), HIST206 (catalog only), HIST338R (last Spring 2026), HNUH218V (catalog only), LARC162 (last Spring 2026), PHIL261 (catalog only), PLCY215 (last Spring 2025), PLSC125 (catalog only), PLSC226 (catalog only), WEID139 (catalog only), WGSS330 (last Fall 2025)

**Seasonal**: CPET100 (Fall 2025, Fall 2026), CPET101 (Spring 2025, Spring 2026, Spring 2027), CPET200 (Fall 2025, Fall 2026), CPET230 (Spring 2025, Spring 2026, Spring 2027), CPET240 (Spring 2025, Spring 2026, Spring 2027), AAAS230 (Fall 2025, Summer 2026, Fall 2026), ANTH242 (Spring 2025, Spring 2026, Spring 2027), ANTH266 (Summer 2025, Fall 2025, Winter 2025, Spring 2026, Summer 2026, Fall 2026), ANTH322 (Fall 2025, Fall 2026), AOSC375 (Fall 2025, Fall 2026), AREC200 (Fall 2025, Fall 2026), AREC210 (Spring 2025, Spring 2026, Spring 2027), AREC240 (Spring 2025, Spring 2026, Spring 2027), AREC241 (Fall 2026), AREC254 (Spring 2025, Fall 2026), AREC306 (Fall 2025, Fall 2026), AREC280 (Fall 2025, Fall 2026), ARTH260 (Fall 2026), BMGT207 (Fall 2025, Fall 2026), BMGT289A (Spring 2025, Spring 2026, Spring 2027), BSCI126 (Fall 2026), BSCI151 (Fall 2025, Fall 2026), BSCI363 (Fall 2025, Fall 2026), CPSP210 (Spring 2025, Spring 2026, Spring 2027), CPSP220 (Fall 2025, Fall 2026), CPSS220 (Fall 2025, Fall 2026), CPSS240 (Spring 2025, Fall 2025, Spring 2026, Spring 2027), ECON185 (Spring 2025, Spring 2026, Spring 2027), EDDI300 (Spring 2026, Spring 2027), ENGL133 (Spring 2025, Spring 2026, Spring 2027), ENSP101 (Fall 2025, Fall 2026), ENSP102 (Spring 2025, Spring 2026, Spring 2027), ENSP340 (Fall 2025, Fall 2026), ENST214 (Spring 2025, Spring 2026, Spring 2027), ENST281 (Fall 2025, Fall 2026), FMSC190S (Fall 2025, Fall 2026), GEOG170 (Fall 2025, Winter 2025, Fall 2026), GEOG202 (Summer 2025, Fall 2025, Winter 2025, Summer 2026, Fall 2026), GEOG330 (Summer 2025, Fall 2025, Winter 2025, Summer 2026, Fall 2026), GEOG272 (Summer 2025, Fall 2025, Winter 2025, Summer 2026, Spring 2027), GEOL104 (Fall 2025, Fall 2026), GEOL124 (Fall 2026), GEOL204 (Spring 2025, Spring 2026, Spring 2027), GVPT206 (Summer 2025, Spring 2027), GVPT221 (Fall 2025, Fall 2026), GVPT282 (Spring 2025, Spring 2026, Summer 2026, Spring 2027), HIST205 (Spring 2025, Fall 2026), HIST289R (Spring 2025, Spring 2026, Spring 2027), HIST338L (Fall 2025, Fall 2026), IMMR200 (Spring 2025, Fall 2025, Spring 2027), INAG100 (Fall 2025, Fall 2026), INAG102 (Fall 2025, Fall 2026), INAG103 (Fall 2025, Fall 2026), INAG123 (Fall 2025, Fall 2026), INST152 (Spring 2025, Fall 2025, Spring 2026, Summer 2026, Fall 2026), LARC151 (Summer 2025, Fall 2025, Winter 2025, Summer 2026, Fall 2026), LARC160 (Spring 2025, Summer 2025, Fall 2025, Summer 2026, Fall 2026), LARC263 (Spring 2025, Spring 2026, Spring 2027), MIEH331 (Fall 2025, Fall 2026), NFSC112 (Fall 2025, Fall 2026), PHYS105 (Fall 2025, Fall 2026), PHYS235 (Fall 2025, Fall 2026), PLSC110 (Spring 2025, Summer 2025, Spring 2026, Summer 2026, Spring 2027), PLSC112 (Fall 2026), PLSC115 (Fall 2025, Fall 2026), PLSC203 (Fall 2025, Fall 2026), PLSC303 (Spring 2025, Spring 2026, Spring 2027), URSP250 (Fall 2025, Fall 2026)

## College Park Scholars: Global Public Health (`scholars-gph`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: none

**Seasonal**: CPGH100 (Fall 2025, Fall 2026), FMSC110S (Fall 2025, Fall 2026), CPGH101 (Spring 2025, Spring 2026, Spring 2027), CPGH200 (Fall 2025, Fall 2026), CPGH210 (Spring 2027)

## College Park Scholars: International Studies (`scholars-is`)

**Fixed**: none

**Unknown**

- BSST230: not in the cached sources or the catalog

**Not offered recently**: CPSP300 (catalog only), EDDI110 (last Spring 2026), ANTH264 (last Summer 2026), GVPT309 (catalog only), SOCY343 (last Spring 2026)

**Seasonal**: CPSN100 (Fall 2025, Fall 2026), CPSN101 (Spring 2025, Spring 2026, Spring 2027), CPSN200 (Fall 2026), CPSP359S (Spring 2025, Spring 2026, Spring 2027), BMGT207 (Fall 2025, Fall 2026), ANTH266 (Summer 2025, Fall 2025, Winter 2025, Spring 2026, Summer 2026, Fall 2026), AREC260 (Fall 2025, Fall 2026), ARTH260 (Fall 2026), GVPT282 (Spring 2025, Spring 2026, Summer 2026, Spring 2027), GVPT354 (Summer 2025, Fall 2025, Summer 2026, Fall 2026), IMMR200 (Spring 2025, Fall 2025, Spring 2027), PHIL341 (Fall 2025, Fall 2026), PHIL344 (Summer 2025, Fall 2025, Summer 2026, Fall 2026), URSP250 (Fall 2025, Fall 2026)

## College Park Scholars: Justice and Legal Thought (`scholars-jlt`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: none

**Seasonal**: CPJT100 (Fall 2025, Fall 2026), MLAW100 (Fall 2025, Fall 2026), CPJT101 (Spring 2025, Spring 2026, Spring 2027), MLAW150 (Spring 2025, Spring 2026, Spring 2027), CPJT200 (Fall 2025, Fall 2026), CPJT230 (Spring 2025, Spring 2026, Spring 2027), CPJT240 (Spring 2025, Spring 2026, Spring 2027), CPJT250 (Spring 2025, Spring 2026, Spring 2027), CPSP220 (Fall 2025, Fall 2026), FMSC190S (Fall 2025, Fall 2026), HIST134S (Fall 2025, Fall 2026), PHIL170 (Fall 2025, Fall 2026), MLAW378R (Fall 2025, Fall 2026), MLAW315 (Fall 2025, Fall 2026), MLAW325 (Spring 2025, Spring 2026, Spring 2027)

## College Park Scholars: Life Sciences (`scholars-ls`)

**Fixed**: none

**Unknown**

- CPSF230: named by the source ("CPSF 230: Practicum: Internship"), no catalog course

**Not offered recently**: none

**Seasonal**: CPSF100 (Fall 2025, Fall 2026), CHEM132S (Fall 2025, Fall 2026), CMNS100 (Fall 2025, Fall 2026), CPSF101 (Spring 2025, Spring 2026, Spring 2027), BSCI180S (Fall 2026), CPSF200 (Fall 2025, Fall 2026)

## College Park Scholars: Media, Self and Society (`scholars-media`)

**Fixed**: none

**Unknown**

- ENGL240: not in the cached sources or the catalog

**Not offered recently**: GVPT105 (catalog only)

**Seasonal**: CPMS100 (Fall 2025, Fall 2026), CPMS225 (Fall 2025, Fall 2026), CPMS101 (Spring 2025, Spring 2026, Spring 2027), CPMS200 (Fall 2026), CPSP359S (Spring 2025, Spring 2026, Spring 2027), CPSP220 (Fall 2025, Fall 2026), ENGL241 (Spring 2025, Spring 2026, Spring 2027), ENGL244 (Fall 2025, Fall 2026), FMSC190S (Fall 2025, Fall 2026)

## College Park Scholars: Public Leadership (`scholars-pl`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: none

**Seasonal**: CPPL100 (Fall 2025, Fall 2026), PLCY201S (Fall 2025, Fall 2026), CPPL101 (Spring 2025, Spring 2026, Spring 2027), CPPL200 (Fall 2025, Fall 2026)

## College Park Scholars: Science and Global Change (`scholars-sgc`)

**Fixed**

- ENMA289A → ENMA201 (ENMA201 "Formerly: ENMA289A")
- PLSC101 → PLSC112 (source: "PLSC 101 Introductory Crop Science"; PLSC112 "Formerly: PLSC101")
- PLSC289I → LARC152 (source: "PLSC 289I Greening Cities…"; LARC152 "Formerly: PLSC289I")

**Unknown**

- PUAF301: named by the source ("AGNR/PUAF 301 Sustainability"), no catalog course
- ENST140: named by the source ("ENST140: Sustainability and History"), no catalog course
- ANSC277: named by the source ("ANSC 277 Eating with Eyes Wide Open"), no catalog course
- ANTH241: not in the cached sources or the catalog
- HIST141: named by the source ("HIST 141 Carbon…"), no catalog course

**Not offered recently**: GEOL200 (last Fall 2025), ARCH272 (last Spring 2026), ANSC227 (last Spring 2025), ECON181 (catalog only), ENEE131 (catalog only), ENMA150 (catalog only), ENMA201 (last Spring 2026), ENSP250 (last Spring 2026), PLSC250 (catalog only), GEOL288 (catalog only), GEOL388 (catalog only), HIST204 (catalog only), HIST206 (catalog only), PHIL209B (catalog only), PLSC125 (catalog only), LARC152 (last Spring 2026)

**Seasonal**: CPSG100 (Fall 2025, Fall 2026), CPSG101 (Spring 2025, Spring 2026, Spring 2027), CPSG200 (Fall 2025, Fall 2026), CPSG230 (Spring 2025, Spring 2026, Spring 2027), CPSG240 (Spring 2025, Spring 2026, Spring 2027), CPSG250 (Spring 2025, Spring 2026, Spring 2027), CPSP359G (Spring 2025, Spring 2026, Spring 2027), CPSP359S (Spring 2025, Spring 2026, Spring 2027), FMSC190S (Fall 2025, Fall 2026), GVPT202 (Fall 2025, Fall 2026), GEOL102 (Spring 2025, Spring 2026, Spring 2027), GEOL104 (Fall 2025, Fall 2026), GEOL204 (Spring 2025, Spring 2026, Spring 2027), GEOL212 (Fall 2025, Fall 2026), AREC200 (Fall 2025, Fall 2026), ENSP101 (Fall 2025, Fall 2026), ENSP102 (Spring 2025, Spring 2026, Spring 2027), ENST214 (Spring 2025, Spring 2026, Spring 2027), ASTR220 (Spring 2025, Spring 2027), ASTR230 (Spring 2025, Fall 2025, Spring 2026, Fall 2026), ANTH265 (Summer 2025, Fall 2025, Winter 2025, Summer 2026, Fall 2026), ANTH266 (Summer 2025, Fall 2025, Winter 2025, Spring 2026, Summer 2026, Fall 2026), AREC240 (Spring 2025, Spring 2026, Spring 2027), AREC241 (Fall 2026), BSCI151 (Fall 2025, Fall 2026), ECON185 (Spring 2025, Spring 2026, Spring 2027), ENST282 (Summer 2025, Fall 2025, Fall 2026), GEOG330 (Summer 2025, Fall 2025, Winter 2025, Summer 2026, Fall 2026), HIST205 (Spring 2025, Fall 2026), PHIL250 (Fall 2026), PLSC112 (Fall 2026), PLSC115 (Fall 2025, Fall 2026), TLPL285 (Spring 2025, Summer 2026, Spring 2027), URSP250 (Fall 2025, Fall 2026)

## College Park Scholars: Science, Technology and Society (`scholars-sts`)

**Fixed**

- AASP211 → AAAS211 (source: "AASP211 Get Out…")
- BSCI150 → BSCI151 (code not in the cached sources; BSCI151 "Formerly: BSCI150")

**Unknown**: none

**Not offered recently**: CPSS270 (catalog only), CPSP279T (catalog only), ANSC227 (last Spring 2025), ARCH272 (last Spring 2026), HIST219N (catalog only), BMGT190H (last Spring 2025), ENED290 (catalog only), BSCI144 (last Spring 2025), ENES192 (last Fall 2025), ENES197 (last Summer 2026), ENES250 (last Summer 2026), ENMA150 (catalog only), ENMA201 (last Spring 2026), GEOL200 (last Fall 2025), HIST204 (catalog only), PLCY288Q (catalog only)

**Seasonal**: CPSS100 (Fall 2025, Fall 2026), CPSS101 (Spring 2025, Spring 2026, Spring 2027), CPSS220 (Fall 2025, Fall 2026), CPSS240 (Spring 2025, Fall 2025, Spring 2026, Spring 2027), CPSP210 (Spring 2025, Spring 2026, Spring 2027), AGST130 (Fall 2025, Fall 2026), AMST210 (Spring 2025, Spring 2026, Spring 2027), AMST260 (Spring 2025, Fall 2025, Fall 2026), ANTH242 (Spring 2025, Spring 2026, Spring 2027), ANTH265 (Summer 2025, Fall 2025, Winter 2025, Summer 2026, Fall 2026), ANTH266 (Summer 2025, Fall 2025, Winter 2025, Spring 2026, Summer 2026, Fall 2026), AREC200 (Fall 2025, Fall 2026), AREC210 (Spring 2025, Spring 2026, Spring 2027), AREC240 (Spring 2025, Spring 2026, Spring 2027), AREC254 (Spring 2025, Fall 2026), AREC260 (Fall 2025, Fall 2026), ENGL254 (Spring 2025, Spring 2026, Fall 2026), WGSS230 (Fall 2025, Spring 2026, Spring 2027), ARTH262 (Fall 2025, Fall 2026), ASTR220 (Spring 2025, Spring 2027), ASTR230 (Spring 2025, Fall 2025, Spring 2026, Fall 2026), BMGT207 (Fall 2025, Fall 2026), BMGT289A (Spring 2025, Spring 2026, Spring 2027), BSCI151 (Fall 2025, Fall 2026), CPSP220 (Fall 2025, Fall 2026), ECON185 (Spring 2025, Spring 2026, Spring 2027), EDHD221 (Spring 2025, Spring 2026, Spring 2027), FMSC190S (Fall 2025, Fall 2026), FMSC270 (Spring 2025, Fall 2025, Spring 2026, Fall 2026), FMSC286 (Fall 2025, Fall 2026), HESP214 (Spring 2025, Fall 2025, Fall 2026), HIST205 (Spring 2025, Fall 2026), HIST224 (Fall 2025, Fall 2026), HLTH234 (Summer 2025, Fall 2025, Winter 2025, Summer 2026, Fall 2026), HLTH264 (Winter 2025, Spring 2026, Spring 2027), INAG123 (Fall 2025, Fall 2026), INST152 (Spring 2025, Fall 2025, Spring 2026, Summer 2026, Fall 2026), INST154 (Spring 2025, Spring 2027), JOUR281 (Spring 2026, Spring 2027), KNES226 (Fall 2025, Fall 2026), LARC151 (Summer 2025, Fall 2025, Winter 2025, Summer 2026, Fall 2026), LARC263 (Spring 2025, Spring 2026, Spring 2027), LING260 (Spring 2025, Fall 2025, Fall 2026), MATH274 (Fall 2025, Fall 2026), NFSC112 (Fall 2025, Fall 2026), PHIL250 (Fall 2026), PHYS105 (Fall 2025, Fall 2026), PHYS235 (Fall 2025, Fall 2026), WGSS336 (Fall 2025, Fall 2026), URSP250 (Fall 2025, Fall 2026), WGSS115 (Spring 2025, Spring 2026, Spring 2027), WGSS200 (Spring 2025, Fall 2025, Spring 2026, Fall 2026), WGSS291 (Fall 2025, Spring 2026, Fall 2026)

## Advanced Cybersecurity Experience for Students (ACES) (`honors-aces`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: none

**Seasonal**: HACS100 (Fall 2025, Fall 2026), HACS101 (Spring 2025, Spring 2026, Spring 2027), HACS200 (Fall 2025, Fall 2026)

## Design Cultures & Creativity (`honors-dcc`)

**Fixed**: none

**Unknown**

- HDCC378: named by the source ("HDCC378 Design & Creativity Abroad"), no catalog course

**Not offered recently**: HDCC209 (catalog only)

**Seasonal**: HDCC105 (Fall 2025, Fall 2026), HDCC201 (Fall 2025, Fall 2026)

## Gemstone (`honors-gemstone`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: none

**Seasonal**: GEMS101 (Fall 2025, Fall 2026), GEMS102 (Spring 2025, Spring 2026, Spring 2027), GEMS202 (Fall 2025, Fall 2026)

## Honors Global Challenges & Solutions (`honors-hglo`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: HGLO396 (catalog only), HGLO397 (catalog only)

**Seasonal**: HGLO100 (Fall 2025, Fall 2026), HGLO101 (Fall 2025, Fall 2026), HGLO208 (Fall 2025, Fall 2026), HGLO207 (Fall 2026), FGSM310 (Fall 2025, Fall 2026), FGSM315 (Fall 2025, Fall 2026), FGSM320 (Fall 2025, Fall 2026), FGSM325 (Fall 2026), FGSM330 (Fall 2025, Fall 2026), FGSM340 (Fall 2025, Fall 2026), FGSM350 (Fall 2025, Fall 2026), FGSM355 (Fall 2025, Fall 2026), FGSM360 (Fall 2025, Fall 2026), FGSM365 (Fall 2025, Fall 2026), FGSM370 (Fall 2025, Fall 2026), FGSM390 (Fall 2025, Fall 2026)

## Honors Humanities (`honors-humanities`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: none

**Seasonal**: HHUM105 (Fall 2025, Fall 2026), HHUM106 (Spring 2025, Spring 2026, Spring 2027), HHUM206 (Spring 2025, Spring 2026, Spring 2027)

## Integrated Life Sciences (`honors-ils`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: BSCI330H (last Fall 2025), HLSC374 (last Fall 2025)

**Seasonal**: HLSC100 (Fall 2025, Fall 2026), HLSC280 (Fall 2025, Fall 2026), HLSC322 (Spring 2025, Spring 2026, Spring 2027), HLSC102 (Spring 2025, Spring 2026, Spring 2027), BSCI411H (Fall 2025, Fall 2026), HLTH234H (Summer 2025, Fall 2025, Winter 2025, Summer 2026, Fall 2026), HLTH264H (Winter 2025, Spring 2026, Spring 2027), HLSC227 (Spring 2025, Spring 2026, Spring 2027)

## Interdisciplinary Business Honors (`honors-ibh`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: HBUS307 (last Fall 2025)

**Seasonal**: HBUS100 (Fall 2025, Fall 2026), HBUS105 (Spring 2025, Spring 2026, Spring 2027), HBUS200 (Fall 2025, Fall 2026), HBUS205 (Spring 2025, Spring 2026, Spring 2027)

## University Honors (`honors-uh`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: HNUH379T (last Fall 2025), HNUH388T (catalog only)

**Seasonal**: HNUH318T (Fall 2025, Fall 2026), HNUH319T (Fall 2025, Fall 2026), HNUH328T (Fall 2025, Fall 2026), HNUH329T (Fall 2026), HNUH338T (Fall 2025, Fall 2026), HNUH348T (Fall 2025, Fall 2026), HNUH358T (Fall 2025, Fall 2026), HNUH359T (Fall 2025, Fall 2026), HNUH368T (Fall 2025, Fall 2026), HNUH369T (Fall 2025, Fall 2026), HNUH378T (Fall 2025, Fall 2026), HNUH398T (Fall 2025, Fall 2026)

## Carillon Communities (`llp-carillon`)

**Fixed**: none

**Unknown**

- CRLN101: named by the source ("the Carillon Studio (CRLN101)"), no catalog course

**Not offered recently**: none

**Seasonal**: none

## Flexus: Women in Engineering (`llp-flexus`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: none

**Seasonal**: ENED115 (Fall 2026), ENES114 (Spring 2025, Spring 2026, Spring 2027), ENES116 (Spring 2025, Spring 2026, Spring 2027), ENED215 (Fall 2026), ENES214 (Spring 2025, Spring 2026, Spring 2027), ENES216 (Spring 2025, Spring 2026, Spring 2027)

## Virtus: Men in Engineering (`llp-virtus`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: none

**Seasonal**: ENED115 (Fall 2026), ENES114 (Spring 2025, Spring 2026, Spring 2027), ENES116 (Spring 2025, Spring 2026, Spring 2027), ENED215 (Fall 2026), ENES214 (Spring 2025, Spring 2026, Spring 2027), ENES216 (Spring 2025, Spring 2026, Spring 2027)

## Jiménez-Porter Writers' House (`llp-writers-house`)

**Fixed**: none

**Unknown**

- AASP298L: named by the source; no AAAS course lists it as Formerly

**Not offered recently**: ARHU318A (last Spring 2025), ARHU318W (catalog only), ARHU319 (catalog only), ARHU319A (catalog only), ARHU319B (catalog only), ARHU375 (last Fall 2025), ENGL477 (catalog only), ARAB401 (catalog only), ARHU350 (catalog only), ARHU269I (catalog only), ARHU351 (catalog only), ARHU269A (catalog only), ENGL269M (catalog only), CMLT242 (catalog only), ENGL348 (catalog only), ENGL358 (catalog only), ENGL362 (last Fall 2025), ENGL379 (catalog only), ENGL439D (last Spring 2026), ENGL471 (catalog only), ENGL472 (catalog only), ENGL479 (catalog only)

**Seasonal**: ARHU300 (Fall 2025, Fall 2026), ARHU309 (Fall 2025, Fall 2026), ARHU318B (Spring 2026, Spring 2027), ARHU320 (Spring 2025, Spring 2026, Spring 2027), ENGL354 (Spring 2025, Spring 2026, Spring 2027), ENGL433 (Spring 2025, Fall 2025, Fall 2026)

## Language House (`llp-language-house`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: none

**Seasonal**: none

## FIRE: First-Year Innovation & Research Experience (`special-fire`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: none

**Seasonal**: FIRE120 (Fall 2025, Fall 2026), FIRE198 (Spring 2025, Spring 2026, Spring 2027), FIRE298 (Fall 2025, Fall 2026)

## UMD Fellows Program (`special-umd-fellows`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: none

**Seasonal**: FGSM310 (Fall 2025, Fall 2026), HNUH318T (Fall 2025, Fall 2026), FGSM315 (Fall 2025, Fall 2026), HNUH319T (Fall 2025, Fall 2026), FGSM320 (Fall 2025, Fall 2026), HNUH328T (Fall 2025, Fall 2026), FGSM325 (Fall 2026), HNUH329T (Fall 2026), FGSM330 (Fall 2025, Fall 2026), HNUH338T (Fall 2025, Fall 2026), FGSM340 (Fall 2025, Fall 2026), HNUH348T (Fall 2025, Fall 2026), FGSM350 (Fall 2025, Fall 2026), HNUH358T (Fall 2025, Fall 2026), FGSM355 (Fall 2025, Fall 2026), HNUH359T (Fall 2025, Fall 2026), FGSM360 (Fall 2025, Fall 2026), HNUH368T (Fall 2025, Fall 2026), FGSM365 (Fall 2025, Fall 2026), HNUH369T (Fall 2025, Fall 2026), FGSM370 (Fall 2025, Fall 2026), HNUH378T (Fall 2025, Fall 2026), FGSM390 (Fall 2025, Fall 2026), HNUH398T (Fall 2025, Fall 2026), ENGL381 (Fall 2025, Fall 2026), HONR368A (Fall 2025, Fall 2026)

## Departmental Honors: Aerospace Engineering (`dept-honors-aero`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: ENAE410H (catalog only)

**Seasonal**: ENAE283H (Fall 2025, Fall 2026), ENAE423H (Fall 2025, Fall 2026)

## Departmental Honors: American Studies (`dept-honors-amst`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: none

**Seasonal**: none

## Departmental Honors: Anthropology (`dept-honors-anth`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: none

**Seasonal**: none

## Departmental Honors: Art (`dept-honors-art`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: none

**Seasonal**: ARTT480H (Fall 2025, Fall 2026)

## Departmental Honors: Art History & Archaeology (`dept-honors-arth`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: none

**Seasonal**: none

## Departmental Honors: Bioengineering (`dept-honors-bioe`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: none

**Seasonal**: none

## Departmental Honors: Biology (`dept-honors-biol`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: none

**Seasonal**: none

## Departmental Honors: Cell Biology & Molecular Genetics (`dept-honors-cbmg`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: none

**Seasonal**: none

## Departmental Honors: Chemistry and Biochemistry (`dept-honors-chem`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: CHEM399 (last Summer 2026)

**Seasonal**: none

## Departmental Honors: Communication (`dept-honors-comm`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: none

**Seasonal**: none

## Departmental Honors: Economics (`dept-honors-econ`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: none

**Seasonal**: ECON396 (Fall 2025, Fall 2026), ECON397 (Spring 2025, Spring 2026, Spring 2027)

## Departmental Honors: Engineering (Clark School) (`dept-honors-eng`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: none

**Seasonal**: ENES480 (Fall 2025, Fall 2026), ENES481 (Spring 2025, Spring 2026, Spring 2027)

## Departmental Honors: English (`dept-honors-engl`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: ENGL428 (catalog only)

**Seasonal**: ENGL370 (Spring 2025, Spring 2026, Spring 2027), ENGL373 (Fall 2025, Fall 2026)

## Departmental Honors: Environmental Science and Policy (`dept-honors-ensp`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: none

**Seasonal**: none

## Departmental Honors: Entomology (`dept-honors-entm`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: none

**Seasonal**: none

## Departmental Honors: Geology (`dept-honors-geol`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: none

**Seasonal**: GEOL497H (Spring 2025, Spring 2026, Spring 2027)

## Departmental Honors: Germanic Studies (`dept-honors-gers`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: GERS398H (catalog only)

**Seasonal**: none

## Departmental Honors: Government & Politics (`dept-honors-gvpt`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: none

**Seasonal**: none

## Departmental Honors: History (`dept-honors-hist`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: none

**Seasonal**: HIST395 (Fall 2025, Fall 2026), HIST396 (Spring 2025, Spring 2026, Spring 2027)

## Departmental Honors: Kinesiology (`dept-honors-knes`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: none

**Seasonal**: KNES476 (Fall 2025, Fall 2026), KNES477 (Spring 2025, Spring 2026, Spring 2027)

## Departmental Honors: Mathematics (`dept-honors-math`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: MATH498 (last Spring 2025)

**Seasonal**: MATH404 (Spring 2025, Spring 2026, Spring 2027), MATH407 (Fall 2025, Fall 2026), MATH432 (Fall 2025, Fall 2026), MATH436 (Fall 2025, Fall 2026), MATH446 (Spring 2025, Spring 2026, Spring 2027)

## Departmental Honors: Physics (`dept-honors-phys`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: PHYS499 (last Summer 2026)

**Seasonal**: none

## Departmental Honors: Psychology (`dept-honors-psyc`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: none

**Seasonal**: PSYC498H (Spring 2025, Spring 2026, Spring 2027)

## Departmental Honors: Spanish & Portuguese (`dept-honors-span`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: none

**Seasonal**: none

## Departmental Honors: Women, Gender, and Sexuality Studies (`dept-honors-wgss`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: none

**Seasonal**: WGSS487 (Spring 2025, Spring 2026, Spring 2027)

## Departmental Honors: Criminology & Criminal Justice (`dept-honors-ccjs`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: CCJS489H (last Spring 2026)

**Seasonal**: CCJS388H (Fall 2026)

## Departmental Honors: Hearing & Speech Sciences (`dept-honors-hesp`)

**Fixed**

- EDMS451 → QMMS451 (source: "PSYC 200, EDMS 451 or BIOM 301"; QMMS451 "Formerly: EDMS451"). Golden test updated deliberately (it used EDMS451).

**Unknown**: none

**Not offered recently**: none

**Seasonal**: QMMS451 (Spring 2026, Summer 2026, Fall 2026)

## Departmental Honors: Neuroscience (`dept-honors-neur`)

**Fixed**: none

**Unknown**: none

**Not offered recently**: none

**Seasonal**: none
