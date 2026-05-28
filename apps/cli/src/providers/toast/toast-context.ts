import { createContext, useContext } from "react"
import type { ToastContextValue } from "../../types/toasts"

export const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error("useToast must be used within ToastProvider")
  return context
}
