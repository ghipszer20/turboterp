# Working notes for the main session

Shell and tooling gotchas on the owner's PC. Moved out of PROJECT_MEMORY.md section 15 on 2026-09-27.

- Git Bash on this PC rewrites leading-slash arguments into Windows paths: prefix commands with `MSYS_NO_PATHCONV=1` when passing URL paths.
- In bash, `"$W\$1"` escapes the `$`; use forward slashes in Windows paths.
- **Never kill processes by image name** (`taskkill /IM node.exe` kills every Node process on the owner's PC). Kill only by PID, e.g. from `netstat -ano | grep :PORT`.
- Headless Edge `--screenshot` can't go below ~500px wide and fires before streamed content arrives. Use `apps/web/scripts/ui-check.mjs` (true mobile emulation, waits for JS).
- Next 16 ships its docs in `node_modules/next/dist/docs/`. Read them before using new APIs (Cache Components, `use cache`, `cacheLife`, `connection()`).
- Removing a worktree can fail on long `node_modules` paths: use the `\\?\` long-path prefix.
- A paused builder can still be resumed (e.g. by the owner's "resume"). Don't remove its worktree until its final report arrives: removing one on 2026-09-27 lost the builder's uncommitted doc edits, and it rebuilt the worktree to redo them.
- **Builder worktrees start from `origin/main`** (2026-09-28), which is only the initial commit. Every builder brief must say: first run `git checkout -b <branch> origin/feat/course-data` and then `npm install` in the worktree. Otherwise the builder spends ~10 tool calls working this out.
- **Check constructed plans for real courses** (2026-09-28): builders have invented plausible course numbers for elective slots. Check every sample-plan course against the Academic Catalog's approved-course list, `https://academiccatalog.umd.edu/undergraduate/approved-courses/<dept>/` (authoritative). umd.io only lists recently offered courses and misses real required ones (e.g. ENAE310, CHBE101). A course named in the program's own `program-sources/` file counts as backed even if the catalog list lacks it. Briefs for constructed plans list the department's real courses.
- **Never bulk-remove worktrees** (2026-09-28): a loop over `git worktree list` with `remove --force --force` wiped a running builder's worktree. Remove only the worktree of a builder whose completion notice has arrived.
- **Crash-zeroed files** (2026-09-29): when a run is cut off mid-write (a limit or power stop), a file can be left all NUL bytes at its old size and mtime, so git's stat cache doesn't notice and `checkout` doesn't restore it (merge-s1's `course-sets.generated.ts`: tests and typecheck failed with "Invalid character"). Even `git update-index --really-refresh` missed one (`registry.generated.ts`), so compare hashes instead when reusing a worktree after a stop: `git ls-files -s | awk '{print $2, $4}' > idx; awk '{print $2}' idx | git hash-object --stdin-paths > wt; paste -d' ' idx wt | awk '$1!=$3{print $2}'` lists every file whose content differs from the index; restore with `git show HEAD:<path> > <path>`.
