# RecWell classes and reservations: spec and plan (overtime mode, 2026-10-09)

Owner (2026-10-09): "should be able to easily register for fitness classes (ex. Pilates) at gyms at
umd like Ritchie coliseum, eppley, etc. should be able to reserve fields/courts/ anything else fitness
related through the app if that's an option for any of the fitness stuff (ex. Pickleball courts,
rock-climbing wall)". Overtime mode is on, so the main session made the calls below; they're listed
for the owner in the progress report.

## What UMD offers (checked 2026-10-09)

| Thing | Where it's booked | Rules (RecWell's pages) |
|---|---|---|
| Group fitness classes (Pilates, yoga, cycling, BodyPump, Zumba, ...) | ActiveTerp (`activeterp.umd.edu`, Innosoft Fusion, UMD single sign-on) or the UMD RecWell app | Sign-ups open 24 hours before class; cancel at least 1 hour before. First time: add the free Group Fitness Membership and sign the waiver. Included in student fees. |
| Racquetball, wallyball, squash courts (Eppley) | ActiveTerp booking, `https://activeterp.umd.edu/booking` | Reservations recommended. |
| Eppley tennis courts (8, lighted) | Planyo, `https://www.planyo.com/booking.php?calendar=36698` | Reservations recommended; 48 hours ahead, 1 court, 2 hours a day (RecWell facility page). |
| Pickleball (16 courts at the Eppley tennis complex) | Not bookable | "Drop-in play only - no reservations"; priority on select courts Tue, Thu and Sun evenings. |
| Bouldering Zone (indoor) | ActiveTerp | Reservations open 24 hours ahead. |
| Climbing wall (outdoor, Adventure Program) | No booking for regular use (check in with UMD ID); private rental by request form at least 3 weeks ahead (from $250) | |
| Fields | Organizations only, through RecWell's EMS (`scheduling.crs.umd.edu`) | Individuals can't reserve fields. |

**Sources:**
- RecWell Group Fitness page (`recwell.umd.edu/programs-activities/fitness/group-fitness`): one HTML
  table per day (Day, Class, Location, Instructor, Start Time, End Time, Registration Link). Each
  "Register Here" link goes straight to the class's ActiveTerp page
  (`https://activeterp.umd.edu/Program/GetProgramDetails?courseId=<uuid>`).
- Court Reservations (`recwell.umd.edu/facilities/court-reservations`), the climbing wall page, and
  Group Fitness FAQ.

**Limits:**
- `recwell.umd.edu/robots.txt` allows these pages.
- **ActiveTerp's `robots.txt` disallows every crawler except Googlebot**, and booking needs the
  student's own UMD sign-in. So TurboTerp never reads ActiveTerp pages, never fills its forms, and
  never asks for UMD credentials (legal.md; the same rule as LibCal study rooms).
- Booking inside the app would need RecWell to grant API access (Innosoft Fusion and Planyo both have
  APIs). That's an owner email, like the LibCal one.

## Design (Level 1: no permission needed)

1. **Classes data.**
   - `packages/campus-data/src/group-fitness.ts` adds
     `parseGroupFitness(html): FitnessClass[]`, where
     `FitnessClass = { day, name, location, instructor, start, end, signupUrl }`. `start` and `end` are
     minutes after midnight; parse the times case-insensitively, since the page mixes "5:15pm" and
     "5:30PM". Rows whose end is before or equal to their start are kept, with `end` set to
     `undefined` (the page has a 4:00PM-4:00PM row).
   - `signupUrl` is kept only when it's an `https://activeterp.umd.edu/` link.
   - The data is fetched by the existing daily campus refresh, next to RecWell hours, using the same
     snapshot store and the same "layout check" that alerts when the page changes shape.
2. **Gyms page: "Classes" section.**
   - A day picker (today by default) and filter chips by kind: Mind-body (Pilates, Barre, Yoga),
     Cycling, Strength, Dance and cardio, Aqua. Map class names to kinds by keyword; unknown names go
     to "Other".
   - A place filter: Eppley, Ritchie, Regents.
   - Each row shows time, class, studio and instructor, plus one action, **Sign up**, which opens the
     class's ActiveTerp page in a new tab.
   - Before the 24-hour window, the row says "Sign-ups open <weekday> <time>". The button still opens
     the page, so the student can see the class.
   - A first-time card (dismissible, stored per device) says: "First time? Add the free Group Fitness
     Membership on ActiveTerp and sign the waiver." It links to ActiveTerp.
3. **Gyms page: "Reserve" section.** Static cards, each with a source link and an "as of" date:
   - Tennis courts (Planyo link, rules);
   - Racquetball, wallyball and squash (ActiveTerp booking);
   - Bouldering Zone (ActiveTerp, 24 hours ahead);
   - Pickleball (drop-in, no reservations; priority evenings Tue, Thu and Sun, from the hours data);
   - Climbing wall (no booking needed; private rental request form);
   - Fields (organizations only, through RecWell).
   - The data lives in `packages/campus-data/src/recwell-reserve.ts` so it's testable and easy to
     update.
4. **Today:** no change in this pass (idea: "Your next class" once classes can be saved).

**Not built:** booking or spots-left inside the app (Level 2, needs RecWell). New to-do: email RecWell
asking for Fusion and Planyo API access.

## Tasks

- **Builder F1 (Sonnet, `feat/recwell-classes`), test-first:** the parser, with a trimmed fixture of
  the real page saved by the main session (`packages/campus-data/test/fixtures/group-fitness.html`).
  Then the refresh job and snapshot wiring, following the RecWell hours pattern. Then the Classes
  section on the Gyms page, the reserve data and the Reserve section. Two screenshots.
- **Main session:** review, merge, full suite, screenshots in the progress report for UI approval;
  add the RecWell email to the to-dos.
