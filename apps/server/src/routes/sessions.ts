import { Hono } from "hono"
import { generateText } from "ai"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { db, getTextFromMessageParts, type Prisma } from "@monocode/db"
import {
  chatRequestSchema,
  createCodingAgentStream,
  defaultTitleModelId,
  storedMessagePartsSchema,
} from "@monocode-ai/ai"
import { resolveLanguageModelRuntime, UnsupportedModelSettingError } from "../ai/model-resolver"
import type { ClerkAuth, ClerkAuthEnv } from "../middleware/clerk-auth"

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
  const runtime = resolveLanguageModelRuntime({ modelId: defaultTitleModelId })
  const { text } = await generateText({
    model: runtime.model,
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
      const { messages, mode, model, modelSettings } = c.req.valid("json")
      const session = await db.session.findFirst({ where: { id: sessionId, userId }, select: { id: true } })
      if (!session) return c.json({ message: "Not Found" }, 404)

      const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")
      let titlePromptText: string | undefined
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
          titlePromptText = getTextFromMessageParts(lastUserMsg.parts)
        }
      }

      let runtime: ReturnType<typeof resolveLanguageModelRuntime>
      try {
        runtime = resolveLanguageModelRuntime({ modelId: model, settings: modelSettings })
      } catch (error) {
        if (error instanceof UnsupportedModelSettingError) return c.json({ error: error.message }, 400)
        throw error
      }

      const result = await createCodingAgentStream({
        messages,
        mode,
        model: runtime.model,
        modelId: model,
        ...(runtime.providerOptions ? { providerOptions: runtime.providerOptions } : {}),
        onFinish: async ({ text, reasoningText, usage }) => {
          const userParts = lastUserMsg ? storedMessagePartsSchema.parse(lastUserMsg.parts) : undefined
          const title = titlePromptText ? await generateSessionTitle(titlePromptText).catch(() => undefined) : undefined
          const parts: Prisma.InputJsonArray = [
            ...(reasoningText ? [{ type: "reasoning", text: reasoningText }] : []),
            ...(text ? [{ type: "text", text }] : []),
          ]

          await db.$transaction(async (tx) => {
            if (lastUserMsg && userParts) {
              await tx.message.upsert({
                where: { id: lastUserMsg.id },
                update: { mode },
                create: {
                  id: lastUserMsg.id,
                  sessionId,
                  role: "user",
                  mode,
                  model,
                  parts: userParts,
                },
              })
            }

            if (title) {
              await tx.session.update({
                where: { id: sessionId },
                data: { title },
              })
            }

            await tx.message.create({
              data: {
                id: crypto.randomUUID(),
                sessionId,
                role: "assistant",
                mode,
                model,
                parts,
                metadata: {
                  promptTokens: usage.inputTokens ?? 0,
                  completionTokens: usage.outputTokens ?? 0,
                  totalTokens: usage.totalTokens ?? 0,
                },
              },
            })
          })
        },
      })
      return result.toUIMessageStreamResponse()
    },
  )
