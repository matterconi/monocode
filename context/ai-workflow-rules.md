# AI Workflow Rules

## Approach

Build Matcode incrementally. Context files define the current state — always read them before acting. Do not infer behavior not defined here.

## Scoping Rules

- Work on one package at a time (`server` or `cli`)
- Prefer small verifiable changes over broad rewrites
- Do not mix server and CLI changes in the same step

## When to Split Work

Split if a step combines:
- Changes to both `server/` and `cli/`
- A new feature and a bug fix
- Behavior not defined in the context files

## Handling Missing Requirements

- Do not invent product behavior
- If a requirement is ambiguous, add an open question to `progress-tracker.md` before implementing

## Protected Files

Do not modify unless explicitly instructed:
- `bun.lock` — managed by `bun install`
- `AGENTS.md` — agent instructions
- `context/*.md` — only update, never delete

## Keeping Docs in Sync

Update context files when:
- A bug is fixed → update `current-issues.md` and `progress-tracker.md`
- An architecture decision is made → update `architecture.md`
- A new convention is established → update `code-standards.md`

## After Every Implementation Step

Run `bun run check` from the workspace root after writing or modifying code:

```bash
bun run check   # fallow dead-code && fallow dupes
```

- If dead exports are flagged: remove them or add them to `.fallowrc.json` `ignorePatterns` with a comment explaining why.
- If duplicates are flagged: extract shared logic before moving on.
- Do not suppress warnings without a written reason.

## Before Moving to the Next Unit

1. The current unit works end to end
2. `bun run check` passes clean
3. No invariant in `architecture.md` was violated
4. `progress-tracker.md` is up to date
5. `bun install` and both `bun run server` / `bun run cli` succeed
