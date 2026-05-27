import type { ReactNode } from "react"
import { useMode } from "../../providers/mode"
import { useTheme } from "../../providers/theme"
import { SplitBorder } from "./borders"

type ChatPanelVariant = "input" | "reasoning" | "user-message"

interface ChatPanelProps {
  borderColor?: string
  bottomInset?: number
  children: ReactNode
  paddingBottom?: number
  variant: ChatPanelVariant
}

export function ChatPanel({ borderColor, bottomInset = 0, children, paddingBottom, variant }: ChatPanelProps) {
  const { mode } = useMode()
  const { theme } = useTheme()
  const panelBorderColor = borderColor ?? (variant === "input" ? theme.modes[mode].bar : theme.colors.accent)
  const panelBackgroundColor = variant === "reasoning" ? undefined : theme.colors.backgroundPanel
  const panelPaddingBottom = variant === "reasoning" ? 0 : (paddingBottom ?? 1)
  const panelPaddingX = variant === "reasoning" ? 1 : 2
  const panelPaddingTop = variant === "reasoning" ? 0 : 1

  return (
    <box
      border={["left"]}
      borderColor={panelBorderColor}
      customBorderChars={{
        ...SplitBorder.customBorderChars,
        bottomLeft: "╹",
      }}
      style={{ backgroundColor: panelBackgroundColor, width: "100%" }}
      flexShrink={0}
      paddingX={panelPaddingX}
      paddingTop={panelPaddingTop}
      paddingBottom={panelPaddingBottom}
      gap={1}
      flexDirection="column"
    >
      {children}
      {Array.from({ length: bottomInset }, (_, i) => (
        <box key={i} height={1} width="100%" backgroundColor={panelBackgroundColor} />
      ))}
    </box>
  )
}
