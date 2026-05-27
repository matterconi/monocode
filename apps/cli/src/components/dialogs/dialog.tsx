import type { ReactNode } from "react"
import { useDialog } from "../../providers/dialog"
import { useTheme } from "../../providers/theme"

interface DialogProps {
  children: ReactNode
  title: string
}

export function Dialog({ children, title }: DialogProps) {
  const dialog = useDialog()
  const { theme } = useTheme()

  // The shell owns only generic chrome; dialog content owns product behavior.
  return (
    <box
      flexDirection="column"
      gap={2}
      paddingX={2}
      paddingY={1}
      style={{ backgroundColor: theme.colors.backgroundPanel, maxWidth: 72, width: "60%" }}
    >
      <box flexDirection="row" justifyContent="space-between" width="100%">
        <text fg={theme.colors.text}>{title}</text>
        <box
          paddingX={1}
          onMouseDown={(event) => {
            event.stopPropagation()
            dialog.actions.closeDialog()
          }}
          style={{ backgroundColor: theme.colors.selectedBackground }}
        >
          <text fg={theme.colors.selectedText}>esc</text>
        </box>
      </box>
      {children}
    </box>
  )
}
