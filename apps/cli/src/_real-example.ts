// @ts-nocheck
// Questo file è solo dimostrativo — non viene compilato né eseguito.
// Mostra un esempio reale di come crescere il progetto con endpoint type-safe.

// ============================================================
// PARTE 1: Server — nuove route in apps/server/src/app.ts
// ============================================================

import { Hono } from "hono"

const exampleApp = new Hono()
  // Endpoint esistenti (i tuoi)
  .get("/health", (c) => c.json({ status: "ok" as const }))
  .get("/time", (c) => c.json({ timestamp: new Date().toISOString() }))

  // ── NUOVO: Lista utenti ──
  .get("/users", (c) =>
    c.json([
      { id: 1, name: "Marco", role: "admin" as const },
      { id: 2, name: "Anna", role: "user" as const },
    ])
  )

  // ── NUOVO: Dettaglio singolo utente (path param) ──
  .get("/users/:id", (c) => {
    const id = c.req.param("id")
    return c.json({
      id: Number(id),
      name: "Marco",
      email: "marco@example.com",
      role: "admin" as const,
    })
  })

  // ── NUOVO: Creazione utente (POST + body JSON) ──
  .post("/users", async (c) => {
    const body = await c.req.json()
    return c.json({ id: 3, ...body }, 201)
  })

// Nota: esporti AppType come fai già adesso
// export type AppType = typeof exampleApp

// ============================================================
// PARTE 2: Client — come diventa il consumo in React
// ============================================================

import { hc } from "hono/client"

// type AppType = typeof exampleApp // preso da @matcode/server/rpc
// const client = hc<AppType>("http://localhost:3001")

async function realWorldUsage(client: any) {
  // ── GET /users ──
  const usersRes = await client.users.$get()
  const users = await usersRes.json()
  //    ^?
  // TypeScript inferisce:
  //    users: Array<{ id: number; name: string; role: "admin" | "user" }>

  users.map((u: any) => u.name.toUpperCase()) // ✅ OK, string
  users[0].role === "admin"                   // ✅ OK, literal type
  users[0].email                              // ❌ ERRORE: Property 'email' does not exist

  // ── GET /users/:id ──
  const userRes = await client.users[":id"].$get({ param: { id: "1" } })
  const user = await userRes.json()
  //    ^?
  // TypeScript inferisce:
  //    user: { id: number; name: string; email: string; role: "admin" }

  console.log(user.email.includes("@")) // ✅ OK, string

  // ── POST /users ──
  const createRes = await client.users.$post({
    json: { name: "Luca", role: "user" },
  })
  const newUser = await createRes.json()
  //    ^?
  // TypeScript inferisce:
  //    newUser: { id: number; name: string; role: string }

  // ── ERRORE che TypeScript blocca subito ──
  await client.users.$post({
    json: { name: "Luca" }, // ❌ ERRORE: manca `role`
  })

  await client.users.$post({
    json: { name: "Luca", role: "hacker" }, // ❌ ERRORE: "hacker" non è "admin" | "user"
  })
}

// ============================================================
// PARTE 3: Cosa succede se il server cambia?
// ============================================================

// Immagina di cambiare il server così:
//
//   .get("/users/:id", (c) => c.json({
//     id: Number(c.req.param("id")),
//     fullName: "Marco Rossi",   // prima era `name`
//     email: "marco@example.com"
//   }))
//
// Risultato: TypeScript segnala immediatamente nel client:
//
//   user.name → ❌ Property 'name' does not exist on type...
//   user.fullName → ✅ OK
//
// Non devi aprire il browser o leggere i log.
// Scopri l'errore mentre scrivi il codice.

// ============================================================
// PARTE 4: Il lifecycle completo
// ============================================================

// 1. Aggiungi .get("/orders", ...) nel server
// 2. Salvi il file
// 3. Nel client scrivi: client.orders.$get()
// 4. TypeScript ti suggerisce l'autocompletamento con i tipi esatti
// 5. Se sbagli campo → errore immediato
// 6. A runtime → fetch HTTP normale a localhost:3001/orders
