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
        │   ├── interaction-provider.tsx  # keyboard/layer/input/menu orchestration
        │   ├── mode-provider.tsx         # build/plan mode state
        │   ├── sessions-provider.tsx     # in-memory sessions cache
        │   └── theme-provider.tsx        # CLI theme state
        ├── commands/
        │   └── commands.ts # slash command registry metadata
        ├── hooks/
        │   └── use-command-menu.ts # command menu selection/window keyboard logic
        ├── types/              # CLI-only shared type contracts
        │   ├── commands.ts
        │   ├── dialogs.ts
        │   ├── interaction.ts
        │   ├── sessions.ts
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
        │   └── dialogs/           # dialog shell, overlay, search, and modal content
        │       ├── dialog.tsx
        │       ├── dialog-overlay.tsx
        │       ├── dialog-search-input.tsx
        │       ├── selectable-dialog-list.tsx
        │       ├── sessions-dialog.tsx
        │       └── theme-dialog.tsx
        └── lib/
            └── client.ts          # typed Hono RPC client (hc<AppType>)
```

## System Boundaries

- `apps/server/` — HTTP layer only. No business logic yet.
- `apps/cli/` — Terminal UI plus typed HTTP client setup. No product workflow API calls yet.

## Coding Agent Tools

- `packages/ai/src/tools/schemas.ts` — Zod validation schemas and explicit `Args`/`Input` types for each tool.
- `packages/ai/src/tools/definitions.ts` — server-facing AI SDK tool definitions (`description` + `inputSchema` only). No `execute` server-side.
- `packages/ai/src/tools/executor.ts` — CLI-side execution dispatcher. It accepts an AI SDK-shaped static tool call (`toolName` + `input`), validates with the matching schema, then calls the local implementation.
- `packages/ai/src/tools/calls.ts` — explicit `ToolCall` / `ToolName` union. This is intentionally manual for readability.
- `packages/ai/src/tools/sandbox.ts` — local workspace boundary for CLI-side tools. It resolves paths against the directory where the tool process is running, accepts an optional `@` prefix from inline file references, and blocks path escape outside that workspace. `MONOCODE_WORKSPACE_ROOT` can explicitly override the process cwd for dev wrappers or future launchers.
- `packages/ai/src/types.ts` — `CodingUIMessage` / `CodingUITools` for `useChat`.
- `packages/ai/src/messages/schemas.ts` — shared chat request validation (`chatRequestSchema`), minimal `UIMessage` boundary validation (`uiMessageSchema`), persisted-message parsing (`storedCodingMessagesSchema`) for DB → CLI hydration, and `storedMessagePartsSchema` for validating UI message parts before JSON persistence.

Tool architecture intentionally avoids a central generated registry. Adding a tool requires updating the schema, definitions, executor, call union, and UI tool types explicitly. This controlled duplication is preferred for now over `typeof registry`, indexed-access generics, or casts.

Chat request and message persistence validation live in `@monocode/ai`: routes import `chatRequestSchema` instead of defining request schemas inline, use `storedMessagePartsSchema` before writing UI parts into Prisma JSON, and the CLI uses `storedCodingMessagesSchema` when hydrating DB messages. Modes use `modeSchema` from `@monocode/ai` as the shared runtime/type source of truth, so validated `mode` values can flow into `modes[mode]` and `getToolsForMode(mode)` without casts. `Message.mode` is a first-class DB column, not metadata, because it controls message semantics and stable UI rendering.

## CLI Types

- CLI-only shared type contracts live under `apps/cli/src/types/`. This includes command metadata contracts, dialog context options, interaction handles/domains, session cache contracts, and theme shape contracts.
- Runtime registries and schemas stay outside `types/`: slash command data lives in `commands/commands.ts`, theme values live in `theme.ts`, and session Zod validation/helpers live in `lib/sessions.ts`.
- Component props and hook option types stay local when used by only one file. Do not move every interface into `types/`; use `types/` only for contracts shared across CLI modules.
- `Session` is derived from `sessionSchema` in `lib/sessions.ts` and re-exported through `types/sessions.ts`. `SessionsProvider` validates `GET /sessions` with `sessionsSchema` before caching data.

## CLI Command Menu

- `apps/cli/src/commands/commands.ts` is the static slash command registry. Runtime effects do not live in the registry. Commands may declare input activation metadata through `inputActivationBehavior` (`clear`, `blurAndClear`, `preserve`); `CommandMenu` asks the interaction layer to prepare the input before executing the runtime effect.
- Slash command runtime is owned by `CommandRuntimeProvider`, not `InteractionProvider`. It exposes `commands` and `executeCommand()` through `useCommandRuntime()`; `/new` navigates to `/`, `/exit` destroys the renderer, `/sessions` refreshes cached sessions and opens `SessionsDialog`, and `/theme` opens `ThemeDialog` through the generic dialog host.
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
