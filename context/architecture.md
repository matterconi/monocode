# Architecture

## Stack

| Layer      | Technology        | Role                          |
| ---------- | ----------------- | ----------------------------- |
| Runtime    | Bun 1.3.x         | JS runtime + package manager  |
| Server     | Hono              | HTTP routing and middleware    |
| CLI        | OpenTUI React     | Terminal UI rendering          |
| Language   | TypeScript        | All packages                  |

## Workspace Layout

```
Matcode/
├── package.json          # workspace root (private)
├── bun.lock
├── AGENTS.md
├── context/
├── apps/server/          # @matcode/server
│   ├── package.json
│   └── src/
│       ├── app.ts        # Hono app, chained routes, AppType
│       ├── rpc.ts        # type-only RPC contract export
│       └── index.ts      # Bun.serve entry
└── apps/cli/             # @matcode/cli
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── index.tsx
        ├── router.tsx        # createMemoryRouter, all routes registered here
        ├── routes.ts         # ROUTES array (path, key, label)
        ├── root-layout.tsx
        ├── screens/          # one file per route screen
        │   ├── home-screen.tsx
        │   ├── about-screen.tsx
        │   ├── counter-screen.tsx
        │   ├── llm-screen.tsx    # useCompletion → POST /completion
        │   └── not-found-screen.tsx
        └── lib/
            └── client.ts     # typed Hono RPC client (hc<AppType>)
```

## System Boundaries

- `apps/server/` — HTTP layer only. No business logic yet.
- `apps/cli/` — Terminal UI plus typed HTTP client setup. No product workflow API calls yet.

## Invariants

1. No `export default app` in the server entry — causes Bun to start a duplicate HMR dev server.
2. CLI must call `renderer.destroy()` before process exit to restore terminal state.
3. Server port is configurable via `PORT` env var, defaults to 3001.
4. Workspace packages are named `@matcode/<name>`, not the folder name — filters use the package name.
5. `@matcode/server/rpc` is the type-only RPC contract import path for clients that need `AppType` without a runtime server dependency.
6. Env vars obbligatorie vanno controllati in `index.ts` con `process.exit(1)` — non in `app.ts`.
7. In `ai@6.0.175` il metodo è `toUIMessageStreamResponse()`, non `toDataStreamResponse()` (rinominato).
8. Validazione Hono: usare `zValidator("json", schema, hook)` — il hook esplicito `!result.success` è obbligatorio; accedere al body con `c.req.valid("json")`, mai con `c.req.json()`.
