import { isTextUIPart, isReasoningUIPart, isToolUIPart, type UIMessage } from "ai"
import { modelDefinitions, type CodingUIMessage, type ModeName, type ModelId } from "@monocode/ai"
import { ChatPanel } from "./chat-panel"
import { PartText } from "./part-text"
import { PartReasoning } from "./part-reasoning"
import { PartTool } from "./part-tool"
import { useTheme } from "../../providers/theme"

interface ChatMessageProps {
  fallbackMode?: ModeName
  fallbackModel?: ModelId
  message: UIMessage | CodingUIMessage
}

export function ChatMessage({ fallbackMode = "build", fallbackModel, message }: ChatMessageProps) {
  const isUser = message.role === "user"
  const { theme } = useTheme()
  const messageMode = "mode" in message && message.mode ? message.mode : fallbackMode
  const messageModel = "model" in message && message.model ? message.model : fallbackModel
  const modelDefinition = messageModel ? modelDefinitions[messageModel] : undefined

  if (isUser) {
    return (
      <ChatPanel borderColor={theme.modes[messageMode].bar} paddingBottom={1} variant="user-message">
        {message.parts.map((part, i) => (isTextUIPart(part) ? <PartText key={i} part={part} /> : null))}
      </ChatPanel>
    )
  }

  return (
    <box flexDirection="column" flexShrink={0}>
      {modelDefinition ? (
        <box paddingLeft={2} flexShrink={0}>
          <text fg={theme.colors.textSoft}>
            Model: {modelDefinition.id} <span fg={theme.colors.dim}>({modelDefinition.providerLabel})</span>
          </text>
        </box>
      ) : null}
      {message.parts.map((part, i) => {
        if (isTextUIPart(part)) {
          return (
            <box key={i} paddingLeft={2} flexShrink={0}>
              <PartText markdown={true} part={part} />
            </box>
          )
        }
        if (isReasoningUIPart(part)) return <PartReasoning key={i} part={part} />
        if (isToolUIPart(part)) {
          const previousPart = message.parts[i - 1]
          const marginTop = previousPart && !isToolUIPart(previousPart) && !isReasoningUIPart(previousPart) ? 1 : 0

          return (
            <box key={i} paddingLeft={2} marginTop={marginTop} flexShrink={0}>
              <PartTool part={part} />
            </box>
          )
        }
        return null
      })}
    </box>
  )
}
