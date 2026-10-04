# TurboTerp

All-in-one UMD student app (iOS + web).

**Main session (the one talking with the owner):** read `PROJECT_MEMORY.md` before doing any work, and update it whenever a decision changes. It holds the full context, decisions, workflow rules and current state; detail lives in `docs/project/`.

**Builders (subagents dispatched to implement a task):** do NOT read `PROJECT_MEMORY.md`. Build only from your brief: it has the goal, the files involved, the owner rulings that apply and the done criteria. Read other `docs/project/` files only when the brief points to them. Work test-first in your own worktree and branch, and push early and often. The main session reviews your work before it merges.

**Navigate with the code graph before reading files (owner, 2026-09-27):** to find where something lives, what calls it or what a change affects, query the main checkout's graphify graph instead of grepping or opening files to explore, e.g. `graphify query "<question>" --graph C:/Users/24GHi/Code/SuperTerp/graphify-out/graph.json --budget 800`, `graphify explain "<symbol>" --graph ...`, `graphify affected "<symbol>" --graph ...`. Then read only the files you will change. The graph covers the working branch as of its last merge, so your own new code isn't in it.

Use the mattpocock-skills where they apply: tdd for new logic, domain-modeling for the degree-audit domain, code-review before finishing a branch.
Use the superpowers plugin skills for how work is done (brainstorming before new features, test-driven-development, systematic-debugging, verification-before-completion, requesting-code-review, finishing-a-development-branch). Where superpowers and mattpocock-skills overlap, prefer superpowers; keep mattpocock domain-modeling for the degree-audit domain.
Also use these superpowers skills whenever relevant (owner, 2026-09-25): verification-before-completion, requesting-code-review, finishing-a-development-branch, writing-plans, subagent-driven-development, dispatching-parallel-agents.
**GitHub Actions limit (owner, 2026-09-28):** once the account's GitHub Actions usage limit is hit (free minutes run out, or runs fail or queue for that reason), stop using GitHub Actions: don't trigger or wait on CI runs; run tests, typecheck, lint and build locally instead, and tell the owner the limit was reached.

When dispatching agents, PROJECT_MEMORY.md section 18 (builder budget) overrides these skills' defaults: builders on Sonnet, one agent per task with no reviewer subagents, at most 2 at once, short briefs.
