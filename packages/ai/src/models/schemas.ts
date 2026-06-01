import { z } from "zod"
import { modelIds } from "./constants/models"

export const modelSchema = z.enum(modelIds)

export const reasoningEffortSchema = z.enum(["auto", "low", "medium", "high", "extra-high"])

export const modelSettingOverridesSchema = z.object({
  reasoningEffort: reasoningEffortSchema.optional(),
})
