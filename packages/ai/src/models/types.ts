import type { z } from "zod"
import type { modelSchema, modelSettingOverridesSchema, reasoningEffortSchema } from "./schemas"

export type ModelId = z.infer<typeof modelSchema>
export type ReasoningEffort = z.infer<typeof reasoningEffortSchema>
export type ModelSettingOverrides = z.infer<typeof modelSettingOverridesSchema>

export type ModelProvider = "DeepSeek"

export interface ReasoningEffortSettingDefinition {
  default: ReasoningEffort
  options: ReasoningEffort[]
}

export interface ModelSettingDefinitions {
  reasoningEffort?: ReasoningEffortSettingDefinition
}

export interface ModelDefinition {
  id: ModelId
  label: string
  provider: ModelProvider
  description: string
  settings: ModelSettingDefinitions
}
