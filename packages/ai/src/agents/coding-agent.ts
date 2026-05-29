import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from "ai"
import { getToolsForMode, modes, type ModeName } from "../modes"

export const CODING_AGENT_MODEL_ID = "deepseek-reasoner"

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
  onFinish: (event: CodingAgentFinishEvent) => Promise<void> | void
}

export async function createCodingAgentStream({ messages, mode, model, onFinish }: CreateCodingAgentStreamOptions) {
  const modeConfig = modes[mode]
  const system = modeConfig.systemPromptSuffix
    ? `${SYSTEM_PROMPT}\n\n${modeConfig.systemPromptSuffix}`
    : SYSTEM_PROMPT

  return streamText({
    model,
    system,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(10),
    tools: getToolsForMode(mode),
    onFinish,
  })
}
