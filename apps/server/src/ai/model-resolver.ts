import { gateway, streamText } from "ai"
import { modelDefinitions, type ModelDefinition, type ModelId, type ModelSettingOverrides } from "@matcode/ai"

type StreamTextOptions = Parameters<typeof streamText>[0]
type LanguageModelRuntime = {
  model: StreamTextOptions["model"]
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

export function resolveLanguageModelRuntime({ modelId, settings }: ResolveLanguageModelRuntimeOptions): LanguageModelRuntime {
  const model = modelDefinitions[modelId]
  resolveModelSettings(model, settings)

  return { model: gateway(modelId) }
}
