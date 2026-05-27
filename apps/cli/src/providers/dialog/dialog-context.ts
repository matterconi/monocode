import { createContext, useContext } from "react"
import type { DialogContextValue } from "../../types/dialogs"

export const DialogContext = createContext<DialogContextValue | null>(null)

export function useDialog() {
  const context = useContext(DialogContext)
  if (!context) throw new Error("useDialog must be used within DialogProvider")
  return context
}
