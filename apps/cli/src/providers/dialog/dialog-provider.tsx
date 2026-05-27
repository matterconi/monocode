import { useRenderer } from "@opentui/react"
import { useCallback, useMemo, useState, type ReactNode } from "react"
import { DialogOverlay } from "../../components/dialogs/dialog-overlay"
import type { OpenDialogOptions } from "../../types/dialogs"
import { DialogContext } from "./dialog-context"

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<ReactNode | null>(null)
  const renderer = useRenderer()

  const closeDialog = useCallback(() => {
    renderer.setCursorStyle({ style: "default" })
    setDialog(null)
  }, [renderer])

  // Dialog opening owns the cursor/focus transition before rendering modal content.
  const openDialog = useCallback(
    (nextDialog: ReactNode, options?: OpenDialogOptions) => {
      renderer.setCursorStyle({ style: "block", blinking: false })
      options?.beforeOpen?.()
      setDialog(nextDialog)
    },
    [renderer],
  )

  const value = useMemo(
    () => ({
      actions: {
        closeDialog,
        openDialog,
      },
      state: {
        dialog,
        dialogOpen: dialog !== null,
      },
    }),
    [closeDialog, dialog, openDialog],
  )

  return (
    <DialogContext.Provider value={value}>
      {children}
      {/* The overlay is hosted here so any feature can open a dialog without owning layout. */}
      <DialogOverlay />
    </DialogContext.Provider>
  )
}
