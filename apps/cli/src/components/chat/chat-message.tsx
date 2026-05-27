import { isTextUIPart, isReasoningUIPart, isToolUIPart, type UIMessage } from "ai"
import type { CodingUIMessage, ModeName } from "@matcode/ai"
import { ChatPanel } from "./chat-panel"
import { PartText } from "./part-text"
import { PartReasoning } from "./part-reasoning"
import { PartTool } from "./part-tool"
import { useTheme } from "../../providers/theme"

interface ChatMessageProps {
  fallbackMode?: ModeName
  message: UIMessage | CodingUIMessage
}

export function ChatMessage({ fallbackMode = "build", message }: ChatMessageProps) {
  const isUser = message.role === "user"
  const { theme } = useTheme()
  const messageMode = "mode" in message && message.mode ? message.mode : fallbackMode

  if (isUser) {
    return (
      <ChatPanel borderColor={theme.modes[messageMode].bar} paddingBottom={1} variant="user-message">
        {message.parts.map((part, i) => (isTextUIPart(part) ? <PartText key={i} part={part} /> : null))}
      </ChatPanel>
    )
  }

  return (
    <box flexDirection="column" flexShrink={0}>
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
