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
├── server/               # @matcode/server
│   ├── package.json
│   └── src/index.ts
└── cli/                  # @matcode/cli
    ├── package.json
    ├── tsconfig.json
    └── src/index.tsx
```

## System Boundaries

- `server/` — HTTP layer only. No business logic yet.
- `cli/` — Terminal UI only. No API calls yet.

## Invariants

1. No `export default app` in the server entry — causes Bun to start a duplicate HMR dev server.
2. CLI must call `renderer.destroy()` before process exit to restore terminal state.
3. Server port is configurable via `PORT` env var, defaults to 3001.
4. Workspace packages are named `@matcode/<name>`, not the folder name — filters use the package name.
