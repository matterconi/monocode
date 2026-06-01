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
Monocode/
├── package.json          # workspace root (private)
├── bun.lock
├── AGENTS.md
├── context/
├── apps/server/          # @monocode/server
│   ├── package.json
│   └── src/
│       ├── app.ts        # Hono app composition — mounts all route groups
│       ├── rpc.ts        # type-only RPC contract export
│       ├── index.ts      # Bun.serve entry
│       ├── ai/           # server-side AI provider resolution
│       │   └── model-resolver.ts # ModelId -> provider LanguageModel using server env keys
│       ├── middleware/   # reusable Hono middleware, not mounted by default
│       │   └── clerk-auth.ts # Clerk session auth middleware
│       └── routes/       # one file per route group, flat
│           └── chat.ts   # POST /chat — streaming AI chat
└── apps/cli/             # @monocode/cli
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── index.tsx
        ├── router.tsx        # createMemoryRouter, all routes registered here
        ├── routes.ts         # ROUTES array (path, key, label)
        ├── root-layout.tsx
        ├── screens/          # one file per route screen
        │   ├── home-screen.tsx   # route /, first submit creates a session
        │   └── chat-screen.tsx   # route /sessions/:sessionId, useChat → POST /sessions/:sessionId/messages
        ├── providers/
        │   ├── dialog-provider.tsx       # generic dialog host/state
        │   ├── auth/                     # in-memory CLI auth session and browser PKCE login action
        │   ├── interaction-provider.tsx  # keyboard/layer/input/menu orchestration
        │   ├── mode-provider.tsx         # build/plan mode state
        │   ├── sessions-provider.tsx     # in-memory sessions cache
        │   ├── toast-provider.tsx        # non-interactive toast notifications
        │   └── theme-provider.tsx        # CLI theme state
        ├── commands/
        │   └── commands.ts # slash command registry metadata
        ├── hooks/
        │   └── use-command-menu.ts # command menu selection/window keyboard logic
        ├── types/              # CLI-only shared type contracts
        │   ├── auth.ts
        │   ├── commands.ts
        │   ├── dialogs.ts
        │   ├── interaction.ts
        │   ├── sessions.ts
        │   ├── toasts.ts
        │   └── theme.ts
        ├── components/
        │   ├── chat/              # chat history/panel and AI SDK part renderers
        │   │   ├── message-list.tsx
        │   │   ├── chat-message.tsx
        │   │   ├── chat-panel.tsx
        │   │   ├── markdown-text.tsx
        │   │   ├── part-text.tsx
        │   │   ├── part-reasoning.tsx
        │   │   ├── part-tool.tsx
        │   │   └── borders.ts
        │   ├── input/             # shared home/chat input surface and metadata
        │   │   ├── input.tsx
        │   │   ├── input-surface.tsx
        │   │   └── input-meta.tsx
        │   ├── menus/             # inline suggestion popup menus
        │   │   ├── floating-list-menu.tsx
        │   │   ├── command-menu.tsx
        │   │   └── file-reference-menu.tsx
        │   ├── dialogs/           # dialog shell, overlay, search, and modal content
        │   │   ├── dialog.tsx
        │   │   ├── dialog-overlay.tsx
        │   │   ├── dialog-search-input.tsx
        │   │   ├── selectable-dialog-list.tsx
        │   │   ├── sessions-dialog.tsx
        │   │   └── theme-dialog.tsx
        │   └── toasts/            # absolute top-right toast viewport and card
        │       └── toast-viewport.tsx
        └── lib/
            ├── auth/              # CLI-only OAuth PKCE helpers
            └── client.ts          # typed Hono RPC client (hc<AppType>)
```

## System Boundaries

- `apps/server/` — HTTP layer only. No business logic yet.
- `apps/cli/` — Terminal UI plus typed HTTP client setup. No product workflow API calls yet.

## Coding Agent Tools

- `packages/ai/src/agents/coding-agent.ts` — shared coding-agent stream composition. It owns the base system prompt, mode prompt suffix application, tool selection, `stepCountIs(10)`, and `streamText()` call. Server routes pass the concrete provider model and persistence callbacks so HTTP/auth/DB ownership stays in `apps/server`.
- `packages/ai/src/models/` — shared model registry split by responsibility: `constants/models.ts` holds static Vercel AI Gateway model definitions/order, `schemas.ts` holds runtime Zod schemas, `types.ts` holds derived model types, and `defaults.ts` holds coding/title defaults. It describes supported Gateway model ids but does not read API keys or create provider clients; Gateway credentials remain server-side env vars such as `AI_GATEWAY_API_KEY`.
- `apps/server/src/ai/model-resolver.ts` — server-only resolver from shared `ModelId` to concrete AI SDK Gateway model via `gateway(modelId)`. It validates declared model setting overrides but does not create provider-specific clients.
- `packages/ai/src/tools/schemas.ts` — Zod validation schemas and explicit `Args`/`Input` types for each tool.
- `packages/ai/src/tools/definitions.ts` — server-facing AI SDK tool definitions (`description` + `inputSchema` only). No `execute` server-side.
- `packages/ai/src/tools/executor.ts` — CLI-side execution dispatcher. It accepts an AI SDK-shaped static tool call (`toolName` + `input`), validates with the matching schema, then calls the local implementation.
- `packages/ai/src/tools/calls.ts` — explicit `ToolCall` / `ToolName` union. This is intentionally manual for readability.
- `packages/ai/src/tools/sandbox.ts` — local workspace boundary for CLI-side tools. It resolves paths against the directory where the tool process is running, accepts an optional `@` prefix from inline file references, and blocks path escape outside that workspace. `MONOCODE_WORKSPACE_ROOT` can explicitly override the process cwd for dev wrappers or future launchers.
- `packages/ai/src/types.ts` — `CodingUIMessage` / `CodingUITools` for `useChat`.
- `packages/ai/src/messages/schemas.ts` — shared chat request validation (`chatRequestSchema`), minimal `UIMessage` boundary validation (`uiMessageSchema`), persisted-message parsing (`storedCodingMessagesSchema`) for DB → CLI hydration, and `storedMessagePartsSchema` for validating UI message parts before JSON persistence.

Tool architecture intentionally avoids a central generated registry. Adding a tool requires updating the schema, definitions, executor, call union, and UI tool types explicitly. This controlled duplication is preferred for now over `typeof registry`, indexed-access generics, or casts.

Chat request and message persistence validation live in `@monocode/ai`: routes import `chatRequestSchema` instead of defining request schemas inline, use `storedMessagePartsSchema` before writing UI parts into Prisma JSON, and the CLI uses `storedCodingMessagesSchema` when hydrating DB messages. Modes use `modeSchema` from `@monocode/ai` as the shared runtime/type source of truth, so validated `mode` values can flow into `modes[mode]` and `getToolsForMode(mode)` without casts. `Message.mode` is a first-class DB column, not metadata, because it controls message semantics and stable UI rendering.

Model selection uses `modelSchema` from `@monocode/ai` as the shared runtime/type source of truth. Static model metadata is named `ModelDefinition` / `modelDefinitions` and currently contains only product-facing metadata plus declared settings; agent behavior such as tool selection or reasoning display is not modeled as generic booleans in the registry. `chatRequestSchema` defaults missing `model` to `defaultCodingModelId`, while session title generation stays on `defaultTitleModelId` so future user-facing model selection changes only the coding agent and not the title mini-call. Vercel AI Gateway is the single model provider boundary: the server requires `AI_GATEWAY_API_KEY`, imports `gateway` from `ai`, and does not depend on provider SDK packages such as `@ai-sdk/deepseek` or `@ai-sdk/openai`. The CLI `AgentProvider` currently owns only selected `modelId`; model setting overrides stay out of CLI state until `/model` exposes verified Gateway/provider-specific settings.

`Session.userId` stores the Clerk user id for the authenticated user that owns the session. Session list/create and message hydration/streaming are scoped by `c.var.auth.userId`; missing or non-user auth returns `401`, and session ids that do not belong to the current user return `404`. API responses keep `userId` server-side and only expose session fields needed by the CLI.

## CLI Types

- CLI-only shared type contracts live under `apps/cli/src/types/`. This includes command metadata contracts, dialog context options, interaction handles/domains, session cache contracts, and theme shape contracts.
- Runtime registries and schemas stay outside `types/`: slash command data lives in `commands/commands.ts`, theme values live in `theme.ts`, and session Zod validation/helpers live in `lib/sessions.ts`.
- Component props and hook option types stay local when used by only one file. Do not move every interface into `types/`; use `types/` only for contracts shared across CLI modules.
- `Session` is derived from `sessionSchema` in `lib/sessions.ts` and re-exported through `types/sessions.ts`. `SessionsProvider` validates `GET /sessions` with `sessionsSchema` before caching data.

## CLI Command Menu

- `apps/cli/src/commands/commands.ts` is the static slash command registry. Runtime effects do not live in the registry. Commands may declare input activation metadata through `inputActivationBehavior` (`clear`, `blurAndClear`, `preserve`); `CommandMenu` asks the interaction layer to prepare the input before executing the runtime effect.
- Slash command runtime is owned by `CommandRuntimeProvider`, not `InteractionProvider`. It exposes `commands` and `executeCommand()` through `useCommandRuntime()`; `/new` navigates to `/`, `/exit` destroys the renderer, `/sessions` refreshes cached sessions and opens `SessionsDialog`, `/theme` opens `ThemeDialog` through the generic dialog host, `/login` starts browser PKCE auth with toast feedback, and `/auth` shows safe in-memory auth diagnostics including expired/expiring state.
- `/login` is CLI-only browser authentication. `CommandRuntimeProvider` calls `useAuth().actions.login()`, shows toast feedback, and does not change routes. `AuthProvider` stores the normalized `AuthSession` in memory only and automatically refreshes access tokens with the in-memory refresh token before expiry. CLI session creation/listing, message hydration, and chat streaming send `Authorization: Bearer <accessToken>` through `getAuthHeaders()`.
- `SessionsProvider` is mounted above `InteractionProvider` so dialogs rendered through `DialogOverlay` can read the same cache. It prefetches `GET /sessions` when the CLI starts, keeps an in-memory cache plus `loading`/`ready`/`error` status, exposes `refreshSessions()` for stale-while-revalidate updates, and exposes `cacheSession()` for in-memory upsert of sessions returned by creation flows.
- `POST /sessions` accepts an optional `title` and returns the full created session. Callers cache the returned session immediately through `SessionsProvider.cacheSession()` so new sessions appear in the modal cache without an extra fetch.
- `/new` navigates back to `/`. There is no draft route/state; the CLI has two route-level states: home (`/`) and chat (`/sessions/:sessionId`). Home first submit creates and caches a session, then navigates to `/sessions/:sessionId` with the prompt as `initialPrompt`.
- `POST /sessions/:sessionId/messages` updates the session title from the first user message when the session has no stored messages yet. Title generation uses a small `generateText()` call that categorizes the chat from the first prompt and stores a concise 2-5 word title, max 80 chars.
- `packages/db/scripts/title-sessions.ts` backfills missing titles for old sessions with deterministic `adjective-noun` names such as `magic-shampoo` or `fantastic-camomille`.
- `Input` is the shared home/chat input. It keeps layout-specific differences through a `variant` prop, owns the OpenTUI textarea ref, syncs visible `inputText`/`textCursorOffset` into `InteractionProvider`, registers textarea capabilities, and handles text submit only when `useInputInteraction().state.isActive` says the input is the active layer. Multi-line paste payloads are local `Input` state: an inline `[Pasted N lines]` pill with accent background appears beside the textarea, the textarea placeholder is hidden while a paste pill is active, and submit/`InputHandle.getInputText()` resolve the hidden pasted text back into the outgoing prompt.
- `InputSurface` is the layout-only inline interaction anchor. Screens render `InputSurface`, which composes `Input`, `FileReferenceMenu`, and `CommandMenu` inside a `position: relative` wrapper so popup menus stay visually attached to the input without making `Input` render menu components.
- `useSelectableList` is the generic CLI list-selection primitive for keyboard up/down, hover-driven selection, optional Enter confirmation, and `scrollChildIntoView` synchronization.
- `useCommandMenu` wraps `useSelectableList` with command-specific behavior and query-based dismissal state. Global cancel/confirm keys (`Esc`, `Ctrl+C`, `Tab`) are routed by `InteractionProvider`; when the command menu is open, `Tab` executes the selected command instead of autocompleting it.
- `CommandMenu` is render-only: it receives commands and selected index, and draws the popup as a visual continuation of the input without owning command behavior. It uses an OpenTUI `<scrollbox>` capped at 5 rows so mouse/trackpad scroll works while the visual scrollbar is hidden.
- `sessions/:sessionId` is rendered through `ChatRoute` with `key={sessionId}` so opening a different session remounts `ChatScreen` and resets `useChat` state for that session.

## CLI Interaction Layers

- `InteractionProvider` is mounted in `RootLayout` under `DialogProvider`, `SessionsProvider`, and `ModeProvider`. It owns TUI interaction policy: the registered input handle, registered inline-menu controls, and global keyboard routing for `Ctrl+C`, `Esc`, and `Tab`. It reads dialog state from `DialogProvider` only to enforce layer priority.
- `createCliRenderer({ exitOnCtrlC: false })` keeps `Ctrl+C` inside application-level keyboard handling. `Ctrl+C` priority is: close active dialog, otherwise close file reference menu, otherwise close command menu and clear input, otherwise clear non-empty input, otherwise destroy the renderer and exit.
- `Esc` uses the same cancel chain as `Ctrl+C` but never exits the app when no layer consumes it.
- `Tab` is routed centrally: if a dialog is open it is consumed as a no-op; if a file reference menu is open it inserts the selected reference; if a command menu is open it executes the selected command; otherwise an active command input toggles the current mode through `ModeProvider.toggleMode()`.
- `Input` registers a narrow `InputHandle` with `InteractionProvider` (`clear`, `blur`, `getInputText`, `getTextCursorOffset`, `replaceTextRange`) so global layer actions can clear or edit text without owning OpenTUI refs directly. Text-editing implementation details such as OpenTUI `setSelection()` + `insertText()` stay inside `Input`.
- `CommandMenu` and `FileReferenceMenu` consume `InteractionProvider` through separate logical domains. They own their own scroll refs and `useSelectableList` state, publish their open state/cancel/confirm capabilities back to `InteractionProvider` through `CommandMenuHandle`/`FileReferenceMenuHandle`, and render through shared `FloatingListMenu` UI without prop plumbing from `Input`.
- `InteractionProvider` exposes semantically grouped interaction domains through selector hooks: `useInputInteraction()`, `useCommandMenuInteraction()`, and `useFileReferenceMenuInteraction()`. Each domain keeps its own `{ state, actions }` shape so consumers do not see unrelated interaction details. `input.state.isActive` is derived from the current layer stack (`dialog` > file reference menu > command menu > input), so `Input` does not need to inspect menu state before submitting. Hook-local controllers such as `useCommandMenu` and `useFileReferenceMenu` return grouped `{ state, actions, layout }` objects for the same reason.
- `commandMenu.state.canOpen` is derived by `InteractionProvider` from higher-priority layers such as dialog and file reference menu. `CommandMenu` must not import the file-reference interaction domain just to decide visual priority.
- `FloatingListMenu` is the shared render primitive for inline suggestion popups. It owns the absolute shell, borders, scrollbox, selected row background, and hover selection; specific menus provide only item ids/keys and row content.
- `InputSurface` composes `Input`, `FileReferenceMenu`, and `CommandMenu` inside the relative inline-menu anchor. There is no separate `MenuLayer` pass-through component.
- File references are handled by `FileReferenceMenu` through a separate `@` menu layer. The menu opens only when `@` starts a token at the beginning of the input or after whitespace, so email-style text and quoted `"@` text do not trigger it. Selecting an item replaces only the active `@query` token with a workspace-relative reference such as `@apps/cli/src/`.
- `useFileReferenceMenu` wraps `useSelectableList` for the `@` popup and reads workspace-relative file/folder suggestions from `lib/file-references.ts`.
- `ModeProvider` owns only mode state (`mode`, `toggleMode`). It does not call `useKeyboard`; mode keyboard policy belongs to `InteractionProvider`.

## CLI Dialogs

- Dialog state is owned by `DialogProvider` as `ReactNode | null`. It exposes `openDialog(dialog, options?)` and `closeDialog()` through `useDialog()`; it does not know about titles, search slots, command names, or product-specific modal types.
- `DialogProvider` renders `DialogOverlay` after its children. `DialogOverlay` renders only when a dialog is active. It is fullscreen, fixed over the current screen, uses the theme overlay color with alpha, keeps the underlying chat visible through the backdrop, and renders the active dialog node directly.
- `Dialog` is the generic card shell: it receives a `title` and `children`, renders the header/close affordance, uses theme colors, and constrains width with `maxWidth`.
- `DialogSearchInput` is the reusable controlled modal search input used by modal-specific composition roots. It remains a normal query field: pasted multi-line text is normalized to one line instead of creating paste blocks. Modal body layout is kept inline unless it becomes meaningfully reusable.
- Modal-specific components such as `SessionsDialog` and `ThemeDialog` compose the generic primitives and own local orchestration state such as search query. Their content components receive state through props, fetch data if needed, filter locally, and perform product-specific actions like navigation or theme selection.
- `SelectableDialogList` is the shared modal-list primitive for scrollbox rendering, keyboard up/down, Enter confirmation, hover selection, and hidden scrollbar styling. Modal-specific dialogs provide item filtering, row rendering, and confirm behavior.
- Command-to-dialog routing belongs in `CommandRuntimeProvider` for slash commands, while `DialogProvider` owns only the generic dialog host and `InteractionProvider` owns only keyboard/layer policy. `CommandRuntimeProvider` may open `SessionsDialog` for `/sessions` and `ThemeDialog` for `/theme`; the command menu, generic dialog primitives, and the interaction layer must not switch on modal types.
- `/sessions` opens the sessions modal above the current screen without route navigation. `SessionsDialog` owns the query, renders `DialogSearchInput`, and passes the query to the sessions content. `SessionsDialogContent` reads the prefetched `useSessions()` cache, filters locally, and navigates to `/sessions/:sessionId` on row click or Enter while closing the modal. Opening `/sessions` triggers a background `refreshSessions()` but does not block showing cached rows.
- `/theme` opens the theme modal above the current screen without route navigation. `ThemeDialog` owns the query, renders `DialogSearchInput`, filters `themeNames` locally, previews the selected/hovered theme through `previewTheme(themeName)`, and calls `selectTheme(themeName)` only on row click or Enter while closing the modal. Closing without confirmation clears the preview and keeps the previously selected theme.
- Session discovery is modal-based; there is no standalone `/sessions` route screen. The only session route is `/sessions/:sessionId`, which renders the chat for a concrete persisted session.
- Modal/input cleanup for command activation is owned by `InteractionProvider` through `commandMenu.actions.prepareInputForCommand(command)`, using command `inputActivationBehavior` metadata. `CommandMenu` confirms the selected command, asks the interaction layer to prepare the surface, then delegates the application effect to `CommandRuntimeProvider`. `DialogProvider` still disables cursor blinking before setting dialog state, but command runtime does not know about textarea cleanup.
- Trade-off: `InteractionProvider` accepts narrow registered capabilities instead of owning OpenTUI renderable refs directly. This keeps `Input`/menus as render/ref owners while centralizing layer keyboard policy.

## CLI Toasts

- Toast state is owned by `ToastProvider` as a non-interactive notification stack. It exposes `show()`, variant helpers (`success`, `error`, `warning`, `info`), `dismiss(id)`, and `clear()` through `useToast()`.
- `ToastProvider` renders `ToastViewport` after its children, similar to the dialog host pattern, but toasts do not create an interaction layer and do not block input, menus, dialogs, `Esc`, `Ctrl+C`, or `Tab`.
- The viewport is absolute top-right (`top: 2`, `right: 2`) and renders at most three visible toasts. When a fourth toast is added, the oldest visible toast is dropped and its timer is cleared.
- Toast cards use theme colors only: background panel from `theme.colors.backgroundPanel`, text from `theme.colors.text`/`textSoft`, and variant border colors from `success`, `danger`, `warning`, or `accent`.
- Runtime command effects may use toasts for lightweight feedback. Placeholder slash commands currently show an info toast instead of opening new screens or dialogs.

## CLI Auth

- CLI login/session state lives under `apps/cli/`. The server uses the reusable Clerk Hono middleware exported at `@monocode/server/middleware/clerk-auth` as a global gate before protected routes.
- `AuthProvider` owns auth state in React state inside `apps/cli/src/providers/auth/auth-provider.tsx`: `loading`, `unauthenticated`, `authenticating`, `authenticated`, or `error`, plus `AuthSession | null` and the latest error message.
- Auth sessions persist locally in `~/.config/monocode/auth-session.json` (or `$XDG_CONFIG_HOME/monocode/auth-session.json`) through `apps/cli/src/lib/auth/session-storage.ts`. The directory is created with `0700`, the file is written atomically through a temp file and chmodded to `0600`, and JSON is validated before use.
- CLI startup hydrates auth from the local session file. If the stored access token is already inside the refresh skew window, startup refreshes it before marking auth as `authenticated`; refresh failure deletes the file and asks the user to run `/login` again.
- `/login` starts Authorization Code + PKCE S256 for an OAuth public client. There is no client secret in the CLI.
- The authorize request includes `prompt=login` so Clerk asks for authentication again instead of silently reusing the current browser session.
- Required env vars for this CLI login phase are `CLERK_FRONTEND_API` and `CLERK_OAUTH_CLIENT_ID`. `.env.example` keeps single-underscore Clerk names and does not require `CLERK_OAUTH_CLIENT_SECRET`.
- OIDC discovery uses `CLERK_FRONTEND_API` as the issuer and `oauth4webapi.discoveryRequest()` / `processDiscoveryResponse()` before building the authorize URL.
- The browser is opened with `Bun.spawn()` directly: `open` on macOS, `cmd /c start ""` on Windows, and `xdg-open` on Linux.
- The callback server uses `Bun.serve()` on fixed loopback redirect URI `http://127.0.0.1:8976/oauth/callback`, which must be registered in Clerk. It is always stopped after success or failure.
- Protocol response fields remain snake_case at the OAuth boundary. The stored session is normalized to camelCase: `accessToken`, `refreshToken`, `idToken`, `expiresAt`, `tokenType`, `scope`, and camelCase `userInfo`.
- Refresh token flow is automatic and CLI-only. `AuthProvider` schedules refresh at `expiresAt - 60_000`, refreshes immediately if the token is already inside that skew window, deduplicates concurrent refreshes, persists rotated tokens locally, and clears both memory and disk state with a toast if refresh data is missing or the refresh grant fails. Refresh uses `oauth4webapi.refreshTokenGrantRequest()` / `processRefreshTokenResponse()` with `oauth.None()` for the public client and does not use a client secret.
- `AuthProvider.actions.refreshAccessToken()` returns the next `AuthSession`. It updates `accessToken`, replaces `refreshToken` and `idToken` only when the provider returns new values, recalculates `expiresAt`, updates `tokenType`/`scope` sensibly, and keeps existing `userInfo`.
- `/logout` is CLI-only and local-first. `AuthProvider.actions.logout()` deduplicates concurrent logout calls, discovers Clerk OAuth metadata from `CLERK_FRONTEND_API`, uses the discovered `revocation_endpoint`, and revokes only the OAuth refresh token with `token_type_hint=refresh_token` and `oauth.None()` for the public PKCE client. It does not revoke the access token; JWT access tokens remain valid until natural expiry for this phase. The in-memory session and local session file are always cleared at the end, even if remote refresh-token revocation fails. The command runtime then clears the sessions cache and navigates back to `/`.
- `getAuthHeaders(auth)` builds authenticated request headers from the in-memory session and calls `auth.actions.refreshAccessToken()` first when the access token is inside the refresh skew window. Hono RPC calls pass those headers through client request options; `DefaultChatTransport` uses a dynamic `headers` resolver backed by the current auth ref.
- `/auth` reads `useAuth().state` and shows a toast with status, user identity, expiry, expired/expiring state, scope, and token presence only. It must not print full access, refresh, or ID tokens.
- Deferred auth work: CLI private access gating.

## Invariants

1. No `export default app` in the server entry — causes Bun to start a duplicate HMR dev server.
2. CLI must call `renderer.destroy()` before process exit to restore terminal state.
3. Server port is configurable via `PORT` env var, defaults to 3001.
4. Workspace packages are named `@monocode/<name>`, not the folder name — filters use the package name.
5. `@monocode/server/rpc` is the type-only RPC contract import path for clients that need `AppType` without a runtime server dependency.
6. Env vars obbligatorie vanno controllati in `index.ts` con `process.exit(1)` — non in `app.ts`.
7. In `ai@6.0.175` il metodo è `toUIMessageStreamResponse()`, non `toDataStreamResponse()` (rinominato).
8. Validazione Hono: usare `zValidator("json", schema, hook)` — il hook esplicito `!result.success` è obbligatorio; accedere al body con `c.req.valid("json")`, mai con `c.req.json()`.
9. Coding tools are executed client-side only. The server exposes tool definitions to the model, streams tool calls to the CLI, and the CLI returns outputs with `addToolOutput()`.
10. Slash command runtime behavior belongs in `CommandRuntimeProvider`; interaction policy for command menu/input keys belongs in `InteractionProvider`. `CommandMenu` bridges them by owning selected command state, applying command input lifecycle, and calling `executeCommand()`.
11. Dialog state belongs in `DialogProvider`; global layer keyboard behavior belongs in `InteractionProvider`. Dialog shells/content must not import or directly own textarea state.
12. `Session.userId` is a required Prisma field containing the owning Clerk user id. It is a data-isolation boundary, not metadata, and server routes must scope session access by it.
