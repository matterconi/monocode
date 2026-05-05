# Progress Tracker

## Current Phase

In progress — scaffolding

## Current Goal

Decidere cosa il server e la CLI faranno effettivamente.

## Completed

- Bun workspace monorepo initialized (`server/`, `cli/`)
- Hono server scaffolded (`GET /`, `GET /health`, logger middleware, error handler)
- OpenTUI React CLI scaffolded (ASCII title, info box, keyboard hint)
- `cli/tsconfig.json` configured with `jsxImportSource: "@opentui/react"`
- Port moved to 3001, configurable via `PORT` env var
- Removed `export default app` from server to prevent duplicate Bun HMR server
- Base `tsconfig.json` at root — `server` and `cli` extend it
- `@types/bun` installed at root — risolve `console` e API Bun in tutti i package
- `fallow` installato e configurato — `bun run check` nel workflow agentico
- CLI root script migrato da `--filter` a `--cwd cli` — fix TTY, CLI ora rimane aperta

## In Progress

- Terminal state cleanup on CLI exit (escape sequences leak dopo Ctrl+C)

## Next Up

- Decidere lo scopo del server e della CLI
- Aggiungere `renderer.destroy()` su SIGINT per cleanup terminale

## Open Questions

- What is the actual purpose of Matcode? (server + CLI do what?)
- Should CLI connect to the server, or are they independent tools?

## Architecture Decisions

- `export default app` removed: Bun treats a default export with a `fetch` method as a server entry and auto-starts its own HMR dev server on port 3000, conflicting with our explicit `Bun.serve()`.
- Port 3001 chosen to avoid conflict with common dev servers on 3000.
- OpenTUI React chosen over raw `@opentui/core` for component model and hooks.
- `--cwd cli` used instead of `--filter` for CLI root script: `--filter` wrappa lo stdio rompendo il TTY detection di OpenTUI. `--cwd` esegue direttamente nella directory del package ereditando il terminale reale.
