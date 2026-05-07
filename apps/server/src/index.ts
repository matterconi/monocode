import { app } from "./app"

if (!process.env.DEEPSEEK_API_KEY) {
  console.error("Missing DEEPSEEK_API_KEY")
  process.exit(1)
}

const port = Number(process.env.PORT) || 3001

Bun.serve({
  port,
  fetch: app.fetch,
})

console.log(`Server running at http://localhost:${port}`)
