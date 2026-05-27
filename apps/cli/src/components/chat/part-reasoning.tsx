import type { ReasoningUIPart } from "ai"
import { useTheme } from "../../providers/theme"
import { ChatPanel } from "./chat-panel"

const REASONING_NAME_KEYS = ["name", "title", "label", "summary"]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function getReasoningName(providerMetadata: ReasoningUIPart["providerMetadata"]): string | undefined {
  if (!isRecord(providerMetadata)) return undefined

  for (const metadata of Object.values(providerMetadata)) {
    if (!isRecord(metadata)) continue

    for (const key of REASONING_NAME_KEYS) {
      const value = metadata[key]
      if (typeof value === "string" && value.trim()) return value.trim()
    }
  }

  return undefined
}

export function PartReasoning({ part }: { part: ReasoningUIPart }) {
  const { theme } = useTheme()
  const reasoningName = getReasoningName(part.providerMetadata)

  return (
    <box flexShrink={0} marginY={1}>
      <ChatPanel borderColor={theme.colors.placeholder} variant="reasoning">
        {reasoningName && (
          <text fg={theme.colors.placeholder} flexShrink={0}>
            Thinking: {reasoningName}
          </text>
        )}
        <text fg={theme.colors.dim}>{part.text}</text>
      </ChatPanel>
    </box>
  )
}
