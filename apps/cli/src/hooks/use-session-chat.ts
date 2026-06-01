import { useEffect, useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai"
import { executeTool, storedCodingMessagesSchema, type CodingUIMessage, type ModeName } from "@matcode/ai"
import { getAuthHeaders } from "../lib/auth/request-headers"
import { client } from "../lib/client"
import { useAgent } from "../providers/agent"
import { useAuth } from "../providers/auth"
import { useMode } from "../providers/mode"

type UseSessionChatOptions = {
  sessionId: string
  initialPrompt?: string
}

export function useSessionChat({ sessionId, initialPrompt }: UseSessionChatOptions) {
  const auth = useAuth()
  const authRef = useRef(auth)
  authRef.current = auth

  const { modelId } = useAgent()
  const modelRef = useRef(modelId)
  modelRef.current = modelId

  const { mode } = useMode()
  const modeRef = useRef(mode)
  modeRef.current = mode

  const pendingModesRef = useRef<ModeName[]>([])
  const transportRef = useRef<DefaultChatTransport<CodingUIMessage> | null>(null)
  if (!transportRef.current) {
    transportRef.current = new DefaultChatTransport({
      api: client.sessions[":sessionId"].messages.$url({ param: { sessionId } }).toString(),
      headers: () => getAuthHeaders(authRef.current),
      body: () => ({ mode: modeRef.current, model: modelRef.current }),
    })
  }

  const { messages, sendMessage, status, setMessages, addToolOutput } = useChat<CodingUIMessage>({
    transport: transportRef.current,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    async onToolCall({ toolCall }) {
      if (toolCall.dynamic) return
      try {
        const output = await executeTool(toolCall)
        addToolOutput({ tool: toolCall.toolName, toolCallId: toolCall.toolCallId, output })
      } catch (err) {
        addToolOutput({
          tool: toolCall.toolName,
          toolCallId: toolCall.toolCallId,
          output: { error: err instanceof Error ? err.message : String(err) },
        })
      }
    },
  })

  useEffect(() => {
    let cancelled = false

    async function bootstrapSessionChat() {
      const res = await client.sessions[":sessionId"].messages.$get(
        { param: { sessionId } },
        { headers: await getAuthHeaders(authRef.current) },
      )
      const dbMessages = storedCodingMessagesSchema.parse(await res.json())
      if (cancelled) return

      if (dbMessages.length > 0) {
        setMessages(dbMessages)
        return
      }

      if (!initialPrompt) return
      pendingModesRef.current.push(modeRef.current)
      sendMessage({ text: initialPrompt })
    }

    bootstrapSessionChat()

    return () => {
      cancelled = true
    }
  }, [initialPrompt, sendMessage, sessionId, setMessages])

  const messageModes: Record<string, ModeName> = {}
  let pendingModeIndex = 0
  for (const message of messages) {
    if (message.role !== "user" || "mode" in message) continue
    const pendingMode = pendingModesRef.current[pendingModeIndex]
    pendingModeIndex += 1
    if (pendingMode) messageModes[message.id] = pendingMode
  }

  const submitMessage = (value: string) => {
    pendingModesRef.current.push(modeRef.current)
    sendMessage({ text: value })
  }

  return {
    messages,
    messageModes,
    isStreaming: status === "submitted",
    disabled: status !== "ready",
    submitMessage,
  }
}
