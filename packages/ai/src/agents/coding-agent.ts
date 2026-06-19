import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from "ai"
import { getToolsForMode, modes, type ModeName } from "../modes/index.js"
import { modelDefinitions, type ModelId } from "../models/index.js"

const SYSTEM_PROMPT = `You are a coding assistant. Answer the user's prompt directly.
Use tools only when the user asks you to inspect, modify, run, or search the codebase, or when a tool is necessary to answer accurately.
Do not call tools for general questions, pasted text, summaries, or simple conversation. Always confirm destructive operations before executing them.`

type StreamTextOptions = Parameters<typeof streamText>[0]

interface CodingAgentFinishEvent {
  reasoningText?: string
  text: string
  usage: {
    completionTokens?: number
    inputTokens?: number
    outputTokens?: number
    promptTokens?: number
    totalTokens?: number
  }
}

interface CreateCodingAgentStreamOptions {
  messages: UIMessage[]
  mode: ModeName
  model: StreamTextOptions["model"]
  modelId: ModelId
  onFinish: (event: CodingAgentFinishEvent) => Promise<void> | void
  providerOptions?: StreamTextOptions["providerOptions"]
}

function prepareMessagesForModel(messages: UIMessage[], modelId: ModelId) {
  const model = modelDefinitions[modelId]
  if (model.thinking.kind === "reasoning-effort") return messages

  return messages.map((message) => ({
    ...message,
    parts: message.parts.filter((part) => part.type !== "reasoning"),
  }))
}

export async function createCodingAgentStream({ messages, mode, model, modelId, onFinish, providerOptions }: CreateCodingAgentStreamOptions) {
  const modeConfig = modes[mode]
  const system = modeConfig.systemPromptSuffix
    ? `${SYSTEM_PROMPT}\n\n${modeConfig.systemPromptSuffix}`
    : SYSTEM_PROMPT

  return streamText({
    model,
    system,
    messages: await convertToModelMessages(prepareMessagesForModel(messages, modelId)),
    ...(providerOptions ? { providerOptions } : {}),
    stopWhen: stepCountIs(10),
    tools: getToolsForMode(mode),
    onFinish,
  })
}
