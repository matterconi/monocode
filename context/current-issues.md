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

## [OPEN] Terminal state not restored after CLI exit

**Package:** `@matcode/cli`
**File:** `cli/src/index.tsx`

**Symptom:** Dopo l'uscita dalla CLI, escape sequences VT/ANSI raw appaiono nella shell per ogni movimento del mouse, resize, focus event. Eseguire `reset` nel terminale ripristina lo stato.

**Cause:** OpenTUI abilita modalità avanzate del terminale all'avvio (mouse tracking `?1003h`, bracketed paste `?2004h`, focus events `?1004h`, SGR mouse `?1006h`). Uscendo senza chiamare `renderer.destroy()`, le sequenze di disabilitazione non vengono mai inviate.

**Fix needed:** Chiamare `renderer.destroy()` in un handler `process.on('SIGINT')` / `process.on('exit')`.

---

## [COSMETIC] Server shows "Started development server: http://localhost:3000"

**Package:** `@matcode/server`
**File:** `server/src/index.ts`

**Symptom:** `bun run server` stampa sia "Server running at http://localhost:3001" che "Started development server: http://localhost:3000".

**Cause:** `bun --watch` inietta il proprio HMR dev server interno sulla porta 3000. È comportamento di Bun, non del codice applicativo. Il server sulla 3001 funziona correttamente.

**Impact:** Cosmetic only.

**Fix needed:** Passare da `bun --watch` a `bun --hot`, oppure accettare l'output cosmetic.

---

## [OPEN] Fallow warns about broken tsconfig chain

**Package:** `@matcode/server`, `@matcode/cli`
**File:** `apps/server/tsconfig.json`, `apps/cli/tsconfig.json`

**Symptom:** `bun run check` passa, ma stampa `Broken tsconfig chain: Tsconfig not found .../apps/tsconfig.json`.

**Additional symptom:** `bunx tsc --noEmit -p apps/server/tsconfig.json` fallisce perché non trova `apps/tsconfig.json` e quindi non vede i tipi Bun (`process`, `Bun`).

**Cause:** I package tsconfig in `apps/*` cercano una chain intermedia `apps/tsconfig.json` mancante.

**Impact:** Il check cade in resolver-less resolution per i file coinvolti; import relativi e bare funzionano, ma eventuali path alias potrebbero non essere risolti correttamente.

**Fix needed:** Sistemare la chain tsconfig del workspace, probabilmente aggiungendo o correggendo un tsconfig intermedio per `apps/`.
