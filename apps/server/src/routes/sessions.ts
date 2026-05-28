import { Hono } from "hono"
import { streamText, convertToModelMessages, generateText, stepCountIs } from "ai"
import { createDeepSeek } from "@ai-sdk/deepseek"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { db, getTextFromMessageParts, type Prisma } from "@matcode/db"
import { chatRequestSchema, getToolsForMode, modes, storedMessagePartsSchema } from "@matcode/ai"
import type { ClerkAuth, ClerkAuthEnv } from "../middleware/clerk-auth"

const deepseek = createDeepSeek({ apiKey: process.env.DEEPSEEK_API_KEY })
const MODEL_ID = "deepseek-reasoner"

const SYSTEM_PROMPT = `You are a coding assistant. Answer the user's prompt directly.
Use tools only when the user asks you to inspect, modify, run, or search the codebase, or when a tool is necessary to answer accurately.
Do not call tools for general questions, pasted text, summaries, or simple conversation. Always confirm destructive operations before executing them.`

const createSessionSchema = z.object({ title: z.string().trim().min(1).max(80).optional() })

const sessionSelect = {
  createdAt: true,
  id: true,
  title: true,
  updatedAt: true,
} satisfies Prisma.SessionSelect

function getAuthenticatedUserId(auth: ClerkAuth) {
  if ("userId" in auth && typeof auth.userId === "string" && auth.userId) return auth.userId
  return null
}

function cleanGeneratedTitle(value: string) {
  const title = value
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .replace(/\s+/g, " ")
  if (!title) return "New session"
  return title.length > 80 ? `${title.slice(0, 77)}...` : title
}

async function generateSessionTitle(prompt: string) {
  const { text } = await generateText({
    model: deepseek(MODEL_ID),
    system: "Generate a concise chat title. Return only the title, no quotes, no punctuation at the end. Use 2 to 5 words.",
    prompt: `Categorize this chat from the first user message:\n\n${prompt}`,
  })

  return cleanGeneratedTitle(text)
}

export const sessions = new Hono<ClerkAuthEnv>()
  .get("/", async (c) => {
    const userId = getAuthenticatedUserId(c.var.auth)
    if (!userId) return c.json({ error: "Authenticated user required" }, 401)

    const list = await db.session.findMany({ orderBy: { updatedAt: "desc" }, select: sessionSelect, where: { userId } })
    return c.json(list)
  })
  .post(
    "/",
    zValidator("json", createSessionSchema, (result, c) => {
      if (result.success === false) return c.json({ error: z.flattenError(result.error) }, 400)
    }),
    async (c) => {
      const userId = getAuthenticatedUserId(c.var.auth)
      if (!userId) return c.json({ error: "Authenticated user required" }, 401)

      const { title } = c.req.valid("json")
      const session = await db.session.create({ data: { title, userId }, select: sessionSelect })
      return c.json(session)
    },
  )
  .get("/:sessionId/messages", async (c) => {
    const userId = getAuthenticatedUserId(c.var.auth)
    if (!userId) return c.json({ error: "Authenticated user required" }, 401)

    const { sessionId } = c.req.param()
    const session = await db.session.findFirst({ where: { id: sessionId, userId }, select: { id: true } })
    if (!session) return c.json({ message: "Not Found" }, 404)

    const messages = await db.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
    })
    return c.json(messages)
  })
  .post(
    "/:sessionId/messages",
    zValidator("json", chatRequestSchema, (result, c) => {
      if (result.success === false) return c.json({ error: z.flattenError(result.error) }, 400)
    }),
    async (c) => {
      const userId = getAuthenticatedUserId(c.var.auth)
      if (!userId) return c.json({ error: "Authenticated user required" }, 401)

      const { sessionId } = c.req.param()
      const { messages, mode } = c.req.valid("json")
      const session = await db.session.findFirst({ where: { id: sessionId, userId }, select: { id: true } })
      if (!session) return c.json({ message: "Not Found" }, 404)

      const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")
      let titlePromise: Promise<string> | undefined
      if (lastUserMsg) {
        const existingUserMessage = await db.message.findUnique({
          where: { id: lastUserMsg.id },
          select: { session: { select: { userId: true } }, sessionId: true },
        })
        if (existingUserMessage && (existingUserMessage.sessionId !== sessionId || existingUserMessage.session.userId !== userId)) {
          return c.json({ message: "Not Found" }, 404)
        }

        const existingMessageCount = await db.message.count({ where: { sessionId } })
        if (existingMessageCount === 0) {
          const promptText = getTextFromMessageParts(lastUserMsg.parts)
          titlePromise = generateSessionTitle(promptText)
        }

        await db.message.upsert({
          where: { id: lastUserMsg.id },
          update: { mode },
          create: {
            id: lastUserMsg.id,
            sessionId,
            role: "user",
            mode,
            model: MODEL_ID,
            parts: storedMessagePartsSchema.parse(lastUserMsg.parts),
          },
        })
      }

      const modeConfig = modes[mode]
      const system = modeConfig.systemPromptSuffix
        ? `${SYSTEM_PROMPT}\n\n${modeConfig.systemPromptSuffix}`
        : SYSTEM_PROMPT

      const result = streamText({
        model: deepseek(MODEL_ID),
        system,
        messages: await convertToModelMessages(messages),
        stopWhen: stepCountIs(10),
        tools: getToolsForMode(mode),
        onFinish: async ({ text, reasoningText, usage }) => {
          if (titlePromise) {
            await db.session.update({
              where: { id: sessionId },
              data: { title: await titlePromise },
            })
          }

          const parts: Prisma.InputJsonArray = [
            ...(reasoningText ? [{ type: "reasoning", text: reasoningText }] : []),
            ...(text ? [{ type: "text", text }] : []),
          ]
          await db.message.create({
            data: {
              id: crypto.randomUUID(),
              sessionId,
              role: "assistant",
              mode,
              model: MODEL_ID,
              parts,
              metadata: {
                promptTokens: usage.inputTokens ?? 0,
                completionTokens: usage.outputTokens ?? 0,
                totalTokens: usage.totalTokens ?? 0,
              },
            },
          })
        },
      })
      return result.toUIMessageStreamResponse()
    },
  )
