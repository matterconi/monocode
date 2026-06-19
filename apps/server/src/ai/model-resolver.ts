import { groq } from "@ai-sdk/groq"
import { streamText } from "ai"
import { modelDefinitions, type ModelDefinition, type ModelId, type ModelSettingOverrides } from "@monocode-ai/ai"
import type { GroqLanguageModelOptions } from "@ai-sdk/groq"

type StreamTextOptions = Parameters<typeof streamText>[0]
type LanguageModelRuntime = {
  model: StreamTextOptions["model"]
  providerOptions?: StreamTextOptions["providerOptions"]
}

export class UnsupportedModelSettingError extends Error {
  constructor(modelId: ModelId, setting: keyof ModelSettingOverrides) {
    super(`Model ${modelId} does not support setting ${setting}`)
    this.name = "UnsupportedModelSettingError"
  }
}

interface ResolveLanguageModelRuntimeOptions {
  modelId: ModelId
  settings?: ModelSettingOverrides
}

function toGroqReasoningEffort(reasoningEffort: NonNullable<ModelSettingOverrides["reasoningEffort"]>) {
  switch (reasoningEffort) {
    case "none":
    case "default":
    case "low":
    case "medium":
    case "high":
      return reasoningEffort satisfies NonNullable<GroqLanguageModelOptions["reasoningEffort"]>
  }
}

function resolveGroqProviderOptions(model: ModelDefinition, settings: ModelSettingOverrides): StreamTextOptions["providerOptions"] {
  if (model.thinking.kind !== "reasoning-effort" || !settings.reasoningEffort) return undefined

  return {
    groq: {
      reasoningEffort: toGroqReasoningEffort(settings.reasoningEffort),
    },
  }
}

function resolveModelSettings(model: ModelDefinition, settings: ModelSettingOverrides = {}) {
  const resolved: ModelSettingOverrides = {}

  if (settings.reasoningEffort !== undefined) {
    const setting = model.settings.reasoningEffort
    if (!setting || !setting.options.includes(settings.reasoningEffort)) {
      throw new UnsupportedModelSettingError(model.id, "reasoningEffort")
    }
    resolved.reasoningEffort = settings.reasoningEffort
  }

  return resolved
}

function resolveProviderOptions(model: ModelDefinition, settings: ModelSettingOverrides): StreamTextOptions["providerOptions"] {
  switch (model.runtime.provider) {
    case "groq":
      return resolveGroqProviderOptions(model, settings)
  }
}

function resolveProviderModel(model: ModelDefinition): StreamTextOptions["model"] {
  switch (model.runtime.provider) {
    case "groq":
      return groq(model.runtime.modelId)
  }
}

export function resolveLanguageModelRuntime({ modelId, settings }: ResolveLanguageModelRuntimeOptions): LanguageModelRuntime {
  const model = modelDefinitions[modelId]
  const resolvedSettings = resolveModelSettings(model, settings)
  const providerModel = resolveProviderModel(model)
  const providerOptions = resolveProviderOptions(model, resolvedSettings)

  if (!providerOptions) return { model: providerModel }
  return { model: providerModel, providerOptions }
}
