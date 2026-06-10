import type { ModelDefinition, ModelId } from "../types"

export const modelIds = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "meta-llama/llama-4-scout-17b-16e-instruct",
  "qwen/qwen3-32b",
] as const

export const modelDefinitions = {
  "openai/gpt-oss-120b": {
    id: "openai/gpt-oss-120b",
    label: "GPT OSS 120B",
    providerLabel: "OpenAI",
    description: "Large open-weight model served through Groq Cloud.",
    runtime: { provider: "groq", modelId: "openai/gpt-oss-120b" },
    thinking: { kind: "reasoning-effort", toggleable: true },
    settings: {
      reasoningEffort: {
        default: "medium",
        options: ["low", "medium", "high"],
      },
    },
  },
  "openai/gpt-oss-20b": {
    id: "openai/gpt-oss-20b",
    label: "GPT OSS 20B",
    providerLabel: "OpenAI",
    description: "Fast open-weight model served through Groq Cloud.",
    runtime: { provider: "groq", modelId: "openai/gpt-oss-20b" },
    thinking: { kind: "reasoning-effort", toggleable: true },
    settings: {
      reasoningEffort: {
        default: "medium",
        options: ["low", "medium", "high"],
      },
    },
  },
  "llama-3.3-70b-versatile": {
    id: "llama-3.3-70b-versatile",
    label: "Llama 3.3 70B Versatile",
    providerLabel: "Meta",
    description: "General Llama model served through Groq Cloud.",
    runtime: { provider: "groq", modelId: "llama-3.3-70b-versatile" },
    thinking: { kind: "none", toggleable: false },
    settings: {},
  },
  "llama-3.1-8b-instant": {
    id: "llama-3.1-8b-instant",
    label: "Llama 3.1 8B Instant",
    providerLabel: "Meta",
    description: "Fast lightweight Llama model served through Groq Cloud.",
    runtime: { provider: "groq", modelId: "llama-3.1-8b-instant" },
    thinking: { kind: "none", toggleable: false },
    settings: {},
  },
  "meta-llama/llama-4-scout-17b-16e-instruct": {
    id: "meta-llama/llama-4-scout-17b-16e-instruct",
    label: "Llama 4 Scout Instruct",
    providerLabel: "Meta",
    description: "Llama 4 instruct model served through Groq Cloud.",
    runtime: { provider: "groq", modelId: "meta-llama/llama-4-scout-17b-16e-instruct" },
    thinking: { kind: "none", toggleable: false },
    settings: {},
  },
  "qwen/qwen3-32b": {
    id: "qwen/qwen3-32b",
    label: "Qwen3 32B",
    providerLabel: "Alibaba Cloud",
    description: "Qwen text model served through Groq Cloud.",
    runtime: { provider: "groq", modelId: "qwen/qwen3-32b" },
    thinking: { kind: "reasoning-effort", toggleable: true },
    settings: {
      reasoningEffort: {
        default: "default",
        options: ["none", "default"],
      },
    },
  },
} satisfies Record<ModelId, ModelDefinition>

export const modelOrder: ModelId[] = [...modelIds]

export function canToggleThinking(modelId: ModelId) {
  return modelDefinitions[modelId].thinking.toggleable
}

export function supportsReasoningEffort(modelId: ModelId) {
  return modelDefinitions[modelId].thinking.kind === "reasoning-effort"
}
