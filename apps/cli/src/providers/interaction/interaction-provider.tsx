import type { KeyEvent } from "@opentui/core"
import { useKeyboard, useRenderer } from "@opentui/react"
import { useCallback, useMemo, useRef, useState, type ReactNode } from "react"
import type { Command } from "../../types/commands"
import type { CommandMenuHandle, FileReferenceMenuHandle, InputHandle } from "../../types/interaction"
import { useDialog } from "../dialog"
import { useMode } from "../mode"
import { InteractionContext } from "./interaction-context"

export function InteractionProvider({ children }: { children: ReactNode }) {
  const [inputText, setInputText] = useState("")
  const [textCursorOffset, setTextCursorOffset] = useState(0)
  const [commandMenuOpen, setCommandMenuOpen] = useState(false)
  const [fileReferenceMenuOpen, setFileReferenceMenuOpen] = useState(false)
  const dialog = useDialog()
  const renderer = useRenderer()
  const { toggleMode } = useMode()
  const inputHandleRef = useRef<InputHandle | null>(null)
  const commandMenuHandleRef = useRef<CommandMenuHandle | null>(null)
  const fileReferenceMenuHandleRef = useRef<FileReferenceMenuHandle | null>(null)
  const dialogOpenRef = useRef(false)

  dialogOpenRef.current = dialog.state.dialogOpen

  // Input actions delegate to the registered InputHandle so textarea-specific behavior stays in Input.
  const clearInput = useCallback(() => {
    inputHandleRef.current?.clear()
    setInputText("")
    setTextCursorOffset(0)
  }, [])

  const blurInput = useCallback(() => {
    inputHandleRef.current?.blur()
  }, [])

  const replaceTextRange = useCallback((start: number, end: number, text: string) => {
    inputHandleRef.current?.replaceTextRange(start, end, text)
  }, [])

  // Global cancel resolves the active layer from top to bottom before falling back to app exit.
  const cancelTopLayer = useCallback(() => {
    if (dialogOpenRef.current) {
      dialog.actions.closeDialog()
      return true
    }

    const commandMenuHandle = commandMenuHandleRef.current
    const fileReferenceMenuHandle = fileReferenceMenuHandleRef.current
    if (fileReferenceMenuHandle?.isOpen()) {
      fileReferenceMenuHandle.cancel()
      return true
    }

    if (commandMenuHandle?.isOpen()) {
      commandMenuHandle.cancel()
      clearInput()
      return true
    }

    const currentInputText = inputHandleRef.current?.getInputText() ?? inputText
    if (currentInputText.trim()) {
      clearInput()
      return true
    }

    return false
  }, [clearInput, dialog.actions, inputText])

  // Registered handles are narrow imperative bridges owned by their rendering components.
  const registerInputHandle = useCallback((handle: InputHandle) => {
    inputHandleRef.current = handle
    return () => {
      if (inputHandleRef.current === handle) inputHandleRef.current = null
    }
  }, [])

  const registerCommandMenuHandle = useCallback((handle: CommandMenuHandle) => {
    commandMenuHandleRef.current = handle
    return () => {
      if (commandMenuHandleRef.current === handle) commandMenuHandleRef.current = null
    }
  }, [])

  const registerFileReferenceMenuHandle = useCallback((handle: FileReferenceMenuHandle) => {
    fileReferenceMenuHandleRef.current = handle
    return () => {
      if (fileReferenceMenuHandleRef.current === handle) fileReferenceMenuHandleRef.current = null
    }
  }, [])

  // Command input preparation belongs to the interaction layer; command runtime only runs effects.
  const prepareInputForCommand = useCallback(
    (command: Command) => {
      const inputActivationBehavior = command.inputActivationBehavior ?? "clear"

      if (inputActivationBehavior === "preserve") return
      if (inputActivationBehavior === "blurAndClear") inputHandleRef.current?.blur()
      clearInput()
    },
    [clearInput],
  )

  // Dismissing the slash menu restores the input surface to its neutral state.
  const dismissCommandMenu = useCallback(() => {
    clearInput()
  }, [clearInput])

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

      const fileReferenceMenuHandle = fileReferenceMenuHandleRef.current
      if (fileReferenceMenuHandle?.isOpen()) {
        fileReferenceMenuHandle.confirmSelected()
        return
      }

      const commandMenuHandle = commandMenuHandleRef.current
      if (commandMenuHandle?.isOpen()) {
        commandMenuHandle.executeSelected()
        return
      }

      if (inputHandleRef.current) toggleMode()
    }
  })

  const inputActions = useMemo(
    () => ({
      blurInput,
      clearInput,
      registerInputHandle,
      replaceTextRange,
      setInputText,
      setTextCursorOffset,
    }),
    [blurInput, clearInput, registerInputHandle, replaceTextRange],
  )

  const commandMenuActions = useMemo(
    () => ({
      dismissCommandMenu,
      prepareInputForCommand,
      registerCommandMenuHandle,
      setCommandMenuOpen,
    }),
    [dismissCommandMenu, prepareInputForCommand, registerCommandMenuHandle],
  )

  const fileReferenceMenuActions = useMemo(
    () => ({
      registerFileReferenceMenuHandle,
      setFileReferenceMenuOpen,
    }),
    [registerFileReferenceMenuHandle],
  )

  const input = useMemo(
    () => ({
      actions: inputActions,
      state: {
        canFocus: !dialog.state.dialogOpen,
        inputText,
        isActive: !dialog.state.dialogOpen && !fileReferenceMenuOpen && !commandMenuOpen,
        textCursorOffset,
      },
    }),
    [commandMenuOpen, dialog.state.dialogOpen, fileReferenceMenuOpen, inputActions, inputText, textCursorOffset],
  )

  const commandMenu = useMemo(
    () => ({
      actions: commandMenuActions,
      state: {
        canOpen: !dialog.state.dialogOpen && !fileReferenceMenuOpen,
        commandMenuOpen,
        query: inputText.trim(),
      },
    }),
    [commandMenuActions, commandMenuOpen, dialog.state.dialogOpen, fileReferenceMenuOpen, inputText],
  )

  const fileReferenceMenu = useMemo(
    () => ({
      actions: fileReferenceMenuActions,
      state: {
        fileReferenceMenuOpen,
      },
    }),
    [fileReferenceMenuActions, fileReferenceMenuOpen],
  )

  const value = useMemo(
    () => ({
      commandMenu,
      fileReferenceMenu,
      input,
    }),
    [
      commandMenu,
      fileReferenceMenu,
      input,
    ],
  )

  return (
    <InteractionContext.Provider value={value}>
      {children}
    </InteractionContext.Provider>
  )
}
