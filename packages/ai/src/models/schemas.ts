import { z } from "zod"
import { modelIds } from "./constants/models.js"

export const modelSchema = z.enum(modelIds)

export const reasoningEffortSchema = z.enum(["none", "default", "low", "medium", "high"])

export const modelSettingOverridesSchema = z
  .object({
    reasoningEffort: reasoningEffortSchema.optional(),
  })
  .strict()
