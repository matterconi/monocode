# Current Issues

---

## [FIXED] React declarations missing in CLI TSX files

**Package:** `@matcode/cli`
**File:** `apps/cli/package.json`

**Symptom:** TypeScript/IDE mostrava `Could not find a declaration file for module 'react'` su file TSX come `apps/cli/src/screens/about-screen.tsx`.

**Cause:** `react` fornisce il runtime, ma le dichiarazioni TypeScript arrivano dal package separato `@types/react`.

**Fix:** Aggiunto `@types/react` ai `devDependencies` della CLI e aggiornato `bun.lock`.

---

## [FIXED] Home textarea newline keybind does not work

**Package:** `@matcode/cli`
**File:** `apps/cli/src/components/home-textarea.tsx`

**Symptom:** Il keybind doveva separare submit e newline, ma il newline non funzionava; su macOS molti terminali inviano la stessa sequenza per `Enter` e `Shift+Enter`.

**Cause:** La soluzione basata su `Shift+Enter` non è affidabile quando il terminale non espone il modifier a OpenTUI.

**Fix:** La textarea ora usa `onKeyDown`: `Enter` senza modifier fa submit; `Ctrl+J`, `linefeed` e gli Enter con modifier chiamano `preventDefault()` e inseriscono `\n` via `TextareaRenderable.insertText()`.

---

## [FIXED] CLI exits immediately instead of staying alive

**Package:** `@matcode/cli`

**Cause:** `--filter` wrappava lo stdio del processo figlio, rendendo `process.stdout.isTTY` false. OpenTUI non rilevava un terminale reale e usciva.

**Fix:** Root script cambiato da `bun run --filter @matcode/cli dev` a `bun run --cwd cli dev`. Il TTY viene ora ereditato correttamente.

---

## [FIXED] Terminal state not restored after CLI exit

**Package:** `@matcode/cli`
**File:** `cli/src/index.tsx`

**Symptom:** Dopo l'uscita dalla CLI, escape sequences VT/ANSI raw appaiono nella shell per ogni movimento del mouse, resize, focus event. Eseguire `reset` nel terminale ripristina lo stato.

**Cause:** OpenTUI abilita modalità avanzate del terminale all'avvio (mouse tracking `?1003h`, bracketed paste `?2004h`, focus events `?1004h`, SGR mouse `?1006h`). Uscendo senza chiamare `renderer.destroy()`, le sequenze di disabilitazione non vengono mai inviate.

**Fix:** `exitOnCtrlC` è stato disabilitato e `Ctrl+C` passa da `InteractionProvider`, che chiude prima dialog/menu/input e chiama `renderer.destroy()` solo quando deve uscire. `index.tsx` registra anche handler `SIGINT`, `SIGTERM` ed `exit` con `destroyRenderer()` idempotente per ripristinare lo stato terminale anche su segnali di processo.

---

## [COSMETIC] Server shows "Started development server: http://localhost:3000"

**Package:** `@matcode/server`
**File:** `server/src/index.ts`

**Symptom:** `bun run server` stampa sia "Server running at http://localhost:3001" che "Started development server: http://localhost:3000".

**Cause:** `bun --watch` inietta il proprio HMR dev server interno sulla porta 3000. È comportamento di Bun, non del codice applicativo. Il server sulla 3001 funziona correttamente.

**Impact:** Cosmetic only.

**Fix needed:** Passare da `bun --watch` a `bun --hot`, oppure accettare l'output cosmetic.

---

## [FIXED] Fallow warns about broken tsconfig chain

**Package:** `@matcode/server`, `@matcode/cli`
**File:** `apps/server/tsconfig.json`, `apps/cli/tsconfig.json`

**Symptom:** `bun run check` passa, ma stampa `Broken tsconfig chain: Tsconfig not found .../apps/tsconfig.json`.

**Additional symptom:** `bunx tsc --noEmit -p apps/server/tsconfig.json` fallisce perché non trova `apps/tsconfig.json` e quindi non vede i tipi Bun (`process`, `Bun`).

**Cause:** I package tsconfig in `apps/*` cercano una chain intermedia `apps/tsconfig.json` mancante.

**Impact:** Il check cade in resolver-less resolution per i file coinvolti; import relativi e bare funzionano, ma eventuali path alias potrebbero non essere risolti correttamente.

**Fix:** `apps/server/tsconfig.json` ora estende `../../tsconfig.json`, dichiara `types: ["bun"]` e include `src`. `apps/cli/tsconfig.json` era già corretto. `bun run check` non mostra più il warning `Broken tsconfig chain`.

---

## [OPEN] `bun run check` fails on existing unused code/dependency

**Package:** `@matcode/cli`, `@matcode/db`, `packages/shared`

**Symptom:** `bun run check` fallisce con Fallow: file non raggiungibili (`apps/cli/src/__tests__/chat-state.test.ts`, `apps/cli/src/__tests__/fixtures/chat-messages.ts`, `apps/cli/src/scripts/test-chat.ts`, `packages/db/prisma.config.ts`, `packages/db/scripts/verify.ts`, `packages/shared/src/index.ts`) e dipendenza `pg` inutilizzata in `packages/db/package.json`.

**Cause:** Alcuni file/script non sono raggiungibili dagli entry point configurati e `pg` non viene importato direttamente.

**Fix needed:** Decidere se collegare questi file agli entry point, rimuoverli, oppure aggiungere ignore mirati in `.fallowrc.json` con motivazione.

---

## [OPEN] CLI typecheck fails on stale test script

**Package:** `@matcode/cli`
**File:** `apps/cli/src/scripts/test-chat.ts`

**Symptom:** `bunx tsc --noEmit -p apps/cli/tsconfig.json` fallisce perché lo script importa `processChatResponse` da `ai`, usa `client.chat`, e contiene callback con parametri implicitamente `any`.

**Cause:** Lo script è rimasto allineato a una vecchia API di chat, mentre il server è stato rifattorizzato su `/sessions/:sessionId/messages` e AI SDK v6 non espone più quella shape.

**Fix needed:** Aggiornare lo script al flow session-based attuale oppure rimuoverlo/riclassificarlo se non fa più parte del workflow supportato.

---

## [FIXED] Chat user-message panel padding/background needs targeted rendering pass

**Package:** `@matcode/cli`
**Files:** `apps/cli/src/components/chat-panel.tsx`, `apps/cli/src/components/chat-message.tsx`, `apps/cli/src/components/message-list.tsx`

**Symptom:** Il padding bottom del messaggio user non si comportava come padding intrinseco stabile del pannello: durante l'arrivo della risposta assistant veniva percepito come spazio di layout/spacing tra renderable, non come area colorata interna al background.

**Fix:** Il messaggio user non usa più `bottomInset`; usa padding verticale nativo simmetrico tramite `ChatPanel` (`paddingTop=1`, `paddingBottom=1`). `MessageList` è ora uno `<scrollbox>` sticky-bottom, e message/part wrapper usano `flexShrink={0}` dove serve per evitare overlap.

**Related rendering decisions:** `PartReasoning` usa `ChatPanel variant="reasoning"` con bordo sinistro, senza background, padding verticale interno zero, padding laterale interno `1` e spacing esterno dedicato. Le parti assistant senza bordo sono indentate di 2 colonne per allinearsi al contenuto reasoning. La prima tool part dopo testo riceve `marginTop={1}`, ma non dopo reasoning per evitare padding duplicato.
