# Code Standards

## General

- No comments unless the WHY is non-obvious
- No tests at this stage
- Fix root causes, never layer workarounds
- Keep each file focused on a single responsibility

## TypeScript

- Strict mode enabled in all packages
- No `any` — use explicit types or narrow unions
- CLI package uses `jsxImportSource: "@opentui/react"` in tsconfig

## Hono

- Register middleware with `app.use()` before routes
- Always define `notFound` and `onError` handlers
- Do not `export default app` — use `Bun.serve({ fetch: app.fetch })` explicitly
- Port via `Number(process.env.PORT) || 3001`

## OpenTUI React

- Entry file must be `.tsx`, not `.ts`
- Always call `renderer.destroy()` on process exit for terminal cleanup
- Use JSX intrinsic elements: `<box>`, `<text>`, `<ascii-font>`, `<input>`
- Style via the `style` prop or direct props — no hardcoded inline strings

## File Organization

- `server/src/` — Hono app and route handlers
- `cli/src/` — React components and entry point
- `context/` — project context files, always kept up to date
