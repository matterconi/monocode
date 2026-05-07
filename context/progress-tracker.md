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
- Home textarea keybind fix: gestione diretta via `onKeyDown`, `Enter` invia submit, `Ctrl+J`/`linefeed`/Enter modificato inserisce newline
- Route metadata CLI estratta in `apps/cli/src/routes.ts` per rimuovere cicli `router` ↔ screen/layout
- Server Hono estratto in `apps/server/src/app.ts` con route chain tipata ed export `AppType` per Hono RPC
- CLI client Hono RPC aggiunto in `apps/cli/src/lib/client.ts`, tipato con `@matcode/server` `AppType`
- About screen CLI collegata al client tipato con esempio minimo `client.health.$get()` e render di `RPC /health: ok`
- Endpoint `GET /time` aggiunto per esempio didattico di type-safety Hono RPC: la CLI legge `body.timestamp` tipato e lo mostra in About
- RPC contract subpath aggiunto: la CLI importa `AppType` da `@matcode/server/rpc` e tiene `@matcode/server` solo in `devDependencies`
- `@types/react` aggiunto alla CLI per risolvere le dichiarazioni mancanti di React in editor/typecheck
- Risposta `GET /health` stretta a literal `"ok"` per allineare la type-safety Hono RPC allo stato CLI `HealthStatus`

## Completed (sessione corrente)

- LLM screen aggiunta (`apps/cli/src/screens/llm-screen.tsx`) con `useCompletion` da `@ai-sdk/react`
- Route `/llm` registrata in `routes.ts` e `router.tsx`
- Endpoint `GET /ai` — `generateText`, risposta JSON completa
- Endpoint `GET /llm-test2` — `streamText` + `toTextStreamResponse()`, plain text stream
- Endpoint `POST /completion` — `streamText` + `toUIMessageStreamResponse()`, UI message stream per `useCompletion`
- `zValidator` aggiunto a `POST /completion` con hook `!result.success` esplicito; body tipizzato via `c.req.valid("json")`
- `zod` e `@hono/zod-validator` installati in `@matcode/server`
- `@ai-sdk/react` installato in `@matcode/cli`
- Check `DEEPSEEK_API_KEY` aggiunto in `index.ts` — server esce con `process.exit(1)` se mancante
- Confermato: `toDataStreamResponse()` non esiste in `ai@6.0.175` — metodo corretto è `toUIMessageStreamResponse()`
- Confermato: `useCompletion` da `@ai-sdk/react` compatibile con OpenTUI/Bun (nessuna browser API)

## In Progress

- Terminal state cleanup on CLI exit (escape sequences leak dopo Ctrl+C)

## Next Up

- Decidere lo scopo del server e della CLI
- Aggiungere `renderer.destroy()` su SIGINT per cleanup terminale
- Riparare la chain tsconfig (`apps/*/tsconfig.json` cerca `apps/tsconfig.json`)
- Definire il primo workflow reale oltre al controllo health del server

## Open Questions

- What is the actual purpose of Matcode? (server + CLI do what?)
- Should CLI connect to the server, or are they independent tools?

## Architecture Decisions

- `export default app` removed: Bun treats a default export with a `fetch` method as a server entry and auto-starts its own HMR dev server on port 3000, conflicting with our explicit `Bun.serve()`.
- Port 3001 chosen to avoid conflict with common dev servers on 3000.
- OpenTUI React chosen over raw `@opentui/core` for component model and hooks.
- `--cwd cli` used instead of `--filter` for CLI root script: `--filter` wrappa lo stdio rompendo il TTY detection di OpenTUI. `--cwd` esegue direttamente nella directory del package ereditando il terminale reale.
- `@matcode/server` ora espone l'app Hono da package export per permettere alla CLI di importare `AppType` senza avviare `Bun.serve()`.
- Il client RPC della CLI punta al default locale `http://localhost:3001`; la configurazione dinamica resta fuori scope finché il workflow reale non è definito.
- I client RPC devono usare il subpath type-only `@matcode/server/rpc`; questo mantiene la type-safety Hono senza includere il server nel bundle/runtime della CLI.
