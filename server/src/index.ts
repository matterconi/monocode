import { Hono } from "hono"
import { logger } from "hono/logger"

const app = new Hono()

app.use(logger())

app.get("/", (c) => c.json({ message: "Matcode server is running" }))

app.get("/health", (c) => c.json({ status: "ok" }))

app.notFound((c) => c.json({ message: "Not Found" }, 404))

app.onError((err, c) => {
  console.error(err)
  return c.json({ message: "Internal Server Error" }, 500)
})

const port = Number(process.env.PORT) || 3001

Bun.serve({
  port,
  fetch: app.fetch,
})

console.log(`Server running at http://localhost:${port}`)
