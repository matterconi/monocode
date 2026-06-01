import type { ModelDefinition, ModelId } from "../types"

export const modelIds = [
  "deepseek/deepseek-v3.2-thinking",
  "deepseek/deepseek-v3.1-terminus",
] as const

export const modelDefinitions = {
  "deepseek/deepseek-v3.2-thinking": {
    id: "deepseek/deepseek-v3.2-thinking",
    label: "DeepSeek V3.2 Thinking",
    provider: "DeepSeek",
    description: "DeepSeek reasoning model served through Vercel AI Gateway.",
    settings: {},
  },
  "deepseek/deepseek-v3.1-terminus": {
    id: "deepseek/deepseek-v3.1-terminus",
    label: "DeepSeek V3.1 Terminus",
    provider: "DeepSeek",
    description: "Low-cost DeepSeek general coding model served through Vercel AI Gateway.",
    settings: {},
  },
} satisfies Record<ModelId, ModelDefinition>

export const modelOrder: ModelId[] = [...modelIds]
