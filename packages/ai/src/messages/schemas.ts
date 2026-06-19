import type { UIMessage } from "ai"
import { z } from "zod"
import { modeSchema } from "../modes/index.js"
import { defaultCodingModelId, modelSchema, modelSettingOverridesSchema } from "../models/index.js"
import type { CodingUIMessage } from "../types"

export const uiMessageSchema: z.ZodType<UIMessage> = z.custom<UIMessage>((value) => {
  if (typeof value !== "object" || value === null) return false
  if (!("id" in value)) return false
  if (!("role" in value)) return false
  if (!("parts" in value)) return false

  return (
    typeof value.id === "string" &&
    (value.role === "system" || value.role === "user" || value.role === "assistant") &&
    Array.isArray(value.parts)
  )
})

export const chatRequestSchema = z.object({
  messages: z.array(uiMessageSchema),
  mode: modeSchema.default("build"),
  model: modelSchema.default(defaultCodingModelId),
  modelSettings: modelSettingOverridesSchema.optional(),
})

export const storedMessagePartsSchema = z.array(
  z.object({
    type: z.string(),
  }).catchall(z.json()),
)

export const storedCodingMessageSchema = z
  .looseObject({
    id: z.string(),
    role: z.enum(["system", "user", "assistant"]),
    model: modelSchema.optional().catch(undefined),
    mode: modeSchema.default("build"),
    parts: z.custom<CodingUIMessage["parts"]>((value) => Array.isArray(value)),
  })
  .transform(
    (message): CodingUIMessage => ({
      id: message.id,
      role: message.role,
      model: message.model,
      mode: message.mode,
      parts: message.parts,
    }),
  )

export const storedCodingMessagesSchema = z.array(storedCodingMessageSchema)
