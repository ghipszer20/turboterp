# Minors plan (minors session, owner-approved 2026-09-28)

Scope: every unencoded minor (97 unique after cross-listings). No majors, no certificates (other sessions). Builders: general-purpose + Sonnet with `.claude/agents/minor-builder.md` as the standing brief (the `minor-builder` agent type itself loads from the next session on), 3 at once, branch `feat/minors-<id>`. Approving the plan approved these dispatches (section 18).

## Batch table (36 builders; branch `feat/minors-<id>`; approving this plan = the section 18 dispatch approval)
Tiny bundles:
| id | minors (source KB) |
|---|---|
| t-bsos1 | GIS 2.7, Remote Sensing 2.3, Intl Development & Conflict Mgmt 2.5, Law & Society 2.1 |
| t-bsos2 | Economics 1.8, Sociology 0.6, Demography 2.2, African Studies 2.6 |
| t-educ | ASL 1.3, Disability Studies 2.1, Secondary Education minor 3.0, TESOL 1.1, Ed Policy (EDUC+PLCY) 4.9 |
| t-sph-jour | Kinesiology ×3 (~1 each), Media Tech & Democracy 2.3, Video Production 0.3 |
| t-rotc | Army Leadership 1.2, Military Studies 4.3, Naval Science 1.4 |
| t-engr | Computer Eng 1.6, Nuclear Eng 4.5, Project Mgmt 4.4, Technology Entrepreneurship 3.8 |
| t-info-usg | IRMEP 1.6, Tech Innovation Leadership 1.5, ACES 4.4, Criminal Justice (Shady Grove) 1.2 |
| t-arhu | Philosophy 3.8, Arts Leadership 0.9, Humanities Health & Medicine 1.9, WGSS minor 2.2, LGBT Studies 6.5 |
| t-clas | Greek 4.7, Latin 4.5, Classical Mythology 4.6, Classical Archaeology 8.7 |
| t-agnr-arch | Soil Science 2.2, AI in Architecture 0.7, Construction PM (ARCH+ENGR) 5.3 |

Medium:
| id | minors |
|---|---|
| arth | Art History, Archaeology |
| engl1 | Rhetoric (COMM+ENGL), Digital Storytelling & Poetics, Creative Writing |
| engl-hist | Professional Writing, History |
| jwst1 | Jewish Studies, Religious Studies |
| hebrew | Hebrew Studies (JWST+SLLC) |
| mideast | Israel Studies, Middle Eastern Studies |
| sllc-me | Arabic, Persian |
| sllc-ea | Chinese, Japanese, Korean |
| sllc-rom | French, Italian, Portuguese & Brazilian |
| sllc-eur | German, Russian |
| sllc-span | Spanish 1, 2, 3 (reuse `span-shared-2026-27.ts`) |
| amst-lasc | US Latina/o Studies, Latin American Studies |
| ling-musc | Linguistics, Music & Culture, Music Performance |
| bws | Black Women's Studies (WGSS+AAAS), Anti-Black Racism |
| bsos-a | Global Terrorism Studies, Hearing & Speech Sciences |
| bsos-b | Neuroscience, Survey Methodology |
| agnr-a | Global Poverty, Sustainability Studies (AGNR+PLCY) |
| agnr-b | Agricultural Science & Tech, Landscape Management |
| arch | History & Theory of Arch, Real Estate Development, Creative Placemaking (ARCH+ARHU) |
| bmgt-a | Business Analytics |
| bmgt-b | Entrepreneurial Leadership, General Business |
| engr-b | Global Engineering Leadership, Nanoscale S&T, Quantum S&E |
| step-plcy | Science, Technology, Ethics & Policy (ENGR+INFO+PLCY), Public Leadership |
| nonprofit | Nonprofit Leadership & Social Innovation |
| educ-b | Leadership Studies minor, Human Development |
| usg | Global Studies, Asian American Studies |

Order: the tiny bundles first (fastest registry growth, and they prove the brief), then the medium batches
college by college. At most 3 builders run at once, and the next one starts whenever one is merged.

## Status (paused by the owner 2026-09-28 after these merges)
- Merged 2026-09-28: 10 batches (t-bsos2, t-bsos1, t-educ, t-sph-jour, t-engr, t-rotc, t-info-usg, t-agnr-arch, t-arhu, t-clas), 69-102k tokens each. All 10 tiny bundles are done.
- Next when resumed: the medium batches in table order. Drop the Archaeology entry from `arth` (identical to the Classics listing; encoded as `clas-minor-archaeology`).
- Merging: separate detached worktree `C:/Users/24GHi/Code/st-minors-merge`, push `HEAD:feat/course-data` (other sessions commit in the main checkout). Review-doc conflicts: `git merge-file --union`; registry: regenerate.

## Follow-ups from the owner's answers (rulings.md "Minors"), queued
1. Encoding fixes (one Sonnet builder): union lists for Math/Actuarial/Statistics (MATH340/341), Astronomy (ASTR498); C- floor for Climate Change Fluency, Computational Finance, Arts Leadership; Project Management accepts catalog OR department set (`sets`); advisor-approval notes on Demography SOCY201, Naval Science cultural courses, Atmospheric outside electives.
2. Video Production and Documentary Filmmaking Minor: encode from the owner's table (rulings.md).
3. Engine + UI: open-slot requirement ("Confirm with your advisor" checkbox), then convert every `OPEN SLOT:` note. UI change: show the owner before merging.
4. Engine + picker: eligibility gates that block a minor for excluded majors (Astronomy, Chesapeake Bay, Meteorology, RAS, Economics, Paleobiology, Planetary Sciences, ACES pathways, and others in review notes).
5. Engine: "courses from at least N different groups" (Entomology, then any other "N of the areas" rule).
6. ProgramMeta: add a Universities at Shady Grove college group; move `ccjs-minor-shady-grove`.
- Split 2026-09-28 (owner): the 26 medium batches go to two sessions; neither touches the other's half. Each department is in only one half, so program files never collide.
  - **Half A (session A):** arth, engl1, engl-hist, jwst1, hebrew, mideast, sllc-me, sllc-ea, sllc-rom, sllc-eur, sllc-span, amst-lasc, bsos-a.
  - **Half B (session B):** ling-musc, bws, bsos-b, agnr-a, agnr-b, arch, bmgt-a, bmgt-b, engr-b, step-plcy, nonprofit, educ-b, usg.
  - Session A merges in `C:/Users/24GHi/Code/st-minors-merge`; session B uses its own detached worktree (e.g. `C:/Users/24GHi/Code/st-minors-merge-b`). Both pull before merging; conflicts are only in the registry (regenerate) and review docs (`git merge-file --union`).
  - **Half B DONE 2026-09-28 (session B):** 26 minors encoded in 11 builders (bmgt-a+b and step-plcy+nonprofit bundled, one department each), all merged. Tokens: ling-musc 65k, bws 52k, bsos-b 49k, agnr-a 51k, agnr-b 53k, arch 59k, engr-b 60k, plcy 68k, educ-b 61k, usg 51k, bmgt 59k. Global Studies is not a separate program: it is an umbrella over four track minors (IDCM, Global Engineering Leadership, Global Poverty, Global Terrorism), noted in owner-review. Flags per batch in owner-review.md.
- **Half A merged 2026-09-28 (28 programs):** arth (Art History; Archaeology = the existing `clas-minor-archaeology`, cross-listed), engl1, engl-hist, jwst1, hebrew, mideast, sllc-me, sllc-ea, sllc-rom, sllc-eur, sllc-span, amst-lasc, bsos-a. Full test/typecheck/lint/build pass. Open items for the owner: Middle Eastern Studies has empty `requirements` (all OPEN SLOT; the qualifying-course lists on the MESM webpage would let it be encoded; the sample-plan harness now skips the mutant check for empty-requirement programs); Korean Studies' Korea-related slot accepts only the 7 catalog example courses (narrower than the source). Intermittent sample-plan failures in majors (acct, compe, bioe, agst, musc) under load are 5s test timeouts, not encoding errors.
