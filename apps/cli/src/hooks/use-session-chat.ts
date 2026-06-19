import { useEffect, useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai"
import {
  executeTool,
  storedCodingMessagesSchema,
  type CodingUIMessage,
  type ModeName,
  type ModelId,
  type ModelSettingOverrides,
} from "@monocode-ai/ai"
import { getAuthHeaders } from "../lib/auth/request-headers"
import { client } from "../lib/client"
import { useAgent } from "../providers/agent"
import { useAuth } from "../providers/auth"
import { useChatStreamInteraction } from "../providers/interaction"
import { useMode } from "../providers/mode"
import { useToast } from "../providers/toast"

type UseSessionChatOptions = {
  sessionId: string
  initialPrompt?: string
}

function formatChatError(error: Error) {
  try {
    const parsed = JSON.parse(error.message) as unknown
    if (typeof parsed === "object" && parsed !== null && "error" in parsed) return JSON.stringify(parsed.error)
    if (typeof parsed === "object" && parsed !== null && "message" in parsed && typeof parsed.message === "string") return parsed.message
  } catch {
    // Provider and gateway stream errors usually arrive as plain text.
  }

  return error.message || "The provider failed before returning a response."
}

async function getResponseErrorMessage(res: Response) {
  const text = await res.text()
  if (!text) return `HTTP ${res.status}`

  try {
    const body = JSON.parse(text) as unknown
    if (typeof body === "object" && body !== null && "error" in body) return JSON.stringify(body.error)
    if (typeof body === "object" && body !== null && "message" in body && typeof body.message === "string") return body.message
  } catch {
    return text
  }

  return text
}

export function useSessionChat({ sessionId, initialPrompt }: UseSessionChatOptions) {
  const auth = useAuth()
  const toast = useToast()
  const showToastError = toast.actions.error
  const authRef = useRef(auth)
  authRef.current = auth

  const { modelId, modelSettings } = useAgent()
  const modelRef = useRef(modelId)
  modelRef.current = modelId
  const modelSettingsRef = useRef<ModelSettingOverrides | undefined>(modelSettings)
  modelSettingsRef.current = modelSettings

  const { mode } = useMode()
  const chatStream = useChatStreamInteraction()
  const modeRef = useRef(mode)
  modeRef.current = mode

  const pendingModesRef = useRef<ModeName[]>([])
  const pendingModelsRef = useRef<ModelId[]>([])
  const rollbackMessagesRef = useRef<CodingUIMessage[] | null>(null)
  const transportRef = useRef<DefaultChatTransport<CodingUIMessage> | null>(null)
  const [streamStopped, setStreamStopped] = useState(false)

  function getChatRequestBody() {
    const modelSettings = modelSettingsRef.current
    if (!modelSettings) return { mode: modeRef.current, model: modelRef.current }
    return { mode: modeRef.current, model: modelRef.current, modelSettings }
  }

  if (!transportRef.current) {
    transportRef.current = new DefaultChatTransport({
      api: client.sessions[":sessionId"].messages.$url({ param: { sessionId } }).toString(),
      headers: () => getAuthHeaders(authRef.current),
      body: getChatRequestBody,
    })
  }

  const { messages, sendMessage, status, setMessages, addToolOutput, clearError, stop } = useChat<CodingUIMessage>({
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
    onError(error) {
      if (rollbackMessagesRef.current) {
        setMessages(rollbackMessagesRef.current)
        rollbackMessagesRef.current = null
        pendingModesRef.current.pop()
        pendingModelsRef.current.pop()
      }
      toast.actions.error(formatChatError(error), { title: "Chat request failed" })
      setStreamStopped(true)
    },
  })

  const messagesRef = useRef(messages)
  messagesRef.current = messages

  const statusRef = useRef(status)
  statusRef.current = status

  useEffect(() => {
    return chatStream.actions.registerChatStreamHandle({
      isStreaming: () => statusRef.current === "submitted" || statusRef.current === "streaming",
      stop: () => {
        stop()
        setStreamStopped(true)
      },
    })
  }, [chatStream.actions, stop])

  const activeStreaming = !streamStopped && (status === "submitted" || status === "streaming")

  useEffect(() => {
    clearError()
    if (statusRef.current !== "submitted" && statusRef.current !== "streaming") rollbackMessagesRef.current = null
  }, [clearError, modelId, modelSettings])

  useEffect(() => {
    let cancelled = false

    async function bootstrapSessionChat() {
      const res = await client.sessions[":sessionId"].messages.$get(
        { param: { sessionId } },
        { headers: await getAuthHeaders(authRef.current) },
      )
      if (!res.ok) throw new Error(`Failed to load session messages: ${await getResponseErrorMessage(res)}`)

      const dbMessages = storedCodingMessagesSchema.parse(await res.json())
      if (cancelled) return

      if (dbMessages.length > 0) {
        setMessages(dbMessages)
        return
      }

      if (!initialPrompt) return
      rollbackMessagesRef.current = messagesRef.current
      pendingModesRef.current.push(modeRef.current)
      pendingModelsRef.current.push(modelRef.current)
      sendMessage({ text: initialPrompt }, { body: getChatRequestBody() })
    }

    bootstrapSessionChat().catch((error) => {
      if (cancelled) return
      showToastError(formatChatError(error instanceof Error ? error : new Error(String(error))), { title: "Session load failed" })
    })

    return () => {
      cancelled = true
    }
  }, [initialPrompt, sendMessage, sessionId, setMessages, showToastError])

  const messageModes: Record<string, ModeName> = {}
  const messageModels: Record<string, ModelId> = {}
  let pendingModeIndex = 0
  let pendingModelIndex = 0
  let lastUserModel: ModelId | undefined
  for (const message of messages) {
    if ("model" in message && message.model) {
      lastUserModel = message.role === "user" ? message.model : lastUserModel
      continue
    }

    if (message.role === "user") {
      if (!("mode" in message) || !message.mode) {
        const pendingMode = pendingModesRef.current[pendingModeIndex]
        pendingModeIndex += 1
        if (pendingMode) messageModes[message.id] = pendingMode
      }

      const pendingModel = pendingModelsRef.current[pendingModelIndex]
      pendingModelIndex += 1
      if (pendingModel) {
        messageModels[message.id] = pendingModel
        lastUserModel = pendingModel
      }
      continue
    }

    if (message.role === "assistant" && lastUserModel) messageModels[message.id] = lastUserModel
  }

  const submitMessage = (value: string) => {
    clearError()
    setStreamStopped(false)
    rollbackMessagesRef.current = messagesRef.current
    pendingModesRef.current.push(modeRef.current)
    pendingModelsRef.current.push(modelRef.current)
    sendMessage({ text: value }, { body: getChatRequestBody() })
  }

  return {
    messages,
    messageModels,
    messageModes,
    isStreaming: activeStreaming,
    disabled: activeStreaming,
    submitMessage,
  }
}
