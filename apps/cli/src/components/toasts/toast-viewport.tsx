import { TextAttributes } from "@opentui/core"
import { useTheme } from "../../providers/theme"
import { useToast } from "../../providers/toast/toast-context"
import type { ToastItem, ToastVariant } from "../../types/toasts"
import { SplitBorder } from "../chat/borders"

function getToastBorderColor(theme: ReturnType<typeof useTheme>["theme"], variant: ToastVariant) {
  switch (variant) {
    case "success":
      return theme.colors.success
    case "error":
      return theme.colors.danger
    case "warning":
      return theme.colors.warning
    case "info":
      return theme.colors.accent
  }
}

function ToastCard({ toast }: { toast: ToastItem }) {
  const { theme } = useTheme()

  return (
    <box
      border={["left"]}
      borderColor={getToastBorderColor(theme, toast.variant)}
      customBorderChars={{
        ...SplitBorder.customBorderChars,
        bottomLeft: "╹",
      }}
      flexDirection="column"
      flexShrink={0}
      gap={1}
      paddingX={2}
      paddingY={1}
      style={{ backgroundColor: theme.colors.backgroundPanel, width: 48 }}
    >
      {toast.title ? (
        <text attributes={TextAttributes.BOLD} fg={theme.colors.text} wrapMode="word">
          {toast.title}
        </text>
      ) : null}
      <text fg={theme.colors.textSoft} wrapMode="word">
        {toast.message}
      </text>
    </box>
  )
}

export function ToastViewport() {
  const toast = useToast()

  if (toast.state.toasts.length === 0) return null

  return (
    <box flexDirection="column" gap={1} style={{ position: "absolute", right: 2, top: 2 }}>
      {toast.state.toasts.map((item) => (
        <ToastCard key={item.id} toast={item} />
      ))}
    </box>
  )
}
