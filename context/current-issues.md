# Current Issues

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
