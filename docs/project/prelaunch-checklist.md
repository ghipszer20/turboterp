# Prelaunch checklist (first-draft plan items 16 and 17)

Session 1 of `next-steps-plan.md` keeps this current. Nothing here rewrites the git history. The owner decides that step before the repo goes public.

## Done
- **License:** `LICENSE` is Apache-2.0, and the root `package.json` says `"license": "Apache-2.0"` (checked 2026-09-28).
- **Secret scan (2026-09-28):** tracked files and all history were scanned for API-key, AWS, GitHub-token and private-key patterns: nothing found. No `.env` file or transcript was ever committed. `.gitignore` covers `.env*` (except `.env.example`), `transcripts/` and `*transcript*.pdf`.
- **GTFS license (2026-09-29):** the "Interline GTFS License & Terms of Use" that Transitland links for `f-shuttleum~md~us` was deleted from GitHub (hence the 404), but its text is in that repository's history (commit `3db26c0` of `transitland/gtfs-archives-not-hosted-elsewhere`). It allows use, redistribution and derived works for "non-commercial, non-revenue purposes only limited to educational, scholarly, and governmental uses"; the data is "AS IS"; attribution is optional (legend: "Transit scheduling, geographic, and real-time data provided by permission of Interline."). TurboTerp fits (free, open source, no ads or paid tier, for students). Two notes for the owner: donations must stay cost-covering only, not revenue, and showing the optional legend on Transport is a cheap courtesy. The feed itself is now published by Actionfigure (`feed.actionfigure.ai`, data@actionfigure.ai); asking DOTS in the GTFS-RT email is still worthwhile.

## Personal details to scrub before going public
- **The owner's academic profile:**
  - PROJECT_MEMORY.md section 13 "Owner profile", and section 17 ("The owner is in Math Applied").
  - `docs/project/rulings.md` (Math rulings) and `docs/project/first-draft-plan.md` (the test students).
  - Comments in `packages/audit/programs/cmsc-major-2026-27.ts` and `math-major-applied-2026-27.ts`.
- **The local Windows user path** (`C:/Users/<user>/...`):
  - `CLAUDE.md`;
  - `.claude/agents/major-builder.md` and `minor-builder.md`;
  - PROJECT_MEMORY.md sections 13 and 18;
  - `docs/project/minors-plan.md`.

  Replace it with a relative path or a placeholder.
- **Internal working docs:** decide whether `docs/project/` (status log, owner review, session plans) is published at all, or moved out of the public repo.
- **Commit author:** every commit carries the owner's full name and terpmail address. Before going public, consider setting a GitHub noreply address for future commits (past ones stay unless the history is rewritten).
- **Git history:** the same details appear in older commits. The options are to publish a fresh squashed history, or to rewrite it with `git filter-repo`. The owner decides.

## Still to do
- **Terms and privacy pages:** drafts of the clickwrap terms and the privacy page (legal.md). This is a UI change, so the owner approves it.
- **"Not affiliated with the University of Maryland" on every page:** check it once the deployed layout exists.
