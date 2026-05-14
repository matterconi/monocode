import type { KeyEvent } from "@opentui/core"
import { useKeyboard, useRenderer } from "@opentui/react"
import { useCallback, useRef, useState, type ReactNode } from "react"
import { DialogOverlay } from "../components/dialog-overlay"
import { useMode } from "./mode-provider"
import {
  InteractionContext,
  type CommandMenuControls,
  type FileReferenceMenuControls,
  type InputControls,
} from "./interaction-context"

export function InteractionProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<ReactNode | null>(null)
  const [inputValue, setInputValue] = useState("")
  const renderer = useRenderer()
  const { toggleMode } = useMode()
  const inputControlsRef = useRef<InputControls | null>(null)
  const commandMenuControlsRef = useRef<CommandMenuControls | null>(null)
  const fileReferenceMenuControlsRef = useRef<FileReferenceMenuControls | null>(null)
  const dialogOpenRef = useRef(false)

  dialogOpenRef.current = dialog !== null

  const closeDialog = useCallback(() => {
    renderer.setCursorStyle({ style: "default" })
    setDialog(null)
  }, [renderer])

  const openDialog = useCallback(
    (nextDialog: ReactNode, options?: { beforeOpen?: () => void }) => {
      renderer.setCursorStyle({ style: "block", blinking: false })
      options?.beforeOpen?.()
      setDialog(nextDialog)
    },
    [renderer],
  )

  const clearInput = useCallback(() => {
    inputControlsRef.current?.clear()
    setInputValue("")
  }, [])

  const cancelTopLayer = useCallback(() => {
    if (dialogOpenRef.current) {
      closeDialog()
      return true
    }

    const commandMenuControls = commandMenuControlsRef.current
    const fileReferenceMenuControls = fileReferenceMenuControlsRef.current
    if (fileReferenceMenuControls?.isOpen()) {
      fileReferenceMenuControls.cancel()
      return true
    }

    if (commandMenuControls?.isOpen()) {
      commandMenuControls.cancel()
      clearInput()
      return true
    }

    const currentInputValue = inputControlsRef.current?.getValue() ?? inputValue
    if (currentInputValue.trim()) {
      clearInput()
      return true
    }

    return false
  }, [clearInput, closeDialog, inputValue])

  const registerInputControls = useCallback((controls: InputControls) => {
    inputControlsRef.current = controls
    return () => {
      if (inputControlsRef.current === controls) inputControlsRef.current = null
    }
  }, [])

  const registerCommandMenuControls = useCallback((controls: CommandMenuControls) => {
    commandMenuControlsRef.current = controls
    return () => {
      if (commandMenuControlsRef.current === controls) commandMenuControlsRef.current = null
    }
  }, [])

  const registerFileReferenceMenuControls = useCallback((controls: FileReferenceMenuControls) => {
    fileReferenceMenuControlsRef.current = controls
    return () => {
      if (fileReferenceMenuControlsRef.current === controls) fileReferenceMenuControlsRef.current = null
    }
  }, [])

  useKeyboard((event: KeyEvent) => {
    if (event.name === "c" && event.ctrl) {
      event.preventDefault()
      if (cancelTopLayer()) return
      renderer.destroy()
      process.exit(0)
    }

    if (event.name === "escape") {
      if (cancelTopLayer()) event.preventDefault()
      return
    }

    if (event.name === "tab") {
      event.preventDefault()
      if (dialogOpenRef.current) return

      const fileReferenceMenuControls = fileReferenceMenuControlsRef.current
      if (fileReferenceMenuControls?.isOpen()) {
        fileReferenceMenuControls.confirmSelected()
        return
      }

      const commandMenuControls = commandMenuControlsRef.current
      if (commandMenuControls?.isOpen()) {
        commandMenuControls.executeSelected()
        return
      }

      if (inputControlsRef.current) toggleMode()
    }
  })

  return (
    <InteractionContext.Provider
      value={{
        closeDialog,
        dialog,
        inputValue,
        openDialog,
        registerCommandMenuControls,
        registerFileReferenceMenuControls,
        registerInputControls,
        setInputValue,
      }}
    >
      {children}
      <DialogOverlay />
    </InteractionContext.Provider>
  )
}
