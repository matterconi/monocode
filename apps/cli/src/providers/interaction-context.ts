import { createContext, useContext, type ReactNode } from "react"

export interface InputControls {
  blur: () => void
  clear: () => void
  getValue: () => string
}

export interface CommandMenuControls {
  cancel: () => void
  executeSelected: () => void
  isOpen: () => boolean
}

export interface FileReferenceMenuControls {
  cancel: () => void
  confirmSelected: () => void
  isOpen: () => boolean
}

interface OpenDialogOptions {
  beforeOpen?: () => void
}

interface InteractionContextValue {
  closeDialog: () => void
  dialog: ReactNode | null
  inputValue: string
  openDialog: (dialog: ReactNode, options?: OpenDialogOptions) => void
  registerCommandMenuControls: (controls: CommandMenuControls) => () => void
  registerFileReferenceMenuControls: (controls: FileReferenceMenuControls) => () => void
  registerInputControls: (controls: InputControls) => () => void
  setInputValue: (value: string) => void
}

export const InteractionContext = createContext<InteractionContextValue | null>(null)

export function useInteraction() {
  const context = useContext(InteractionContext)
  if (!context) throw new Error("useInteraction must be used within InteractionProvider")
  return context
}
