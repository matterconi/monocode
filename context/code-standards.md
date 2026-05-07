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
- Keep the Hono app in `apps/server/src/app.ts` and export `type AppType = typeof app` from the chained route value
- Re-export RPC client contracts from `@matcode/server/rpc`; CLI code should import `AppType` from that subpath with `import type`
- Always define `notFound` and `onError` handlers
- Do not `export default app` — use `Bun.serve({ fetch: app.fetch })` explicitly
- Port via `Number(process.env.PORT) || 3001`
- Validazione body: `zValidator("json", schema, (result, c) => { if (!result.success) return c.json({ error: result.error.flatten() }, 400) })` — poi `c.req.valid("json")` nel handler
- Check env obbligatori in `index.ts` prima di `Bun.serve()`, con `process.exit(1)`

## AI SDK (ai@6.0.175)

- Streaming server-side: `streamText({ model, prompt }).toUIMessageStreamResponse()` — non `toDataStreamResponse()` (non esiste in v6)
- Plain text stream: `toTextStreamResponse()` — compatibile con lettura manuale `res.body.getReader()`
- Client-side streaming in OpenTUI: `useCompletion` da `@ai-sdk/react` — compatibile con Bun (nessuna browser API), si aspetta endpoint POST con `{ prompt: string }` nel body

## OpenTUI React

- Entry file must be `.tsx`, not `.ts`
- Always call `renderer.destroy()` on process exit for terminal cleanup
- Use JSX intrinsic elements: `<box>`, `<text>`, `<ascii-font>`, `<input>`
- Style via the `style` prop or direct props — no hardcoded inline strings

## File Organization

- `server/src/` — Hono app and route handlers
- `cli/src/` — React components and entry point
- `context/` — project context files, always kept up to date
