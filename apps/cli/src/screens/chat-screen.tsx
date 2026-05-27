import { useLocation, useParams } from "react-router"
import { z } from "zod"
import { MessageList } from "../components/chat/message-list"
import { InputHints } from "../components/input/input-meta"
import { InputSurface } from "../components/input/input-surface"
import { useSessionChat } from "../hooks/use-session-chat"

const ChatState = z.object({ prompt: z.string().optional() })

export function ChatScreen() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { state } = useLocation()
  const { prompt } = ChatState.parse(state ?? {})
  const { messages, messageModes, isStreaming, disabled, submitMessage } = useSessionChat({
    sessionId: sessionId!,
    initialPrompt: prompt,
  })

  return (
    <box flexDirection="column" flexGrow={1}>
      <MessageList messages={messages} messageModes={messageModes} isStreaming={isStreaming} />
      <InputSurface
        clearOnSubmit
        disabled={disabled}
        onSubmit={submitMessage}
        placeholder={disabled ? "Waiting..." : "Message Monocode..."}
        variant="chat"
      />
      <InputHints />
    </box>
  )
}
