import type { z } from "zod"
import type { modelSchema, modelSettingOverridesSchema, reasoningEffortSchema } from "./schemas"

export type ModelId = z.infer<typeof modelSchema>
export type ReasoningEffort = z.infer<typeof reasoningEffortSchema>
export type ModelSettingOverrides = z.infer<typeof modelSettingOverridesSchema>

export type ModelProviderLabel =
  | "Alibaba Cloud"
  | "Meta"
  | "OpenAI"

export type ModelRuntimeProvider = "groq"

export interface ModelRuntimeDefinition {
  provider: ModelRuntimeProvider
  modelId: string
}

export interface ReasoningEffortSettingDefinition {
  default: ReasoningEffort
  options: ReasoningEffort[]
}

export interface ModelSettingDefinitions {
  reasoningEffort?: ReasoningEffortSettingDefinition
}

export type ModelThinkingKind = "reasoning-effort" | "inline-tags" | "none"

export interface ModelThinkingDefinition {
  kind: ModelThinkingKind
  toggleable: boolean
}

export interface ModelDefinition {
  id: ModelId
  label: string
  providerLabel: ModelProviderLabel
  description: string
  runtime: ModelRuntimeDefinition
  thinking: ModelThinkingDefinition
  settings: ModelSettingDefinitions
}
