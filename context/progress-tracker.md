# Progress Tracker

## Current Phase

In progress — scaffolding

## Current Goal

 Prossima lezione: consolidare il flusso chat/sessioni CLI con due stati route-level (`/` home, `/sessions/:sessionId` chat), input condiviso e layer interaction/menu/dialog.

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
- CLI client Hono RPC aggiunto in `apps/cli/src/lib/client.ts`, tipato con `@monocode/server` `AppType`
- About screen CLI collegata al client tipato con esempio minimo `client.health.$get()` e render di `RPC /health: ok`
- Endpoint `GET /time` aggiunto per esempio didattico di type-safety Hono RPC: la CLI legge `body.timestamp` tipato e lo mostra in About
- RPC contract subpath aggiunto: la CLI importa `AppType` da `@monocode/server/rpc` e tiene `@monocode/server` solo in `devDependencies`
- `@types/react` aggiunto alla CLI per risolvere le dichiarazioni mancanti di React in editor/typecheck
- Risposta `GET /health` stretta a literal `"ok"` per allineare la type-safety Hono RPC allo stato CLI `HealthStatus`

## Completed (sessione corrente)

- Chat screen aggiunta (`apps/cli/src/screens/chat-screen.tsx`) con `useCompletion` da `@ai-sdk/react`
- Route `/chat` registrata in `router.tsx` (navigazione programmatica da HomeScreen)
- Endpoint `GET /ai` — `generateText`, risposta JSON completa
- Endpoint `GET /llm-test2` — `streamText` + `toTextStreamResponse()`, plain text stream
- Endpoint `POST /completion` — `streamText` + `toUIMessageStreamResponse()`, UI message stream per `useCompletion`
- `zValidator` aggiunto a `POST /completion` con hook `!result.success` esplicito; body tipizzato via `c.req.valid("json")`
- `zod` e `@hono/zod-validator` installati in `@monocode/server`
- `@ai-sdk/react` installato in `@monocode/cli`
- Check `DEEPSEEK_API_KEY` aggiunto in `index.ts` — server esce con `process.exit(1)` se mancante
- Confermato: `toDataStreamResponse()` non esiste in `ai@6.0.175` — metodo corretto è `toUIMessageStreamResponse()`
- Confermato: `useCompletion` da `@ai-sdk/react` compatibile con OpenTUI/Bun (nessuna browser API)

## Completed (sessione corrente — database)

- `packages/db` creato come workspace `@monocode/db`
- Schema Prisma definito: `Session` (id, title, createdAt, updatedAt) + `Message` (id, sessionId, role, model, parts Json, metadata Json?, createdAt)
- `prisma.config.ts` configurato per Prisma Postgres con `env('DATABASE_URL')`
- `src/index.ts`: esporta `db` (PrismaClient + PrismaPg adapter) e re-esporta tipi generati
- `@monocode/db` aggiunto come `dependency` in `@monocode/server` e `devDependency` in `@monocode/cli`
- `trustedDependencies: ["prisma"]` aggiunto al root `package.json` per bypassare il preinstall Node.js version check
- Workspace installato con `bun install --ignore-scripts --force`
- `bunx --bun prisma db push` — schema sincronizzato con Prisma Postgres ✅
- `bunx --bun prisma generate` — client generato in `packages/db/generated/client/` ✅
- Seed eseguito: 2 sessioni, 3 messaggi ✅
- `scripts/verify.ts` conferma connessione live ✅
- Import path corretto: `../generated/client/client` (Prisma 7 genera `client.ts`, non `index.ts`)

## Completed (sessione corrente — refactor REST + URL-based session)

- `POST /chat` eliminato; logica spostata in `POST /sessions/:sessionId/messages` (sessionId dall'URL path)
- `routes/chat.ts` eliminato; `sessions.ts` ora gestisce tutti gli endpoint della risorsa Session
- CLI router: `"chat"` → `"sessions/:sessionId"` — sessionId nell'URL del memory router
- `HomeScreen`: naviga a `/sessions/${sessionId}`, passa solo `{ prompt }` nello state
- `ChatScreen`: usa `useParams<{ sessionId }>()` + `client.sessions[":sessionId"].messages.$url(...)` per l'URL RPC tipato; rimosso `body: { sessionId }` da `useChat`

## Completed (sessione corrente — wire-up chat ↔ database)

- `apps/server/src/routes/sessions.ts` aggiunto: `POST /sessions` crea una `Session` e restituisce `{ sessionId }`
- `POST /chat` aggiornato: accetta `sessionId` nel body, persiste il messaggio utente (con `upsert` per idempotenza), persiste il messaggio assistente in `onFinish`
- `/sessions` montato in `app.ts` — ora fa parte del tipo RPC `AppType`
- `HomeScreen.handleSubmit` ora async: chiama `client.sessions.$post()`, naviga passando `sessionId` nello state
- `ChatScreen` legge `sessionId` dallo state e lo passa come `body: { sessionId }` a `useChat`
- Parti assistente salvate come `[{ type: "reasoning", ... }, { type: "text", ... }]`; `usage` salvato in `metadata`

## Completed (sessione corrente — coding agent tools)

- `apps/server/src/tools/schemas.ts`: Zod input schemas per 5 tool — source of truth, esportati via `@monocode/server/tool-schemas`
- `apps/server/src/tools/index.ts`: `codingTools` shapes (description + inputSchema, no execute) — passati a `streamText`
- `apps/cli/src/tools/sandbox.ts`: `safePath()` + `BASE_DIR` — blocca path escape dal cwd della CLI
- `apps/cli/src/tools/`: `read-file.ts`, `write-file.ts`, `list-files.ts`, `run-command.ts`, `search-files.ts` — execute functions lato CLI
- `apps/cli/src/tools/index.ts`: `executeTool(name, args)` dispatcher; tipi da `@monocode/server/tool-schemas`
- `sessions.ts`: rimosso mock weather; usa `codingTools`; system prompt coding assistant; `stopWhen: stepCountIs(10)`
- `chat-screen.tsx`: `onToolCall` esegue tool localmente; `sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls`; `addToolOutput` con error handling
- **Testato e funzionante** ✓ — tool call flow, tool chaining, sandbox

## Completed (sessione corrente — modes)

- `packages/ai/src/modes/index.ts`: `ModeName`, `ModeConfig`, `modes` registry, `modeOrder`, `nextMode()`, `getToolsForMode()` — centralizza la logica di selezione tool per mode
- `packages/ai/src/index.ts`: re-esporta `./modes`
- `apps/server/src/routes/sessions.ts`: accetta `mode: z.enum(["build","plan"]).default("build")` nel body; chiama `getToolsForMode(mode)` e applica `systemPromptSuffix` per Plan mode
- `apps/cli/src/components/chat-input.tsx`: intercetta Tab in `onKeyDown` per ciclare mode; mostra indicatore `[BUILD]`/`[PLAN]` sotto la textarea con colori UI palette
- `apps/cli/src/components/chat-shell.tsx`: aggiunge `mode`/`onModeChange` alle props e le passa a `ChatInput`
- `apps/cli/src/screens/chat-screen.tsx`: `useState<ModeName>` + `modeRef`; `body: () => ({ mode: modeRef.current })` in `DefaultChatTransport` per inviare il mode corrente ad ogni richiesta

## Completed (sessione corrente — tool typing refactor)

- Tool typing semplificato in `@monocode/ai`: aggiunta `ToolCall` esplicita (`toolName` + `input`) al posto del dispatcher generico basato su `keyof typeof registry`
- `executeTool` spostato in `packages/ai/src/tools/executor.ts` con `switch` leggibile e validazione Zod per tool
- `definitions.ts` reso esplicito: costruisce `codingTools` tool-per-tool senza `Object.fromEntries` e senza cast
- `CodingUITools` reso esplicito in `packages/ai/src/types.ts`, senza derivazioni da `typeof registry`
- `ChatScreen.onToolCall` ora effettua il narrowing esplicito per nome tool prima di chiamare `executeTool`
- `ToolCall` riallineata alla shape AI SDK (`toolName` + `input`): `ChatScreen` chiama direttamente `executeTool(toolCall)` e non conosce più l'elenco dei tool
- `registry.ts` rimosso: la struttura tool è ora esplicita e minimale (`schemas.ts` per validation/types, `definitions.ts` per server, `executor.ts` per CLI, `types.ts` per `useChat`)
- Decisione confermata: mantenere duplicazione controllata nei tool per privilegiare leggibilità/debuggabilità; eventuale derivazione automatica sarà un refactor futuro solo se il numero di tool lo giustifica

## Completed (sessione corrente — modes + server type cleanup)

- `modeSchema` aggiunto in `packages/ai/src/modes/index.ts`; `ModeName` ora deriva dallo schema condiviso con `z.infer`
- `apps/server/src/routes/sessions.ts` usa `modeSchema.default("build")`, quindi `mode` arriva già tipato e non richiede più `mode as ModeName`
- `modes` semplificato: rimosso `allowedTools`, `getToolsForMode(mode)` usa uno `switch` esplicito tra `build` e `plan`
- Hook `zValidator` aggiornato a Zod v4: `result.success === false` + `z.flattenError(result.error)`
- `usage.promptTokens` / `usage.completionTokens` aggiornati a `usage.inputTokens` / `usage.outputTokens` per AI SDK v6
- Persistenza reasoning assistant aggiornata a `reasoningText`, compatibile con JSON Prisma senza cast aggiuntivi
- `packages/ai/src/messages/schemas.ts` aggiunto: `uiMessageSchema` valida il boundary HTTP minimo (`id`, `role`, `parts`) e `chatRequestSchema` combina `messages` + `modeSchema`
- `sessions.ts` ora importa `chatRequestSchema` da `@monocode/ai`, mantenendo la route focalizzata sul flow HTTP/streaming
- `apps/server/tsconfig.json` ora estende `../../tsconfig.json`, include `types: ["bun"]` e `include: ["src"]`; risolto il warning Fallow sulla chain tsconfig
- `PartTool` semplificato: rendering per stato convertito a `switch (part.state)` e rimosso il cast manuale per `errorText`
- `storedCodingMessagesSchema` aggiunto in `@monocode/ai` per validare/convertire messaggi persistiti DB → `CodingUIMessage[]`; rimossi i cast `CodingUIMessage["role"]` e `CodingUIMessage["parts"]` da `ChatScreen`
- `storedMessagePartsSchema` aggiunto in `@monocode/ai`: valida un array di part con `type: string` e campi extra JSON-safe; `sessions.ts` lo usa prima di salvare `lastUserMsg.parts` su Prisma JSON, rimuovendo il cast `as Prisma.InputJsonArray`

## Completed (sessione corrente — CLI theme)

- `apps/cli/src/theme.ts` aggiunto: registry theme color-only con default `dark`, `themeNames`, `ThemeName`, `Theme`, `getTheme()`
- `apps/cli/src/providers/theme-provider.tsx` aggiunto: `ThemeProvider` espone `themeName`, `themeNames`, `theme`, `selectTheme()` per selezione runtime da lista
- `ThemeProvider` montato in `apps/cli/src/index.tsx` sopra `ModeProvider` e `RouterProvider`
- Colori hardcoded rimossi dai componenti CLI principali e sostituiti con token da `useTheme()`
- Decisione: niente spacing/layout tokens nel theme; la feature riguarda solo colori
- `bun run check` rieseguito: nessun nuovo problema introdotto; fallisce ancora sugli issue preesistenti già tracciati (`unused files`, `pg` inutilizzata)
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` eseguito: il codice theme/provider passa, ma il comando fallisce su `apps/cli/src/scripts/test-chat.ts` obsoleto; issue aggiunta a `current-issues.md`
- Theme registry aggiornato con `theme.modes[mode]`: ogni tema selezionabile definisce accenti mode-specific per testo `[BUILD]`/`[PLAN]` e barra laterale input
- Input footer ridisegnato: `InputMeta` mostra mode, modello (`deepseek-reasoner`) e provider (`DeepSeek`) sulla prima riga; Tab/comandi sulla seconda riga
- `ChatInput` ora usa una barra laterale colorata dal mode corrente, allineata al comportamento già presente su `HomeTextarea`
- Sottotitolo home `Full-stack monorepo powered by Bun + Hono + OpenTUI` rimosso
- Input footer separato: `InputStatus` resta dentro il box input, `InputHints` con Tab/comandi viene renderizzato sotto e fuori dal box input
- Input status riallineato allo screenshot: mode label e modello/provider sono ravvicinati; hints più dim e padding bottom aggiunto sotto l'input
- Palette dark ritoccata verso accento viola e grigi meno contrastati per aderire al riferimento visuale
- `InputHints` spostato fuori da `ChatInput`/`HomeTextarea`: ora viene renderizzato come sibling esterno in `ChatShell` e `HomeScreen`
- Barra laterale input regolata su glyph verticale medio `▎`; separatore di `InputStatus` ridotto a middle-dot con `theme.colors["text-placeholder"]`
- Border sinistro input aggiornato a `customBorderChars` condiviso (`SplitBorder`) con verticale `┃` e `bottomLeft: "╹"`; `EmptyBorder` resta helper interno per evitare export inutilizzati
- `ChatPanel` condiviso aggiunto per frame visuale input/user-message: bordo custom, background panel e padding riusabili senza includere logica di input o dettagli assistant
- Messaggi user renderizzati con formato simile al chat input: solo testo dentro `ChatPanel`, senza label/details/tool/reasoning
- `Message.mode` aggiunto allo schema Prisma come enum `MessageMode` con default `build`; `prisma db push` e `prisma generate` eseguiti con successo
- Server persiste `mode` su messaggi user e assistant; CLI idrata `mode` via `storedCodingMessagesSchema` e usa il colore salvato per il bordo dei messaggi user
- `ChatPanel` ora accetta `borderColor` e `paddingBottom`, così i messaggi user hanno padding inferiore dedicato e non dipendono dalla mode globale corrente
- `ChatPanel` usa padding verticale esplicito (`paddingTop` + `paddingBottom`) invece di combinare `paddingY` e override bottom, evitando conflitti nel rendering OpenTUI
- Padding bottom dei messaggi user regolato a `paddingBottom={1}`
- Padding bottom visuale dei messaggi user reso intrinseco al pannello con `bottomInset={1}`: una riga interna con background, invece di spazio layout tra messaggi
- `MessageList` convertita a `<scrollbox>` OpenTUI con scroll verticale sticky-bottom; messaggi, panel e parti multilinea usano `flexShrink={0}` dove serve per evitare compressione/overlap con contenuti successivi e input
- `bun run check` rieseguito: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata)
- `PartReasoning` ora usa `ChatPanel variant="reasoning"`: stesso bordo sinistro dei pannelli chat, senza background e senza label `thinking`, mantenendo il testo reasoning dim
- `bun run check` rieseguito dopo il rendering reasoning: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata)
- Rimossa la label `AI` dai messaggi assistant; `PartReasoning` ora applica spacing esterno solo al blocco thinking tramite wrapper dedicato, lasciando gli altri contenuti senza padding esterno aggiuntivo
- `bun run check` rieseguito dopo la rimozione label/spazio reasoning: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata)
- `ChatPanel variant="reasoning"` ora azzera anche il padding interno; il blocco thinking mantiene solo lo spacing esterno di `PartReasoning`
- `bun run check` rieseguito dopo la rimozione del padding interno reasoning: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata)
- `ChatPanel variant="reasoning"` mantiene padding verticale interno a zero ma usa `paddingX={1}` per separare il testo reasoning dal bordo sinistro
- `bun run check` rieseguito dopo il padding laterale reasoning: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata)
- Le parti assistant senza bordo (`text` e `tool`) sono indentate di 2 colonne in `ChatMessage`, così il testo resta allineato al contenuto reasoning anche quando il bordo non è presente
- `bun run check` rieseguito dopo l'allineamento assistant: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata)
- La prima tool part dopo una parte non-tool riceve `marginTop={1}` in `ChatMessage`, separando visivamente testo assistant e checklist tool senza espandere ogni riga della lista tool
- `bun run check` rieseguito dopo lo spacing tool list: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata)
- Lo spacing extra prima dei tool ora viene saltato quando la parte precedente è reasoning, evitando padding duplicato dopo il blocco thinking che ha già margine esterno
- `bun run check` rieseguito dopo la correzione spacing reasoning→tool: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata)
- Il messaggio user iniziale non usa più `bottomInset`; torna a padding verticale nativo simmetrico (`paddingTop=1`, `paddingBottom=1`) mantenendo `ChatPanel` e bordo basato su `message.mode`/fallback
- `bun run check` rieseguito dopo il padding user-message: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata)
- `PartReasoning` ora prova a mostrare `Thinking: <name>` solo se il provider espone un nome in `providerMetadata` (`name`, `title`, `label`, `summary`); DeepSeek attuale non invia un nome reasoning, quindi il fallback resta silenzioso
- `bun run check` rieseguito dopo il supporto opzionale al nome reasoning: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata)

## In Progress

- Audit `useEffect` rimanente su `useSessionChat` (hydration DB/initial prompt)

## Next Up

- Sistemare o rimuovere `apps/cli/src/scripts/test-chat.ts` obsoleto

## Open Questions

- (risolto) Server e CLI: coding agent — server in remoto, CLI con tool locali

## Architecture Decisions

- `export default app` removed: Bun treats a default export with a `fetch` method as a server entry and auto-starts its own HMR dev server on port 3000, conflicting with our explicit `Bun.serve()`.
- Port 3001 chosen to avoid conflict with common dev servers on 3000.
- OpenTUI React chosen over raw `@opentui/core` for component model and hooks.
- `--cwd cli` used instead of `--filter` for CLI root script: `--filter` wrappa lo stdio rompendo il TTY detection di OpenTUI. `--cwd` esegue direttamente nella directory del package ereditando il terminale reale.
- `@monocode/server` ora espone l'app Hono da package export per permettere alla CLI di importare `AppType` senza avviare `Bun.serve()`.
- Il client RPC della CLI punta al default locale `http://localhost:3001`; la configurazione dinamica resta fuori scope finché il workflow reale non è definito.
- I client RPC devono usare il subpath type-only `@monocode/server/rpc`; questo mantiene la type-safety Hono senza includere il server nel bundle/runtime della CLI.
- Coding tools: niente registry generato per ora. `schemas.ts`, `definitions.ts`, `executor.ts`, `calls.ts` e `types.ts` sono espliciti; la duplicazione è accettata per evitare type gymnastics e mantenere il flow comprensibile.
- Modes: `modeSchema` in `@monocode/ai` è la source of truth runtime/type per i mode; server e CLI devono importare quello invece di duplicare `z.enum(["build", "plan"])` o literal union locali.
- CLI theme: colori centralizzati in `apps/cli/src/theme.ts` e accessibili via `ThemeProvider`/`useTheme()`; la selezione dinamica è pronta tramite `selectTheme(themeName)`, ma non esiste ancora una UI/config per cambiarla. Ogni tema può definire `theme.modes[mode]` per accenti mode-specific senza trasformare le mode in temi globali separati.
- `Message.mode` è un campo Prisma dedicato, non `metadata`: è dato di dominio, serve al rendering stabile della chat e deve restare queryabile.
- Slash command architecture: registry statico in `commands/commands.ts`, runtime effects in `CommandRuntimeProvider`, selection state in `useCommandMenu`, direct context consumption in `CommandMenu`. Questo evita prop drilling e mantiene screen/layout separati dal dispatch comandi.
- CLI interaction layers: `InteractionProvider` centralizza la policy keyboard/layer (`Ctrl+C`, `Esc`, `Tab`) e usa capability registrate da `Input`/menu invece di possedere direttamente ref OpenTUI. `DialogProvider` possiede lo stato dialog; `ModeProvider` resta stato puro.

## Completed (sessione corrente)

- Command handling home aggiunto: `chat-commands.ts` definisce il registry statico `/new` e `/exit`, mentre `use-chat-commands.ts` incapsula creazione sessione, navigazione ed exit OpenTUI
- `HomeTextarea` ora riconosce input che iniziano con `/`, mostra un menu filtrato minimale e dispatcha solo comandi registrati su match esatto
- `HomeScreen` usa il registry/hook comandi e mantiene il submit normale per creare una chat con prompt iniziale
- `InputHints` aggiornato con `/new` e `/exit`
- Command handling esteso anche alla chat attiva: `ChatInput` usa lo stesso registry/hook tramite `ChatShell`, quindi `/new` e `/exit` funzionano fuori dalla home
- System prompt server reso meno aggressivo sui tool: risponde direttamente al prompt e usa tool solo quando richiesto o necessario
- `bun run check` rieseguito dopo i comandi chat: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata)
- Typecheck CLI rieseguito: fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto; typecheck server passa
- Command handling migrato a context: `ChatCommandProvider` vive dentro `RootLayout`, espone `useChatCommands()` e rimuove il prop drilling `Screen -> Shell -> Input`
- `HomeTextarea` e `ChatInput` consumano direttamente il context comandi; `HomeScreen`, `ChatScreen` e `ChatShell` non passano più `commands`/`onCommand`
- `bun run check` rieseguito dopo la migrazione a context: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata)
- Typecheck server passa; typecheck CLI fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto
- Estratto `CommandTextarea`: logica condivisa per key handling, menu comandi, context comandi e submit; `HomeTextarea`/`ChatInput` restano wrapper di layout
- `bun run check` rieseguito dopo `CommandTextarea`: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata)
- Typecheck server passa; typecheck CLI fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto
- Fix `/new`: route `sessions/:sessionId` wrappata in `ChatRoute` con `key={sessionId}` per forzare remount di `ChatScreen` e azzerare lo stato `useChat` quando cambia sessione
- `bun run check` rieseguito dopo fix `/new`: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata)
- Typecheck server passa; typecheck CLI fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto
- Menu comandi spostato fuori dal flow del `ChatPanel`: ora viene renderizzato come popup assoluto sopra l'input, con bordo e background dedicati
- `bun run check` rieseguito dopo popup menu: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata)
- Typecheck server passa; typecheck CLI fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto
- Menu comandi estratto in `CommandMenu`: resta un componente separato ma usa background e bordo sinistro mode-aware allineati all'input, così appare come continuazione del pannello
- `bun run check` rieseguito dopo `CommandMenu`: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata)
- Typecheck server passa; typecheck CLI fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto
- `CommandMenu` aggiornato: bordo in colore `placeholder` e custom border chars completi per evitare il gap in alto causato dal precedente `SplitBorder` pensato solo per bordi verticali
- `bun run check` rieseguito dopo il bordo `CommandMenu`: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata); typecheck CLI/server non rieseguito per errore temporaneo `bunx` su risoluzione `typescript@latest`
- `CommandMenu` aggiornato: rimosso il bordo superiore; il bordo destro compare solo quando la lista supera il limite visibile e quindi richiede spazio per scrolling futuro
- `bun run check` rieseguito dopo bordo `CommandMenu`: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata); typecheck server passa, typecheck CLI fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto
- Menu comandi reso navigabile: rimossa label `commands`, primo comando evidenziato di default, frecce su/giù cambiano selezione con wrap e Enter esegue il comando selezionato
- `bun run check` rieseguito dopo navigazione menu: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata); typecheck server passa, typecheck CLI fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto
- Estratto `useCommandMenu`: centralizza stato selezione, reset sul cambio suggerimenti e gestione frecce su/giù; `CommandTextarea` resta responsabile di testo, submit ed esecuzione comando
- `bun run check` rieseguito dopo `useCommandMenu`: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata); typecheck server passa, typecheck CLI fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto
- Aggiunti comandi placeholder (`/help`, `/clear`, `/history`, `/model`, `/theme`, `/settings`) per testare overflow/scroll futuro del menu senza effetti runtime
- `bun run check` rieseguito dopo i placeholder: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata); typecheck server passa, typecheck CLI fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto
- `useCommandMenu` ora gestisce una finestra visibile di 5 comandi con scroll selection-driven, `Esc` chiude il menu e `Tab` completa il comando selezionato senza attivare il cambio mode globale
- `bun run check` rieseguito dopo fix menu scroll/esc/tab: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata); typecheck server passa, typecheck CLI fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto
- `useCommandMenu` aggiornato: `Tab` completa il comando selezionato e chiude il menu; `Esc` chiude il menu e svuota lo slash/input tramite callback `onDismiss`
- `bun run check` rieseguito dopo comportamento Tab/Esc: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata); typecheck server passa, typecheck CLI fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto
- Audit `useEffect` avviato con skill `useeffect-audit`: rimosso l'effetto da `useCommandMenu`, sostituito con stato derivato da `query` e `dismissedQuery`; restano da valutare gli effetti di `ChatScreen` e `SessionsScreen`
- `bun run check` rieseguito dopo audit/refactor `useCommandMenu`: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata); typecheck server passa, typecheck CLI fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto
- `CommandMenu` convertito a `<scrollbox>` con altezza massima di 5 righe: la lista completa resta renderizzata e può essere scrollata con mouse/trackpad; la selezione da tastiera resta gestita da `useCommandMenu`
- `bun run check` rieseguito dopo scrollbox command menu: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata); typecheck server passa, typecheck CLI fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto
- Scrollbar visuale del `CommandMenu` nascosta mantenendo lo `scrollbox` attivo per mouse/trackpad: track e thumb usano il background del pannello
- `bun run check` rieseguito dopo hide scrollbar menu: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata); typecheck server passa, typecheck CLI fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto
- Context aggiornato: architettura e UI context documentano il command menu attuale (`scrollbox`, scrollbar nascosta, query-derived `useCommandMenu`, niente prop drilling)
- `ChatScreen` alleggerita: hydration DB, initial prompt, pending mode mapping, tool execution e transport/session lifecycle sono stati estratti in `useSessionChat(sessionId)` senza cambiare il comportamento dello screen
- `useSessionChat` audit: rimosso l'effetto di mapping dei pending mode; `messageModes` ora è derivato in render dalla lista messaggi e dalla coda dei mode inviati, lasciando solo l'effetto necessario per hydration DB/initial prompt
- `bun run check` rieseguito dopo `useSessionChat`: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata); typecheck CLI fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto
- `bun run check` e typecheck CLI rieseguiti dopo la derivazione di `messageModes`: stessi fallimenti preesistenti già tracciati, nessun nuovo errore dal codice modificato
- `useSessionChat`: il `DefaultChatTransport` stabile ora usa `useRef` invece di `useState`, rendendo esplicito che è una risorsa per-mount/per-sessione e non stato UI mutabile
- Tipizzato il ref del transport come `DefaultChatTransport<CodingUIMessage>`; typecheck CLI conferma che resta solo il fallimento preesistente di `apps/cli/src/scripts/test-chat.ts`
- `useSessionChat` reso più semantico: `initRef` rinominato in `bootstrappedRef`, bootstrap estratto come `bootstrapSessionChat()` e aggiunto cleanup `cancelled` per evitare update dopo unmount durante l'hydration asincrona
- CLI chat componentizzata: `message-list`, `chat-message`, `part-text`, `part-reasoning`, `part-tool` — ogni tipo di parte AI SDK ha il suo componente
- `chat-input.tsx` semplificato: rimossi background e multi-box nesting; solo top border + textarea flat
- `chat-screen.tsx` ora thin shell: monta `MessageList` (flexGrow) + `ChatInput` (flexShrink:0)
- `PartTool` copre tutti gli stati: input-streaming, input-available, output-available, output-error, output-denied, approval-*
- Server refactored: rimossi tutti gli endpoint di test/placeholder (/, /health, /time, /ai, /llm-test2, /completion)
- Routing strutturato: `app.ts` ora monta route groups via `.route()`; ogni gruppo vive in `src/routes/<name>.ts`
- `src/routes/chat.ts` creato come esempio canonico per futuri endpoint
- Chat screen convertita da `useCompletion` a `useChat` (AI SDK v6 multi-turn)
- Endpoint `POST /chat` aggiunto al server — accetta `UIMessage[]`, usa `convertToModelMessages`, risponde con `toUIMessageStreamResponse()`
- `DefaultChatTransport` usato nel client per il trasporto HTTP (`transport: new DefaultChatTransport({ api })`)
- `sendMessage({ text })` invia i messaggi; `messages` (con `parts`) renderizza la cronologia
- Componente `ChatInput` creato (`apps/cli/src/components/chat-input.tsx`) — uguale a `HomeTextarea` ma chiama `instanceRef.current?.clear()` dopo submit
- `ai` aggiunto come dipendenza diretta in `@monocode/cli` (richiesto da `DefaultChatTransport`)
- TUI Dialog composition aggiunta: `DialogProvider` gestisce stato via context, `DialogOverlay` renderizza il fullscreen dark overlay, `Dialog` espone title + body slot e usa colori theme centralizzati
- Comando `/dialog` aggiunto al command registry: apre un dialog di test legato al workflow Sessions sopra la schermata corrente, senza navigare a `/sessions`
- `DialogProvider` ora intercetta `Esc` quando un dialog è aperto e lo chiude tramite stato context
- Fix rendering `/sessions`: rimossa una `<text>` annidata dentro un'altra `<text>` nella lista sessioni, causa dell'errore OpenTUI `text must be created inside of a text node` quando si provava `/dialog`
- Overlay `/dialog` aggiornato a backdrop semitrasparente (`#08080D99`) con dialog centrato e `maxWidth`, lasciando visibile la chat sotto
- Il clear input di `/dialog` avviene dentro `DialogProvider.openDialog()`: prima disabilita il cursor blinking via renderer, poi esegue la callback `beforeOpen` fornita dal command runtime, evitando il frame intermedio di textarea vuota/focused
- Quando `/dialog` apre il modal, la capability input ora fa `blur()` prima del clear e `CommandTextarea` resta non focused finché `dialog` è attivo; il placeholder può restare visibile senza cursore lampeggiante
- `/dialog` ora include un `<input focused={true}>` nel body del dialog per verificare che il focus passi al modal all'apertura
- Design `Dialog` aggiornato verso card senza bordi: header con titolo e pulsante `esc` in alto a destra, cliccabile via `onMouseDown`, body slot senza separatore e `maxWidth` ridotto
- Dialog reso più scalabile con slot opzionale `search` sotto la header; aggiunto `DialogSearchInput` riusabile e `/dialog` ora mostra una searchbar focused sopra il contenuto
- `/dialog` collegato ai dati reali Sessions tramite `SessionsDialogContent`: fetch di `client.sessions.$get()`, searchbar controllata, filtro locale e click su una sessione per chiudere il modal e navigare a `/sessions/:sessionId`
- Dialog system rifattorizzato su primitive composable: `DialogProvider` ora possiede un `ReactNode | null`, `DialogOverlay` renderizza il nodo attivo, `Dialog` accetta solo `title` + `children`, e `DialogContent` è il body layout agnostico.
- `SessionsDialog` è ora il composition root specifico: possiede la query, renderizza `DialogSearchInput`, passa `query` al content sessioni, e lascia fetch/filtro/lista/navigate nel contenuto specifico.
- Decisione confermata: la scelta comando → modal resta in `ChatCommandProvider` tramite `openDialog(<SomeDialog />)`; il dialog provider non diventa registry prodotto né accetta `content` tipizzati come `sessions`/`models`.
- `bun run check` rieseguito dopo il refactor dialog primitives: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata).
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito dopo il refactor dialog primitives: fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- Estratto `useSelectableList`: primitiva condivisa per liste CLI con frecce up/down, hover selection, conferma opzionale con Enter e `scrollChildIntoView` sullo `<scrollbox>`.
- `CommandMenu` ora usa `useSelectableList` tramite `useCommandMenu`; l'hover del mouse aggiorna il comando selezionato mantenendo sincronizzati mouse e tastiera.
- `SessionsDialogContent` allineato al command menu: lista in `<scrollbox>`, una sola riga selezionata, hover selection, up/down da tastiera, Enter per aprire la sessione selezionata, scrollbar nascosta.
- `DialogSearchInput` reso flat: rimosso il background del wrapper, resta evidenziato solo l'input focused.
- `bun run check` rieseguito dopo l'allineamento menu/dialog: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata).
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito dopo fix tipo ref `scrollbox`: fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.

## Recap (dialog TUI — sessione corrente)

- Composizione finale: `DialogProvider` (context/state del nodo attivo), `DialogOverlay` (fullscreen semitrasparente), `Dialog` (shell title + children), `DialogContent`/`DialogSearchInput` (primitive agnostiche).
- `/sessions` è il comando collegato al workflow Sessions, ma non cambia route: apre il modal sopra la chat/sessione corrente.
- (superato) `CommandTextarea` gestiva lo stato input e decideva se applicare il clear default in base a `command.clearInputOnRun`.
- (superato) `/sessions` usava `clearInputOnRun: false`; il clear passava come capability `input.clear` al command runtime e veniva eseguito da `DialogProvider.openDialog()` tramite `beforeOpen`.
- Sequenza anti-flicker scelta: `openDialog()` disabilita il cursor blinking, poi `beforeOpen` fa `blur()` + `clear()` della textarea, poi viene impostato lo stato del dialog.
- Il dialog sessions contiene `DialogSearchInput focused`, così il focus viene trasferito al modal senza accoppiare il dialog system alla textarea chat.

## Trade-offs (dialog TUI)

- Scartato il coupling diretto `Dialog -> CommandTextarea`: il dialog non importa la textarea e non possiede il suo stato.
- Scartato uno store globale/Redux: il caso attuale richiede solo una capability stretta (`input.clear`) durante l'esecuzione del comando.
- Scartato il remount della textarea: avrebbe risolto il flicker ma aggiungeva complessità e lifecycle extra.
- Accettato un `beforeOpen` imperativo nel `DialogProvider`: è il punto più vicino alla transizione modale e permette di ordinare in modo sincrono cursor/focus/clear prima del render del dialog.
- Accettato che il placeholder dell'input chat resti visibile sotto il backdrop: l'obiettivo è non lasciare la textarea focused, non nascondere completamente l'input sottostante.

## Completed (sessione corrente — session data flow)

- Session data flow CLI consolidato: aggiunti `useSessions()` per il fetch-on-mount della lista e `lib/sessions.ts` per tipo `Session`, `getSessionTitle()` e `formatSessionDate()`.
- `SessionsDialogContent` ora consuma `useSessions()`, riceve solo `query` da `SessionsDialog`, filtra localmente e usa helper condivisi per title/date.
- Comando slash rinominato da `/dialog` a `/sessions`; in quella fase usava ancora `clearInputOnRun: false` e l'apertura passava da `ChatCommandProvider` con `openDialog(<SessionsDialog />)`.
- Route/screen standalone `/sessions` rimossa: la discovery sessioni vive nel modal, mentre `/sessions/:sessionId` resta la route della chat concreta.
- Decisione: nessuno store globale per le sessioni; il riuso reale attuale richiede solo un hook locale minimale e helper condivisi.
- `bun run check` rieseguito dopo il refactor session data flow: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata).
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito dopo il refactor session data flow: fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- `SessionsProvider` aggiunto: prefetch `GET /sessions` all'avvio CLI, cache in memoria, stato `loading`/`ready`/`error` e `refetchSessions()` per stale-while-revalidate.
- `RootLayout` monta `SessionsProvider` sopra `ChatCommandProvider`, così `/sessions` e `/new` possono aggiornare la cache senza fetch nel dialog content.
- `/sessions` ora apre il dialog subito e avvia un refetch in background; `SessionsDialogContent` mostra le sessioni cached immediatamente, con copy di loading/error solo quando la cache è vuota.
- `/new` dopo la creazione sessione avvia `refetchSessions()` in background prima di navigare alla nuova chat, mantenendo fresca la cache sessioni.
- Ordine provider corretto: `SessionsProvider` ora avvolge `DialogProvider`, così il contenuto renderizzato da `DialogOverlay` può leggere la cache sessioni.
- `bun run check` rieseguito dopo session cache provider: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata).
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito dopo session cache provider e copy empty-state: fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- `POST /sessions` ora accetta `title` opzionale validato (`min 1`, `max 80`) e ritorna la sessione completa invece di solo `{ sessionId }`.
- `createSessionTitle()` aggiunto lato CLI: usa la prima riga del prompt come titolo sessione, con fallback `New session` e truncate a 80 caratteri.
- Home submit crea la sessione con titolo derivato dal prompt, aggiunge subito la sessione alla cache `SessionsProvider`, poi naviga a `/sessions/:id` con `initialPrompt`.
- `/new` crea una sessione `New session`, la inserisce subito nella cache e naviga senza refetch immediato.
- `bun run check` rieseguito dopo i titoli sessione: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata).
- Typecheck server passa; typecheck CLI fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- Helper titoli sessione aggiunti in `@monocode/db`: `createSessionTitleFromText()`, `getTextFromMessageParts()`, `createRandomSessionTitle()`.
- `POST /sessions/:sessionId/messages` ora, se sta salvando il primo messaggio della sessione, aggiorna anche `Session.title` in base al contenuto testuale del primo user message.
- Script `packages/db/scripts/title-sessions.ts` aggiunto e collegato come `bun run title:sessions` in `@monocode/db`: assegna titoli deterministici `adjective-noun` alle sessioni vecchie con `title: null`.
- Typecheck server passa dopo i titoli sessione su primo messaggio.
- Typecheck CLI fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- `bun run check` fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata); il nuovo script `title-sessions.ts` è raggiungibile dal package script `title:sessions`.
- Script `bun run --cwd packages/db title:sessions` eseguito: aggiornate 44 sessioni esistenti con titoli deterministici `adjective-noun`; verifica DB diretta conferma 46 sessioni e 208 messaggi.
- `/new` aggiornato: non crea più una sessione persistita; naviga a `/new`, una `DraftChatScreen` senza messaggi che crea la sessione solo al primo submit.
- `SessionsProvider` rinominato semanticamente: `refetchSessions()` → `refreshSessions()` per aggiornare la cache dal server, `addSession()` → `cacheSession()` per inserire/aggiornare una sessione già ricevuta.
- `cacheSession()` ora usa una logica esplicita con `findIndex`/`map`: se la sessione non esiste la prepende, se esiste la sostituisce senza duplicarla.
- Typecheck server passa dopo il flow draft `/new`; typecheck CLI fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- `bun run check` fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata).
- Titolo sessione aggiornato: Home e `DraftChatScreen` non inviano più titoli derivati dal prompt a `POST /sessions`; la sessione nasce senza titolo e viene classificata dal server sul primo messaggio.
- `POST /sessions/:sessionId/messages` ora avvia una mini-call `generateText()` per categorizzare il primo prompt e salvare un titolo conciso 2-5 parole, invece di salvare la prima riga letterale (`ciao`, `come va`, ecc.).
- Typecheck server passa dopo la mini-call LLM per titoli; typecheck CLI fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- `bun run check` fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata).
- Ref `scrollbox` normalizzati: rimosso l'alias locale `ScrollableListRef` e usato direttamente `ScrollBoxRenderable` per `CommandMenu`, `CommandTextarea`, `SessionsDialogContent`, `useCommandMenu` e `useSelectableList`, allineando i ref al tipo atteso da OpenTUI.
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito dopo il fix ref: non mostra più errori sui ref `scrollbox`; fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- `bun run check` rieseguito dopo il fix ref: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata).

## Current Session Memory

- `/new` navigates to `/`; there is no draft route/state. The CLI route-level states are home (`/`) and chat (`/sessions/:sessionId`).
- First submit from Home creates a session with `POST /sessions {}`; the returned full session is passed to `SessionsProvider.cacheSession()` and navigation continues to `/sessions/:sessionId` with the prompt in route state.
- `SessionsProvider` is the in-memory sessions cache: `refreshSessions()` loads from `GET /sessions`; `cacheSession()` inserts a new session at the top or replaces an existing session with the same id to avoid duplicates.
- `/sessions` opens the modal immediately from cached rows and calls `refreshSessions()` in the background; it includes the current session after first submit because that session is cached before navigation.
- New session titles are not derived client-side from the raw first line anymore. The server creates the session without a title, then `POST /sessions/:sessionId/messages` uses a small `generateText()` call on the first user message to store a concise 2-5 word classification title.
- Historical untitled sessions were backfilled by `bun run --cwd packages/db title:sessions` with deterministic `adjective-noun` titles; 44 rows were updated and DB verification showed 46 sessions / 208 messages.

## Completed (sessione corrente — interaction layers)

- `InteractionProvider` aggiunto: possiede `dialog`, registra capability input/menu, renderizza `DialogOverlay` e centralizza la policy keyboard globale per `Ctrl+C`, `Esc` e `Tab`.
- `DialogProvider`/`DialogContext` rimossi; `Dialog`, `DialogOverlay`, `SessionsDialogContent` e `ChatCommandProvider` usano `useInteraction()` per open/close dialog.
- `createCliRenderer({ exitOnCtrlC: false })` impostato in CLI: `Ctrl+C` ora chiude prima modal/menu/input e solo a input vuoto esegue exit pulito.
- `index.tsx` registra cleanup idempotente su `SIGINT`, `SIGTERM` ed `exit` tramite `renderer.destroy()` per ripristinare lo stato terminale.
- `ModeProvider` semplificato: mantiene solo `mode` e `toggleMode`; `Tab` è gestito da `InteractionProvider`.
- `CommandTextarea` registra controlli input e command-menu verso `InteractionProvider`, mantenendo localmente il ref OpenTUI e delegando `useSelectableList`/selezione a `useCommandMenu`.
- Comportamento `Tab` command menu cambiato: se il menu è aperto esegue il comando selezionato invece di autocompletarlo; se un modal è aperto viene consumato senza effetto; altrimenti cambia mode.
- `bun run check` rieseguito: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata).
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito: fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- Fix command menu dopo il refactor layer: rimosso `dismissedQuery` da `useCommandMenu` perché `Esc`/`Ctrl+C` ora puliscono l'input tramite `InteractionProvider`; digitare solo `/` riapre subito la lista completa invece di aspettare `/char`.

## Completed (sessione corrente — screen simplification)

- Route `/new` rimossa: il comando `/new` ora naviga a `/`, quindi la CLI ha solo due stati route-level reali (`/` home e `/sessions/:sessionId` chat).
- `DraftChatScreen` eliminato; il primo submit da home continua a creare una sessione, cachearla e navigare a `/sessions/:sessionId` con il prompt iniziale nello state.
- `Input` condiviso aggiunto: sostituisce i wrapper `HomeTextarea` e `ChatInput`, mantenendo le differenze layout tramite `variant="home" | "chat"`.
- `Chat` aggiunto come renderer della conversazione sopra `MessageList`; `ChatShell` eliminato e gli screen compongono direttamente `Chat`, `Input` e `InputHints`.
- `HomeTextarea`, `ChatInput` e `ChatShell` rimossi; `MockChatScreen` aggiornato alla nuova composizione.
- File references CLI aggiunti: digitando `@` a inizio token si apre un menu stile `CommandMenu` con cartelle e file workspace-relative; email e `"@` non lo attivano perché `@` deve essere preceduta da whitespace o inizio input.
- `useFileReferenceMenu` usa `useSelectableList` per frecce, hover, Enter, Tab e scroll-into-view; `FileReferenceMenu` renderizza la lista in `<scrollbox>` con limite visibile 5 e scrollbar nascosta.
- `InteractionProvider` registra un layer separato per il file reference menu: `Esc`/`Ctrl+C` lo chiudono senza cancellare l'input, `Tab` inserisce il riferimento selezionato prima di gestire command menu o mode toggle.
- `Input` sostituisce solo il token attivo `@query` con il riferimento selezionato tramite capability esposte a `InteractionProvider`, preservando il resto del prompt.
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito dopo il menu file: fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- `bun run check` rieseguito dopo il menu file: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata).
- `FloatingListMenu` estratto come render primitive condivisa per popup inline: possiede shell assoluta, bordo, `<scrollbox>`, selected row e hover selection; `CommandMenu` e `FileReferenceMenu` ora forniscono solo contenuto riga specifico.
- `bun run check` rieseguito dopo `FloatingListMenu`: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata).
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito dopo `FloatingListMenu`: fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- Workspace path normalization fix: i tool filesystem ora risolvono i path contro la directory di lavoro del processo tool (`process.cwd()`), accettano riferimenti con prefisso `@` e bloccano path escape. `FileReferenceMenu` usa la stessa root tramite `@monocode/ai`, quindi i path mostrati all'utente e quelli letti dai tool sono allineati. Override esplicito disponibile con `MONOCODE_WORKSPACE_ROOT` per wrapper di sviluppo o launcher futuri.
- Script root `bun run cli` aggiornato per preservare la directory da cui viene lanciato il wrapper: passa `MONOCODE_WORKSPACE_ROOT="$PWD"` prima di usare `--cwd apps/cli`, evitando che il workspace diventi accidentalmente la cartella del package CLI durante lo sviluppo.
- Rendering Markdown assistant aggiunto con il componente nativo OpenTUI `<markdown>`: `MarkdownText` centralizza `SyntaxStyle` theme-aware e opzioni tabelle, `PartText` resta plain text di default per i messaggi user e abilita Markdown solo sulle parti assistant.
- `CommandTextarea` rimosso: `Input` possiede direttamente la textarea e `MenuLayer` renderizza menu context-driven.
- `CommandMenu` e `FileReferenceMenu` leggono direttamente da `InteractionProvider`, possiedono scroll ref/selezione e registrano autonomamente cancel/confirm/open state per `Ctrl+C`, `Esc`, `Tab`.
- `ChatCommandProvider` rimosso: `InteractionProvider` espone il registry slash command e gestisce direttamente `/new`, `/sessions`, `/exit` e placeholder commands.
- Helper non più usati `findChatCommand()` e `getChatCommandSuggestions()` rimossi da `chat-commands.ts` dopo l'assorbimento del runtime comandi in `InteractionProvider`.
- `bun run check` rieseguito dopo il refactor context-driven dei menu: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata).
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito dopo il refactor context-driven dei menu: fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- `InteractionContext` riorganizzato in `{ state, actions }`, così i consumer importano solo questi due namespace e leggono `state.inputValue` / `actions.clearInput()` senza mega destructuring.
- `useCommandMenu` e `useFileReferenceMenu` riorganizzati in `{ state, actions, layout }`, riducendo i return flat e mantenendo più leggibili `CommandMenu` e `FileReferenceMenu`.
- `bun run check` rieseguito dopo il refactor state/actions: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata).
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito dopo il refactor state/actions: fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- `InteractionContext` riorganizzato in domini semantici `input`, `menu`, `dialog`, `commands`; aggiunti selector hooks `useInputInteraction()`, `useMenuInteraction()`, `useDialogInteraction()` e `useCommandRuntime()` per evitare consumer accoppiati al context completo.
- Consumer aggiornati alla nuova shape: `Input` usa input/menu/dialog, `CommandMenu` usa input/menu/command runtime, `FileReferenceMenu` usa input/menu, dialog components usano solo dialog.
- `bun run check` rieseguito dopo i selector hook: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata); il nuovo export inutilizzato `useInteraction` è stato rimosso rendendolo helper interno.
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito dopo i selector hook: fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- `input.state.isActive` aggiunto come stato derivato dell'active layer (`dialog` > file reference menu > command menu > input), così `Input` gestisce Enter submit solo quando è in pole position senza leggere direttamente lo stato dei menu.
- `InputSurface` aggiunto come wrapper layout-only per comporre `Input` + `MenuLayer` dentro un anchor `position: relative`; `Input` non renderizza più i menu e resta focalizzato su textarea/ref/sync/submit.
- Screen aggiornati a renderizzare `InputSurface` al posto di `Input`, mantenendo separati input, menu e dialog overlay.
- `bun run check` rieseguito dopo `InputSurface`/active layer: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata).
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito dopo `InputSurface`/active layer: fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- `CommandRuntimeProvider` estratto da `InteractionProvider`: ora possiede registry slash commands ed effetti runtime (`/new`, `/sessions`, `/exit`), mentre `InteractionProvider` resta owner di layer, dialog host, input/menu controls e keyboard policy.
- `chat-commands.ts` usa `inputLifecycle` (`clear`, `blurAndClear`, `preserve`) al posto di `clearInputOnRun`; `CommandMenu` applica il lifecycle input prima di chiamare `CommandRuntimeProvider.executeCommand()`.
- `InteractionProvider` non importa più `chatCommands`, `SessionsDialog`, `useNavigate()` o `useSessions()`, e non espone più `useCommandRuntime()` dal context interaction.
- `RootLayout` monta `CommandRuntimeProvider` sotto `InteractionProvider` e dentro `SessionsProvider`, mantenendo accessibili router, dialog host e cache sessioni.
- `bun run check` rieseguito dopo l'estrazione command runtime: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata).
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito dopo l'estrazione command runtime: fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- Cleanup input per attivazione comandi spostato da `CommandMenu` a `InteractionProvider`: `CommandMenu` ora chiama `menu.actions.prepareCommandActivation(command)` e poi `CommandRuntimeProvider.executeCommand(command)`, senza gestire direttamente blur/clear.
- `bun run check` rieseguito dopo lo spostamento cleanup command activation: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata).
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito dopo lo spostamento cleanup command activation: fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- Interaction context menu separato in due domini logici: `commandMenu` (`useCommandMenuInteraction()`) e `fileReferenceMenu` (`useFileReferenceMenuInteraction()`), mantenendo condivisa solo la UI `MenuLayer`/`FloatingListMenu`.
- `CommandMenu` usa il dominio command-menu per open state, registration e `prepareCommandActivation(command)`; `FileReferenceMenu` usa il dominio file-reference per open state e registration, evitando un generico `useMenuInteraction()` misto.
- `bun run check` rieseguito dopo la separazione command/file reference interaction: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata).
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito dopo la separazione command/file reference interaction: fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- `CommandMenu` non importa più `useFileReferenceMenuInteraction()` per decidere la priorità visuale: `InteractionProvider` deriva `commandMenu.state.canOpen` da dialog/file-reference layer e il command menu legge solo il proprio dominio.
- `bun run check` rieseguito dopo `commandMenu.state.canOpen`: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata).
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito dopo `commandMenu.state.canOpen`: fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- `InputControls` rinominato semanticamente a `InputHandle`: rappresenta la capability imperativa registrata dall'input, non controlli UI.
- `replaceInputRange()` rinominato a `replaceTextRange()` e implementato dentro `Input`, dove vive il ref OpenTUI della textarea; `InteractionProvider` ora delega soltanto all'handle e non conosce più `setSelection()` + `insertText()`.
- `FileReferenceMenu` usa `input.actions.replaceTextRange(...)` per sostituire il token `@query` attivo, mantenendo la logica editoriale dentro l'input.
- Commenti mirati aggiunti in `InteractionProvider` per chiarire input actions delegate, registered handles, cancel layer order, command activation cleanup e dismiss slash menu.
- Theme registry esteso con tre palette color-only selezionabili (`matrix`, `amber`, `ocean`) oltre al default `dark`; la shape resta invariata e `themeNames` continua a derivare dalla registry.
- `bun run check` rieseguito dopo l'aggiunta dei temi: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata).
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito dopo l'aggiunta dei temi: fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- `ThemeDialog` aggiunto con la stessa struttura del sessions dialog: `DialogSearchInput`, filtro locale su `themeNames`, lista scrollabile/selezionabile con `useSelectableList`, hover, Enter e click.
- `/theme` collegato in `CommandRuntimeProvider`: apre `ThemeDialog` attraverso il dialog host generico; il comando usa `inputLifecycle: "blurAndClear"` come `/sessions`.
- `bun run check` rieseguito dopo `ThemeDialog`: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata).
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito dopo `ThemeDialog`: fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- Naming interaction/menu chiarito: `inputValue`/`cursorOffset` rinominati in `inputText`/`textCursorOffset`, `CommandMenuControls`/`FileReferenceMenuControls` in `CommandMenuHandle`/`FileReferenceMenuHandle`, `inputLifecycle` in `inputActivationBehavior` e `prepareCommandActivation()` in `prepareInputForCommand()`.
- `CommandMenu` reso più leggibile eliminando alias locali ambigui (`commandMenuActions`, `commandActions`): ora destructura `prepareInputForCommand`, `executeCommand`, `commands`, `query` e usa `commandMenuController`/`matchingCommands`/`isCommandMenuVisible` per distinguere interaction, runtime e UI locale.
- Audit `useEffect` approfondito: gli effect rimanenti sono sincronizzazioni esterne legittime; `useSessionChat` è stato corretto rimuovendo il guard `bootstrappedRef`, lasciando il bootstrap DB/initial prompt governato dal cleanup `cancelled` e compatibile con setup-cleanup-setup React.
- Componenti CLI riorganizzati in sottocartelle per dominio: `components/chat`, `components/input`, `components/menus`, `components/dialogs`.
- Rimossi i pass-through/residui `Chat`, `MenuLayer`, `DialogContent` e `HomeAscii`: gli screen usano direttamente `MessageList`, `InputSurface` compone direttamente i menu, il layout minimale dialog è inline, e il logo home resta nello screen.
- `SelectableDialogList` estratto come primitive condivisa per liste modal selezionabili; `SessionsDialog` e `ThemeDialog` mantengono solo filtro, dati e comportamento specifico.
- `architecture.md` aggiornato con la nuova struttura componenti e le nuove responsabilità di `InputSurface`/`SelectableDialogList`.
- `bun run check` rieseguito dopo il refactor componenti: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata).
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito dopo il refactor componenti: fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- `DialogProvider` estratto da `InteractionProvider`: possiede `ReactNode | null`, `openDialog()`/`closeDialog()`, cursor style e render di `DialogOverlay`; `useDialog()` vive in `dialog-context.ts` per evitare cicli tra provider e overlay.
- `InteractionProvider` ora consuma `useDialog()` solo per la policy dei layer (`dialog` > file reference menu > command menu > input), mantenendo `Ctrl+C`, `Esc`, `Tab`, focus input e `commandMenu.state.canOpen` coerenti senza possedere lo stato dialog.
- `CommandRuntimeProvider`, `Dialog`, `DialogOverlay`, `SessionsDialogContent` e `ThemeDialog` migrati a `useDialog()`: i comandi `/sessions` e `/theme` restano command-owned, ma il dialog host è separato e apribile anche da feature UI future come click su messaggio chat.
- `RootLayout` ora monta `DialogProvider` tra `SessionsProvider` e `InteractionProvider`, così i dialog possono leggere la cache sessioni e l'interaction layer può leggere `dialogOpen`.
- `bun run check` rieseguito dopo l'estrazione `DialogProvider`: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata).
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito dopo l'estrazione `DialogProvider`: fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- Commenti mirati aggiunti nello stile di `InteractionProvider` a `DialogProvider`, `CommandRuntimeProvider`, `SessionsProvider` e ai consumer principali (`DialogOverlay`, `Dialog`, dialog content/list, command/file reference menu, `FloatingListMenu`, `InputSurface`, `Input`) per chiarire provider ownership, bridge imperativi e layer priority senza documentare codice ovvio.
- `bun run check` rieseguito dopo i commenti di leggibilità: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata).
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito dopo i commenti di leggibilità: fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- Tipi condivisi CLI organizzati in `apps/cli/src/types/`: `commands.ts`, `dialogs.ts`, `interaction.ts`, `sessions.ts`, `theme.ts`.
- Runtime e schema restano vicini al codice che li usa: `commands` in `commands/commands.ts`, theme registry in `theme.ts`, `sessionSchema`/`sessionsSchema` in `lib/sessions.ts`.
- `Session` ora deriva da `sessionSchema` e viene re-exportato da `types/sessions.ts`; `SessionsProvider` valida `GET /sessions` con `sessionsSchema` prima di aggiornare la cache.
- `architecture.md`, `code-standards.md` e `ui-context.md` aggiornati con la convenzione sui type module CLI e rimossi riferimenti stale a `MenuLayer`/`DialogContent`.
- Re-export type-only di compatibilità rimossi da `commands.ts`, `interaction-context.ts`, `dialog-context.ts` e `theme.ts` dopo warning Fallow: i consumer importano direttamente da `apps/cli/src/types/*`.
- `bun run check` rieseguito dopo il refactor types: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata).
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito dopo il refactor types: fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- `MockChatScreen` e la route interna `mock` rimossi dal router perché non fanno più parte del workflow CLI corrente.
- Registry slash command rinominato da `commands/chat-commands.ts` a `commands/commands.ts`; `chatCommands`/`ChatCommand`/`ChatCommandName` rinominati in `commands`/`Command`/`CommandName` per riflettere che i comandi non sono più specifici della chat.
- `bun run check` rieseguito dopo rimozione mock/rename commands: fallisce ancora sugli issue preesistenti; la fixture `apps/cli/src/__tests__/fixtures/chat-messages.ts` ora viene segnalata perché non è più raggiungibile tramite `MockChatScreen`, ma resta usata dal test già non raggiungibile.
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito dopo rimozione mock/rename commands: fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- Fix avvio CLI: import residui verso vecchi file provider flat (`providers/*-provider`, `dialog-context`, `interaction-context`) aggiornati ai nuovi provider barrel/sottopercorsi dopo il refactor in cartelle.
- `bun build apps/cli/src/index.tsx --target bun --outdir /var/folders/zz/9h24nvs956g9sk19vx40g2yw0000gn/T/opencode/monocode-cli-check` passa: la risoluzione moduli dell'entry CLI non fallisce più su `mode-provider`.
- `bun run check` rieseguito dopo il fix import CLI: resta fallito solo sugli issue preesistenti tracciati (`unused files`, dipendenza `pg` inutilizzata); non ci sono più unresolved imports/cicli introdotti dal refactor provider.
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito dopo il fix import CLI: resta fallito solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- Theme preview aggiunta nel `/theme` dialog: `ThemeProvider` mantiene `previewThemeName` separato dal theme confermato, `SelectableDialogList` espone `onSelect`, e hover/frecce applicano una preview globale temporanea mentre click/Enter confermano il tema.
- `ThemeDialog` pulisce la preview in cleanup quando il dialog viene chiuso senza conferma, quindi `Esc`/`Ctrl+C` non salvano cambiamenti temporanei.
- `bun run check` rieseguito dopo theme preview: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata).
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito dopo theme preview: fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- `bun build apps/cli/src/index.tsx --target bun --outdir /var/folders/zz/9h24nvs956g9sk19vx40g2yw0000gn/T/opencode/monocode-cli-theme-preview` passa, confermando che l'entry CLI si bundle correttamente con la preview theme.
- `Input` ora gestisce paste multi-linea come paste block locale: mostra `Pasted N lines` nella textarea, conserva il payload reale in `Input` e lo risolve al submit/`InputHandle.getInputText()` senza spostare stato payload nell'`InteractionProvider`.
- `DialogSearchInput` normalizza i paste multi-linea in query monolinea, senza paste block, mantenendo le dialog searchbar come filtri visibili e modificabili.
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito dopo il paste handling: fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- `bun run check` rieseguito dopo il paste handling: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata).
- Paste placeholder aggiornato a `[Pasted N lines]`; quando un paste block è visibile, `Input` passa un background accentato a `ChatPanel`, e se l'utente modifica/rimuove il placeholder il paste block viene invalidato.
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito dopo lo styling paste block: fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- `bun run check` rieseguito dopo lo styling paste block: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata).
- Background paste block reso più visibile: usa `theme.colors.accent` sia sul `ChatPanel` sia sulla textarea focused/non-focused, invece del precedente `selectedBackground` troppo simile al pannello.
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito dopo il background accentato: fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- `bun run check` rieseguito dopo il background accentato: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata).
- Paste block visuale corretto: il background non viene più applicato a tutto l'input; `[Pasted N lines]` è renderizzato come pill `<text bg={theme.colors.accent}>` sopra la textarea, mentre il payload resta nascosto e risolto al submit.
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito dopo la pill paste block: fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- `bun run check` rieseguito dopo la pill paste block: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata).
- Paste pill resa inline con la textarea: `[Pasted N lines]` non forza più una nuova riga, l'utente può scrivere accanto al signal, e il placeholder della textarea viene nascosto quando esiste un paste block attivo.
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito dopo la pill inline: fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- `bun run check` rieseguito dopo la pill inline: fallisce ancora solo sugli issue preesistenti già tracciati (`unused files`, dipendenza `pg` inutilizzata).
- Toast API CLI aggiunta: `ToastProvider`/`useToast()` espongono `show()`, helper variant, `dismiss(id)` e `clear()` con stack massimo di 3 toast e drop del più vecchio.
- `ToastViewport` renderizza notifiche non interattive absolute in alto a destra, theme-aware, con bordo sinistro colorato per variant e timer per auto-dismiss.
- `RootLayout` monta `ToastProvider` tra `SessionsProvider` e `DialogProvider`; i toast restano separati dai layer keyboard di `InteractionProvider` e non bloccano input/menu/dialog.
- I comandi placeholder (`/help`, `/clear`, `/history`, `/model`, `/settings`) ora mostrano un toast info invece di non fare nulla, testando l'API senza aggiungere nuovi screen.
- `bun run check` rieseguito dopo la toast API: fallisce ancora sugli issue preesistenti di dead-code/dependencies (`apps/cli/src/scripts/test-chat.ts`, `foo.ts`, script/config DB/shared e dipendenze workspace/pg segnalate).
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito dopo la toast API: fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- `bun build apps/cli/src/index.tsx --target bun --outdir /var/folders/zz/9h24nvs956g9sk19vx40g2yw0000gn/T/opencode/monocode-cli-toast-check` passa, confermando che l'entry CLI risolve correttamente il nuovo provider toast.
- `@clerk/backend` installato in `apps/server/` come dipendenza di `@monocode/server`, preparando il package server per l'integrazione auth.
- `bun run check` rieseguito dopo l'installazione Clerk: fallisce ancora sugli issue preesistenti e segnala anche `@clerk/backend` inutilizzato finché l'integrazione auth server non importerà il package.

## Completed (sessione corrente — CLI browser auth PKCE)

- `oauth4webapi` installato in `apps/cli/` con `bun add oauth4webapi --ignore-scripts` dopo il blocco preinstall Prisma già noto.
- `apps/cli/.env.example` aggiornato ai nomi Clerk single-underscore: rimossi i riferimenti a `CLERK_OAUTH_CLIENT_SECRET` e mantenuti `CLERK_FRONTEND_API`, `CLERK_OAUTH_CLIENT_ID`, `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`.
- `apps/cli/src/types/auth.ts` aggiunto con `AuthSession`, `AuthUserInfo`, `AuthStatus` e `AuthContextValue`; la sessione salvata è camelCase.
- `apps/cli/src/lib/auth/` aggiunto: config env/discovery issuer, apertura browser con `Bun.spawn()`, callback server temporaneo con `Bun.serve()`, e flow PKCE S256 con discovery OIDC, token exchange e userinfo.
- `AuthProvider` aggiunto e montato in `RootLayout`: stato sessione solo in memoria, status `unauthenticated`/`authenticating`/`authenticated`/`error`, nessuna persistenza.
- Comando `/login` aggiunto a tipi e registry; `CommandRuntimeProvider` chiama `auth.actions.login()` e mostra toast info/success/error tramite `ToastProvider`.
- Confermato il confine di scope: nessuna modifica a `apps/server/`; private access gate, Authorization header e refresh-token flow restano deferred.
- `bun build apps/cli/src/index.tsx --target bun --outdir /var/folders/zz/9h24nvs956g9sk19vx40g2yw0000gn/T/opencode/monocode-cli-auth-check` passa.
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito: fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto, issue già tracciata.
- `bun run check` rieseguito dopo auth CLI: fallisce ancora sugli issue preesistenti già tracciati (`apps/cli/src/scripts/test-chat.ts`, `foo.ts`, script/config DB/shared e dipendenze workspace/pg/Clerk inutilizzate).
- `CLERK_FRONTEND_API` normalization accetta sia issuer URL sia URL `.well-known/openid-configuration`, prima di passare l'issuer a `oauth4webapi.discoveryRequest()`.
- `bun build apps/cli/src/index.tsx --target bun --outdir /var/folders/zz/9h24nvs956g9sk19vx40g2yw0000gn/T/opencode/monocode-cli-auth-check-2` passa dopo la normalizzazione issuer.
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito dopo la normalizzazione issuer: fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- `bun run check` rieseguito dopo la normalizzazione issuer: fallisce ancora solo sugli stessi issue preesistenti già tracciati.
- Callback OAuth CLI aggiornato da porta random a loopback fisso `http://127.0.0.1:8976/oauth/callback`, così Clerk può validare un redirect URI esatto pre-registrato.
- `bun build apps/cli/src/index.tsx --target bun --outdir /var/folders/zz/9h24nvs956g9sk19vx40g2yw0000gn/T/opencode/monocode-cli-auth-port-check` passa dopo il redirect fisso.
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito dopo il redirect fisso: fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- `bun run check` rieseguito dopo il redirect fisso: fallisce ancora solo sugli stessi issue preesistenti già tracciati.
- `/login` ora aggiunge `prompt=login` all'authorize URL, così Clerk forza una nuova autenticazione invece di riusare silenziosamente la sessione browser corrente.
- `bun build apps/cli/src/index.tsx --target bun --outdir /var/folders/zz/9h24nvs956g9sk19vx40g2yw0000gn/T/opencode/monocode-cli-auth-prompt-check` passa dopo `prompt=login`.
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito dopo `prompt=login`: fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- `bun run check` rieseguito dopo `prompt=login`: fallisce ancora solo sugli stessi issue preesistenti già tracciati.
- Comando `/auth` aggiunto: legge solo `AuthProvider` in memoria e mostra un toast diagnostico con status, utente, scadenza, token type, scope e presenza dei token senza stampare token completi né salvare dati su disco.
- `bun build apps/cli/src/index.tsx --target bun --outdir /var/folders/zz/9h24nvs956g9sk19vx40g2yw0000gn/T/opencode/monocode-cli-auth-command-check` passa dopo `/auth`.
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito dopo `/auth`: fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- `bun run check` rieseguito dopo `/auth`: fallisce ancora solo sugli stessi issue preesistenti già tracciati.

## Completed (sessione corrente — CLI auth refresh automatico)

- Helper auth refresh aggiunti in `apps/cli/src/lib/auth/`: `token-expiry.ts` centralizza skew 60s, expired/expiring e delay timer; `refresh-token.ts` usa `oauth4webapi.refreshTokenGrantRequest()` / `processRefreshTokenResponse()` con `oauth.None()` per il public client Clerk.
- `AuthProvider` esteso con `actions.refreshAccessToken(): Promise<AuthSession>`, deduplica dei refresh concorrenti tramite `refreshPromiseRef`, `sessionRef` per usare la sessione corrente, timer automatico a `expiresAt - 60_000` e refresh immediato quando il token è già nella finestra di scadenza.
- Refresh token rotation gestita: `accessToken` viene sempre aggiornato, `refreshToken` e `idToken` vengono sostituiti solo se Clerk restituisce nuovi valori, `expiresAt` richiede `expires_in` valido e `userInfo` viene mantenuto in memoria.
- Failure policy auth aggiornata: se manca `refreshToken` o il refresh grant fallisce, la sessione in memoria viene svuotata, lo stato passa a `error` e viene mostrato un toast che chiede di rilanciare `/login`.
- `ToastProvider` ora avvolge `AuthProvider` in `RootLayout`, così il provider auth può mostrare toast automatici senza passare dal runtime comandi.
- `/auth` ora mostra anche `expired` ed `expiring`, continuando a non stampare token completi.
- `architecture.md` aggiornato con il nuovo contratto `AuthProvider` e il comportamento refresh CLI-only.
- `bun build apps/cli/src/index.tsx --target bun --outdir /var/folders/zz/9h24nvs956g9sk19vx40g2yw0000gn/T/opencode/monocode-cli-auth-refresh-check` passa dopo il refresh automatico.
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito dopo il refresh automatico: fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- `bun run check` inizialmente segnalava un nuovo export inutilizzato `authRefreshSkewMs`; corretto rendendo la costante locale all'helper di scadenza token.
- `bun build apps/cli/src/index.tsx --target bun --outdir /var/folders/zz/9h24nvs956g9sk19vx40g2yw0000gn/T/opencode/monocode-cli-auth-refresh-check-2` passa dopo la correzione Fallow.
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito dopo la correzione Fallow: fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- `bun run check` rieseguito dopo la correzione Fallow: fallisce ancora solo sugli issue preesistenti già tracciati (`apps/cli/src/scripts/test-chat.ts`, `foo.ts`, script/config DB/shared e dipendenze workspace/pg/Clerk inutilizzate).
- `AuthProvider.actions.refreshAccessToken()` ora applica la stessa failure policy anche se invocata senza sessione/refresh token corrente: clear session, stato `error`, toast e richiesta di nuovo `/login`.
- `bun build apps/cli/src/index.tsx --target bun --outdir /var/folders/zz/9h24nvs956g9sk19vx40g2yw0000gn/T/opencode/monocode-cli-auth-refresh-check-3` passa dopo il tweak finale.
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito dopo il tweak finale: fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- `bun run check` rieseguito dopo il tweak finale: fallisce ancora solo sugli issue preesistenti già tracciati (`apps/cli/src/scripts/test-chat.ts`, `foo.ts`, script/config DB/shared e dipendenze workspace/pg/Clerk inutilizzate).
- Helper scadenza auth rinominato da `apps/cli/src/lib/auth/session.ts` a `apps/cli/src/lib/auth/token-expiry.ts` per evitare ambiguità con le sessioni chat/applicative; comportamento invariato.
- `bun build apps/cli/src/index.tsx --target bun --outdir /var/folders/zz/9h24nvs956g9sk19vx40g2yw0000gn/T/opencode/monocode-cli-auth-token-expiry-rename` passa dopo il rename.
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito dopo il rename: fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- `bun run check` rieseguito dopo il rename: fallisce ancora solo sugli issue preesistenti già tracciati (`apps/cli/src/scripts/test-chat.ts`, `foo.ts`, script/config DB/shared e dipendenze workspace/pg/Clerk inutilizzate).

## Completed (sessione corrente — CLI auth logout)

- Helper `apps/cli/src/lib/auth/revoke-refresh-token.ts` aggiunto: usa `getAuthConfig()`, discovery OAuth via `oauth.discoveryRequest()` / `processDiscoveryResponse()`, richiede `revocation_endpoint` dalla metadata e chiama `oauth.revocationRequest()` con `oauth.None()` e `token_type_hint=refresh_token`.
- `AuthProvider` esteso con `actions.logout(): Promise<void>` e deduplica tramite `logoutPromiseRef`; legge la sessione corrente da `sessionRef`, revoca solo il refresh token quando presente e cancella sempre la sessione in memoria alla fine.
- Failure policy logout: se la revoca remota fallisce viene mostrato un toast warning, ma il logout locale completa comunque. L'access token non viene revocato e resta valido fino a scadenza naturale.
- Comando `/logout` aggiunto al registry e gestito in `CommandRuntimeProvider`; `/auth` resta diagnostico e continua a mostrare solo presenza token, mai token completi.
- `architecture.md` aggiornato con il comportamento logout Clerk CLI-only e la scelta di non revocare access token in questa fase.
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` rieseguito dopo `/logout`: fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto, issue già tracciata.
- `bun run check` rieseguito dopo `/logout`: fallisce ancora solo sugli issue preesistenti già tracciati (`apps/cli/src/scripts/test-chat.ts`, `foo.ts`, script/config DB/shared e dipendenze workspace/pg/Clerk inutilizzate).
- `AuthProvider.actions.clearSession` rimosso dall'API pubblica `useAuth()`: resta helper interno del provider usato da logout e failure policy refresh, evitando logout locali accidentali che bypassano la revoca del refresh token.

## Completed (sessione corrente — server auth middleware)

- Middleware Hono Clerk aggiunto in `apps/server/src/middleware/clerk-auth.ts`: usa `@clerk/backend`, autentica `c.req.raw`, risponde `401` se non autenticato e salva `auth` nelle variables Hono.
- Subpath export `@monocode/server/middleware/clerk-auth` aggiunto per rendere il middleware raggiungibile senza montarlo in `app.ts` o nelle route.
- `bunx tsc --noEmit -p apps/server/tsconfig.json` passa.
- `bun run check` rieseguito: fallisce ancora solo sugli issue preesistenti già tracciati; il nuovo middleware non compare più tra gli unused files e `@clerk/backend` non compare più tra le unused dependencies.
- `architecture.md` aggiornato con `server/src/middleware/` e con lo stato auth corrente: middleware server disponibile ma non montato, login/session state ancora CLI-side.
- Middleware Clerk montato globalmente in `apps/server/src/app.ts` dopo `logger()` e prima di `/sessions`, così le route server richiedono autenticazione.
- Check obbligatori `CLERK_SECRET_KEY` e `CLERK_PUBLISHABLE_KEY` aggiunti in `apps/server/src/index.ts`, mantenendo gli env gate fuori da `app.ts`.
- `bunx tsc --noEmit -p apps/server/tsconfig.json` passa dopo il mount globale.
- `bun run check` rieseguito dopo il mount globale: fallisce ancora solo sugli issue preesistenti già tracciati (`apps/cli/src/scripts/test-chat.ts`, `foo.ts`, script/config DB/shared e dipendenze workspace/pg segnalate).

## Completed (sessione corrente — CLI auth headers)

- Root cause confermata: dopo il mount globale Clerk, login e `/auth` funzionavano ma le chiamate CLI a `/sessions` e `/sessions/:sessionId/messages` non inviavano ancora `Authorization`, quindi il server rispondeva `401`.
- `apps/cli/src/lib/auth/request-headers.ts` aggiunto: costruisce gli header auth dalla sessione in memoria e refresha l'access token se è nella finestra di scadenza.
- `SessionsProvider.refreshSessions()` usa gli header auth per `GET /sessions` e riprova automaticamente dopo login perché ora vive sotto `AuthProvider`.
- `HomeScreen` usa gli header auth per `POST /sessions`, così la creazione sessione prima del messaggio iniziale passa il gate server.
- `useSessionChat` usa gli header auth per l'hydration DB (`GET /sessions/:sessionId/messages`) e per lo stream `DefaultChatTransport` (`POST /sessions/:sessionId/messages`).
- Provider order aggiornato: `ToastProvider` → `AuthProvider` → `SessionsProvider` → `DialogProvider` → `InteractionProvider` → `CommandRuntimeProvider`, mantenendo la cache sessioni leggibile dai dialog.
- `bun build apps/cli/src/index.tsx --target bun --outdir /var/folders/zz/9h24nvs956g9sk19vx40g2yw0000gn/T/opencode/monocode-cli-auth-headers-check` passa.
- `bunx tsc --noEmit -p apps/server/tsconfig.json` passa; `bunx tsc --noEmit -p apps/cli/tsconfig.json` fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto.
- `bun run check` fallisce ancora solo sugli issue preesistenti già tracciati (`apps/cli/src/scripts/test-chat.ts`, `foo.ts`, script/config DB/shared e dipendenze workspace/pg segnalate).
- Fix 401 post-login: il middleware Clerk ora accetta `acceptsToken: ["session_token", "oauth_token"]`; il flow CLI PKCE invia OAuth access token, mentre il default Clerk accettava solo session token.
- Tipo `auth` del middleware aggiornato da session-only a `Extract<AuthObject, { isAuthenticated: true }>` per rappresentare correttamente session token e OAuth token autenticati.
- `bunx tsc --noEmit -p apps/server/tsconfig.json` passa dopo l'acceptance OAuth token; build CLI passa ancora.
- Log debug temporanei aggiunti nel middleware Clerk: metodo/path, presenza e schema Authorization, `requestState.status`, `tokenType`, `isAuthenticated`, `reason` e `message`, senza stampare token completi.
- Fix header Authorization CLI: `getAuthHeaders()` ora invia sempre `Bearer <accessToken>` con B maiuscola. Il precedente `${session.tokenType}` produceva `bearer` lowercase, Clerk non lo parseava e cadeva su `dev-browser-missing`/`session_token`.
- `bun build apps/cli/src/index.tsx --target bun --outdir /var/folders/zz/9h24nvs956g9sk19vx40g2yw0000gn/T/opencode/monocode-cli-bearer-case-check` passa dopo il fix Bearer.

## Completed (sessione corrente — persistent CLI auth session)

- Storage locale sessione auth aggiunto in `apps/cli/src/lib/auth/session-storage.ts`: path `~/.config/monocode/auth-session.json` o `$XDG_CONFIG_HOME/monocode/auth-session.json`, directory `0700`, file `0600`, scrittura via temp file + rename e validazione Zod prima dell'uso.
- `AuthStatus` esteso con `loading`; `AuthProvider` parte in hydration, carica la sessione persistita e passa ad `authenticated` senza richiedere `/login` se il token è valido.
- Se la sessione persistita è nella finestra di refresh, l'avvio CLI esegue subito refresh token grant, salva la sessione ruotata e poi marca auth come `authenticated`.
- Login e refresh salvano la sessione locale aggiornata; logout, refresh failure, sessione invalida o refresh token mancante cancellano il file locale oltre allo stato in memoria.
- `SessionsProvider` ora aspetta `auth.state.status === "loading"` prima di provare `GET /sessions`, evitando errori “please login” durante l'hydration iniziale.
- Helper toast `info`/`success`/`warning` resi referenzialmente stabili in `ToastProvider`, così i toast non fanno rieseguire l'hydration auth.
- `bun build apps/cli/src/index.tsx --target bun --outdir /var/folders/zz/9h24nvs956g9sk19vx40g2yw0000gn/T/opencode/monocode-cli-persistent-auth-check-2` passa.
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto; `bun run check` fallisce ancora solo sugli issue preesistenti già tracciati.
- Logout CLI aggiornato: `SessionsProvider` espone `clearSessions()`, svuota la cache quando manca una sessione auth e `/logout` ora chiama `clearSessions()` dopo `auth.actions.logout()` prima di navigare a `/`.
- Verifica dopo logout cache/redirect: build CLI passa; typecheck CLI fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto; `bun run check` fallisce ancora solo sugli issue preesistenti già tracciati.

## Completed (sessione corrente — user-owned sessions)

- Tutte le sessioni e i messaggi di test esistenti sono stati eliminati dal database (`Session` e `Message` count verificati a 0) prima di rendere obbligatorio il nuovo campo owner.
- `packages/db/prisma/schema.prisma`: aggiunto `Session.userId String` obbligatorio e indice `@@index([userId, updatedAt])` per listare le sessioni dell'utente autenticato in ordine recente.
- `bunx --bun prisma db push` e `bunx --bun prisma generate` eseguiti da `packages/db`, database sincronizzato e client Prisma rigenerato.
- `apps/server/src/routes/sessions.ts`: route tipate con `ClerkAuthEnv`, helper `getAuthenticatedUserId()` e scope per Clerk user id su `GET /sessions`, `POST /sessions`, `GET /sessions/:sessionId/messages` e `POST /sessions/:sessionId/messages`.
- Le route messaggi verificano che la sessione richiesta appartenga all'utente corrente; sessioni non appartenenti all'utente rispondono `404` per non rivelare esistenza cross-user.
- `POST /sessions` salva `userId` dal Clerk auth object; `GET/POST /sessions` selezionano solo `id`, `title`, `createdAt`, `updatedAt`, mantenendo `userId` server-side e fuori dal contratto CLI.
- Protezione aggiunta sull'upsert del messaggio user: se un `message.id` esiste già su una sessione di un altro user/sessione, la route ritorna `404` invece di aggiornarlo.
- Log auth debug del middleware mantenuti ma protetti da `AUTH_DEBUG=1`, così non sporcano più l'output normale del server.
- `bunx tsc --noEmit -p apps/server/tsconfig.json` passa; build CLI passa contro il nuovo RPC type.
- `bunx tsc --noEmit -p apps/cli/tsconfig.json` fallisce ancora solo su `apps/cli/src/scripts/test-chat.ts` obsoleto; `bun run check` fallisce ancora solo sugli issue preesistenti già tracciati.
- Database azzerato di nuovo con `bunx --bun prisma db push --force-reset --accept-data-loss`; verifica `bun scripts/verify.ts` conferma `0 session(s), 0 message(s)` per testare le sessioni associate all'utente.
- Skill opencode project-local `hunk-review` installata in `.opencode/skills/hunk-review/SKILL.md` per controllare sessioni Hunk live via `hunk session *` senza avviare comandi TUI interattivi.
