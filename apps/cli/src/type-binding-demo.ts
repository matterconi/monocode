import { hc } from "hono/client"
import type { AppType } from "@matcode/server/rpc"

const client = hc<AppType>("http://localhost:3001")

// ============================================================
// Type Binding Demo — cosa succede quando il server cambia tipo
// ============================================================

async function correctUsage() {
  const res = await client.time.$get()
  const body = await res.json()

  // ✅ OK — TypeScript sa che `timestamp` è una `string`
  const timestamp: string = body.timestamp

  // ✅ OK — puoi usarla direttamente dove serve una stringa
  const formatted = timestamp.toUpperCase()

  console.log("timestamp:", formatted)
}

async function wrongUsage() {
  const res = await client.time.$get()
  const body = await res.json()

  // ❌ ERRORE — TypeScript blocca questa riga:
  // Type 'string' is not assignable to type 'number'.
  const timestamp: number = body.timestamp

  console.log("timestamp:", timestamp)
}

// Se cambi il server in:
//   .get("/time", (c) => c.json({ timestamp: 12345 }))
//
// E fai `bun install` o semplicemente rigeneri i tipi,
// `body.timestamp` diventa `number` e:
//  - `correctUsage()` si rompe alla riga `const timestamp: string = ...`
//  - `wrongUsage()` diventa valido.
