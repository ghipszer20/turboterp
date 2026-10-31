# TurboTerp next steps (written 2026-10-31)

Supersedes `next-steps-plan.md` and `overtime-plan-2026-09-29.md` for ordering. Owner decisions are marked **(owner)**; everything else Claude can run.

## Why now
**Spring 2027 registration is open.** Registrar calendar, checked live 2026-10-31:
- registration appointments: Oct 9
- priority registration: Oct 29
- early registration: Nov 2 – Dec 10
- first day of classes: Jan 27
- schedule adjustment: Jan 27 – Feb 9

The schedule builder and Seat Alerts are most useful in exactly these weeks, and again from Jan 27 to Feb 9. The site is locked (Coming soon) and Seat Alerts can't push yet. Every week before Dec 10 that the site stays locked is lost reach this semester. The seats job already treats Oct 29 – Dec 24 as a registration window (refresh every 5 minutes).

## 1. Finish the outage fixes (this week, ~15 min of owner time)
All in `owner-review.md`, first item:
- **(owner)** Set the four Supabase function secrets. This unblocks 5-minute seat counts and Seat Alerts pushes.
- **(owner)** Paste migrations 0012, 0013 and 0017.
- **(owner)** Optionally deploy the current branch.
- **Claude:** after the secrets are set, check the first seats run through the Supabase connector (status, duration, log entries per run). After 1–2 days, check Log Ingestion is about 10–15 MB a day.

## 2. Decide the launch date (owner)
The choice: open the site during Spring registration (before Dec 10, ideally by mid-November), or wait for the Jan 27 – Feb 9 adjustment period.
- **Claude's recommendation:** a soft launch in November for the Schedule builder, Seat Alerts and Campus. The Advisor can carry a "beta" note, because the real-student audit check (3) hasn't been done.
- **Blockers for any launch:** sections 3 and 4.

## 3. Launch blockers (Claude, unless marked)
1. **Real-student audit check** (roadmap, owner order 2026-10-08, never done):
   - **(owner)** find ~5 students willing to share, with consent, their UMD degree audit and unofficial transcript.
   - **Claude** imports each transcript, compares TurboTerp's audit with UMD's line by line, and fixes or documents every difference. Program questions are settled from UMD sources, never by the owner.
   - If this can't happen before launch, the Advisor launches labeled beta.
2. **Repo history:** the public repo's old commits contain the owner's name and terpmail.
   - **(owner)** choose a fresh squashed repo or a `git filter-repo` rewrite (prelaunch-checklist.md).
   - Claude prepares either one.
3. **Prelaunch checklist "Still to do" and "At launch":**
   - **(owner)** approve the terms and privacy pages.
   - **Claude** checks the "Not affiliated with UMD" line on every page.
   - **Claude** removes the site lock at launch.
   - **(owner)** handles sign-in email volume (Brevo plan for launch week; Google and Apple sign-in prominent).
   - **(owner)** checks the Vercel Analytics allowance.
4. **(owner)** Supabase Magic Link template: add the `{{ .Token }}` code line (owner-review.md), so email sign-in works from the Home Screen app.
5. **(owner)** Google brand verification: resubmit in Google Auth Platform → Verification Center (roadmap Known to-dos). Without it, the Google sign-in screen shows the unverified-app warning.

## 4. Clear the approval backlog (owner, one sitting)
`owner-review.md` has 24 items, 10 of them UI approvals dating back to 2026-09-29. Many are already live.
- **Claude:** build one review page with `npm run ui-gallery -w @turboterp/web`, holding a screenshot per pending approval and the exact question.
- **Owner:** approve or reject them all in one pass.
- **Claude:** records the answers in rulings.md and deletes the answered items, so the list holds only real decisions.
- Academic "confirm" items are not for the owner (2026-10-04 ruling). Claude settles them from UMD sources and removes them.

## 5. Branches
`main` is 88 commits behind `feat/ui-rework` (PR #12 merged earlier; no open PR). Production deploys come from `feat/ui-rework`.
- **(owner)** Open a new PR `feat/ui-rework` → `main` and merge it whenever you like. Claude never merges to main.
- Several sessions use the main checkout. Stage files by explicit path, and deploy only from the main checkout.

## 6. After launch
- **Watch usage weekly:** Vercel Usage and Supabase Usage (Log Ingestion). Triggers are in `scaling-plan.md` 5b and the prelaunch checklist (Supabase Pro at ~0.8 GB of logs a month).
- **Seat Alerts at scale:** batch pushes when one class has thousands of watchers (`scaling-plan.md` 5c).
- **iOS app:** Expo plan approved 2026-10-30, waiting on the owner's yes (`ios-plan.md` section 6, O1). Best timed after the web launch settles, before Fall 2027 registration (March 2027).
- **Data work in roadmap Known to-dos:**
  - Advisor catalog into the snapshot store (no deploy needed for course updates)
  - equivalence-audit course ids
  - deferred prerequisite phrasings
  - instructor review publishing
  - term picker (owner request (e), 2026-10-04)
- **RecWell and LibCal:** in-app sign-ups and booking need UMD to issue credentials. **(owner)** send the two emails in PROJECT_MEMORY section 10.

## Order
1 → 2 now. 3 and 4 in parallel (up to 3 builders). Launch. Then 6.
