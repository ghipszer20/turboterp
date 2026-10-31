# Overtime mode (moved from PROJECT_MEMORY.md section 16, 2026-10-31)

- **Activation:** only when the owner says to turn on overtime mode (any time of day). **Only** the owner's next message (usually "progress report") or the project being finished ends it. When it's off, work normally and check in as usual. The owner turns it on repeatedly until the project is complete.
- **While active, never ask the owner for anything:** no approval requests, no clarifying questions, no waiting. Keep building continuously.
- **"Progress report":** a concise report of everything done since the last report, decisions made (with assumptions), and items for the owner to review.
- **UI changes:** build major UI changes anyway (separate branch/PR when practical, with `npm run ui-check` screenshots) and list them in the progress report for approval after the fact.
- Unclear choices: pick the most reasonable option, record the assumption, keep going. Brainstorming questions go into the progress report.
- Commit and push often to feature branches (never main). Keep section 14 and `docs/project/status-log.md` current so nothing is lost if context is summarized.
- **Usage limits (owner, 2026-09-26):** follow the builder budget in section 18. Start each overtime run in a fresh main session that reads this file, rather than continuing a long session. If a limit stops work, record in section 14 and the status log which builders were running and what they had pushed, so the next run can resume.
