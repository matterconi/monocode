import type { UIMessage } from "ai"
import type { ModeName, ModelId } from "@monocode/ai"
import { ChatMessage } from "./chat-message"
import { useTheme } from "../../providers/theme"

interface MessageListProps {
  messages: UIMessage[]
  messageModes?: Record<string, ModeName>
  isStreaming?: boolean
  messageModels?: Record<string, ModelId>
}

export function MessageList({ messages, messageModes = {}, messageModels = {}, isStreaming }: MessageListProps) {
  const { theme } = useTheme()

  return (
    <scrollbox
      flexGrow={1}
      flexShrink={1}
      height="100%"
      scrollY={true}
      stickyScroll={true}
      stickyStart="bottom"
      contentOptions={{ flexDirection: "column", gap: 1, paddingX: 2, paddingY: 1 }}
    >
      {messages.map((message) => (
        <ChatMessage key={message.id} fallbackMode={messageModes[message.id]} fallbackModel={messageModels[message.id]} message={message} />
      ))}
      {isStreaming && <text fg={theme.colors.placeholder}>...</text>}
    </scrollbox>
  )
}
