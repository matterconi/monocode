import type { ReactNode } from "react"

export interface OpenDialogOptions {
  beforeOpen?: () => void
}

export interface DialogContextValue {
  actions: {
    closeDialog: () => void
    openDialog: (dialog: ReactNode, options?: OpenDialogOptions) => void
  }
  state: {
    dialog: ReactNode | null
    dialogOpen: boolean
  }
}
