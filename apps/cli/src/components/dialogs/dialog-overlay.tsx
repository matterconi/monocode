import { useDialog } from "../../providers/dialog/dialog-context"
import { useTheme } from "../../providers/theme"

export function DialogOverlay() {
  const dialog = useDialog()
  const { theme } = useTheme()

  if (!dialog.state.dialog) return null

  // The host renders the active node directly so modal types stay outside the shell.
  return (
    <box
      alignItems="center"
      justifyContent="center"
      style={{
        backgroundColor: theme.colors.overlayBackground,
        height: "100%",
        left: 0,
        position: "absolute",
        top: 0,
        width: "100%",
      }}
    >
      {dialog.state.dialog}
    </box>
  )
}
