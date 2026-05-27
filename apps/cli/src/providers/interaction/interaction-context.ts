import { createContext, useContext } from "react"
import type { InteractionContextValue } from "../../types/interaction"

export const InteractionContext = createContext<InteractionContextValue | null>(null)

function useInteraction() {
  const context = useContext(InteractionContext)
  if (!context) throw new Error("useInteraction must be used within InteractionProvider")
  return context
}

export function useInputInteraction() {
  return useInteraction().input
}

export function useCommandMenuInteraction() {
  return useInteraction().commandMenu
}

export function useFileReferenceMenuInteraction() {
  return useInteraction().fileReferenceMenu
}
