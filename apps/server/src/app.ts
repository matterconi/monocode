import { Hono } from "hono"
import { logger } from "hono/logger"
import { clerkAuthMiddleware, type ClerkAuthEnv } from "./middleware/clerk-auth"
import { sessions } from "./routes/sessions"

export const app = new Hono<ClerkAuthEnv>()
  .use(logger())
  .use(clerkAuthMiddleware)
  .route("/sessions", sessions)

app.notFound((c) => c.json({ message: "Not Found" }, 404))

app.onError((err, c) => {
  console.error(err)
  return c.json({ message: "Internal Server Error" }, 500)
})

export type AppType = typeof app
