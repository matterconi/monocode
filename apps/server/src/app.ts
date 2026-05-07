import { Hono } from "hono"
import { logger } from "hono/logger"
import { generateText, streamText } from "ai"
import { createDeepSeek } from "@ai-sdk/deepseek"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"

const deepseek = createDeepSeek({ apiKey: process.env.DEEPSEEK_API_KEY })

export const app = new Hono()
  .use(logger())
  .get("/", (c) => c.json({ message: "Matcode server is running" }))
  .get("/health", (c) => c.json({ status: "ok" as const }))
  .get("/time", (c) => c.json({ timestamp: "string" }))
  .get("/ai", async (c) => {
    const prompt = c.req.query("prompt") ?? "Say hello"
    const { text } = await generateText({
      model: deepseek("deepseek-chat"),
      prompt,
    })
    return c.json({ text })
  })

  .get("/llm-test2", async (c) => {
    const prompt = c.req.query("prompt") ?? "Say hello"
    const result = streamText({
      model: deepseek("deepseek-chat"),
      prompt,
    })
    return result.toTextStreamResponse()
  })
  .post(
    "/completion",
    zValidator("json", z.object({ prompt: z.string() }), (result, c) => {
      if (!result.success) return c.json({ error: result.error.flatten() }, 400)
    }),
    async (c) => {
      const { prompt } = c.req.valid("json")
      const result = streamText({
        model: deepseek("deepseek-chat"),
        prompt,
      })
      return result.toUIMessageStreamResponse()
    },
  )

app.notFound((c) => c.json({ message: "Not Found" }, 404))

app.onError((err, c) => {
  console.error(err)
  return c.json({ message: "Internal Server Error" }, 500)
})

export type AppType = typeof app
