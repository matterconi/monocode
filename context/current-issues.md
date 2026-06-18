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

**Symptom:** `bun run check` fallisce con Fallow: file non raggiungibili (`apps/cli/src/scripts/test-chat.ts`, `foo.ts`, `packages/db/prisma.config.ts`, `packages/db/scripts/verify.ts`, `packages/shared/src/index.ts`), dipendenze workspace segnalate come inutilizzate (`@monocode/ai`, `@monocode/db`, `@monocode/server`) e dipendenza `pg` inutilizzata in `packages/db/package.json`.

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

---

## [FIXED] Model identity line can show the wrong provider after switches

**Package:** `@matcode/ai`, `@matcode/cli`

**Files:** `packages/ai/src/agents/coding-agent.ts`, `packages/ai/src/messages/schemas.ts`, `apps/cli/src/hooks/use-session-chat.ts`, `apps/cli/src/components/chat/chat-message.tsx`, `apps/cli/src/components/dialogs/model-dialog.tsx`

**Symptom:** Dopo switch ripetuti del modello, l'assistant poteva mostrare una riga `Model: openai/...` anche quando l'utente pensava di usare DeepSeek; in un caso la riga mostrava anche un id non presente nel registry, segnale di testo allucinato/copied dalla cronologia.

**Cause:** La riga `Model: ...` era generata dall'LLM tramite system prompt, quindi non era una fonte affidabile. Inoltre il dialog modelli selezionava inizialmente la prima riga della lista filtrata, non il modello attivo, rendendo possibile uno switch involontario con Enter.

**Fix:** Rimossa l'identity prompt dal server. La UI renderizza la riga modello da `message.model` persistito o dal modello pending usato al submit corrente. Il dialog modelli inizializza la selezione sulla riga attiva.

---

## [OPEN] ai-resume-pdf typecheck fails on pre-existing files

**Package:** `ai-resume-pdf`
**Files:** `app/routes/api/auth.$.ts`, `app/routes/api/files.ts`, `app/routes/api/files.$id.ts`

**Symptom:** `bun run typecheck` fallisce con errori TypeScript su questi file preesistenti (moduli `+types` mancanti, `Buffer` non assegnabile a `BodyInit`, `Date | null` non assegnabile a `Date`).

**Cause:** I file sono stati creati in una sessione precedente e non sono stati aggiornati dopo le modifiche allo stack. Gli errori non sono causati dal lavoro corrente.

**Fix needed:** Aggiornare o rimuovere questi file se non sono più necessari, oppure correggerne i tipi.

---

## [OPEN] ai-resume-pdf uses external Puter filesystem for PDF storage

**Package:** `ai-resume-pdf`
**Files:** `app/routes/upload.tsx`, `app/routes/resume.tsx`

**Symptom:** I file PDF e le immagini preview vengono caricati/serviti tramite il filesystem esterno `Puter.js` (`fs.upload`/`fs.read`) invece che tramite API locali.

**Cause:** Legacy dello stack originale basato su Puter.js. Dopo la migrazione a PostgreSQL e DeepSeek, il file storage non è stato migrato a un sistema interno.

**Fix needed:** Valutare se servire i file direttamente tramite `/api/files/:id` (già esistente) per eliminare la dipendenza da Puter.js.

---

## [FIXED] Provider error leaves chat history and DB in degraded state

**Package:** `@matcode/cli`, `@matcode/server`

**Files:** `apps/cli/src/hooks/use-session-chat.ts`, `apps/server/src/routes/sessions.ts`

**Symptom:** Dopo aver selezionato un modello non accessibile o fallito lato provider, la UI mostrava messaggi user senza risposta assistant e le richieste successive restavano degradate anche tornando a modelli funzionanti.

**Cause:** `useChat.sendMessage()` aggiunge il messaggio user localmente prima della request; `clearError()` non modifica `messages`, quindi un errore provider lasciava history locale sporca. Lato server, persistere il messaggio user prima del completamento stream poteva lasciare turni DB orfani.

**Fix:** `useSessionChat` salva uno snapshot pre-submit e in `onError()` ripristina la history, rimuove pending mode/model e mostra un toast d'errore. `sessions.ts` persiste user e assistant solo in `onFinish` dentro una transazione, e la title generation non parte più prima dello stream completato.

---

## [OPEN] DeepSeek key exposed and must be rotated

**Package:** repository
**File:** `context/progress-tracker.md`

**Symptom:** GitHub Push Protection ha rifiutato inizialmente `git push -u origin main` verso `git@github.com:matterconi/monocode.git` per una chiave DeepSeek presente in un commit locale.

**Cause:** Una nota di avanzamento documentava una variabile `.env` includendo il valore reale della chiave invece di un placeholder.

**Fix:** La history locale è stata riscritta sostituendo il valore con `DEEPSEEK_API_KEY=<redacted>`, i backup di rewrite sono stati rimossi, e `main` è stato pushato su GitHub con tracking `origin/main`.

**Fix still needed:** Revocare/ruotare la chiave esposta nel provider DeepSeek, perché il valore è stato comunque compromesso prima della redazione.

---

## [FIXED] Web landing build fails on current App.tsx

**Package:** `@monocode/web`
**File:** `apps/web/src/App.tsx`

**Symptom:** `bun run --cwd apps/web build` fallisce durante `tsc --noEmit`.

**Errors:** `lucide-react` non esporta `Instagram`, `Linkedin`, `Twitter`; inoltre diversi componenti `motion.*` ricevono `transition.ease` come stringa generica non compatibile con il tipo `Easing` atteso.

**Impact:** Il deploy root Vercel landing+API non può completare finché la build web non passa. Gli handler API Vercel bundleano correttamente.

**Fix:** Landing riscritta con `framer-motion`, easing tipizzato, icone `lucide-react` disponibili, e CTA hero senza form email. `bun run --cwd apps/web build` passa.

---

## [OPEN] Root `bun install` fails on Prisma preinstall

**Package:** workspace root / `@monocode/db`

**Symptom:** `bun install` fallisce durante il preinstall di `prisma` con il messaggio `Prisma only supports Node.js versions 20.19+, 22.12+, 24.0+`.

**Cause:** Il lifecycle script di Prisma vede una versione Node non supportata nell'ambiente corrente, anche se il workflow usa Bun. Le sessioni precedenti e quella corrente usano `bun install --ignore-scripts` come workaround operativo.

**Fix needed:** Allineare la versione Node disponibile nell'ambiente o evitare che il preinstall Prisma venga eseguito nel workflow Bun standard; continuare a eseguire esplicitamente `bun run --cwd packages/db generate` quando serve rigenerare il client.
