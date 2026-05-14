import type { KeyEvent, ScrollBoxRenderable, TextareaRenderable } from "@opentui/core"
import { useCallback, useEffect, useMemo, useRef } from "react"
import { useCommandMenu } from "../hooks/use-command-menu"
import { useFileReferenceMenu } from "../hooks/use-file-reference-menu"
import type { FileReferenceItem } from "../lib/file-references"
import { useChatCommands } from "../providers/chat-command-provider"
import { useInteraction } from "../providers/interaction-context"
import { useTheme } from "../providers/theme-provider"
import { ChatPanel } from "./chat-panel"
import { CommandMenu } from "./command-menu"
import { FileReferenceMenu } from "./file-reference-menu"
import { InputStatus } from "./input-meta"

interface CommandTextareaProps {
  clearOnSubmit?: boolean
  cursorColor: string
  disabled?: boolean
  onSubmit?: (value: string) => void
  placeholder: string
}

export function CommandTextarea({
  clearOnSubmit = false,
  cursorColor,
  disabled = false,
  onSubmit,
  placeholder,
}: CommandTextareaProps) {
  const instanceRef = useRef<TextareaRenderable>(null)
  const commandMenuScrollRef = useRef<ScrollBoxRenderable | null>(null)
  const fileReferenceMenuScrollRef = useRef<ScrollBoxRenderable | null>(null)
  const { theme } = useTheme()
  const {
    dialog,
    inputValue,
    registerCommandMenuControls,
    registerFileReferenceMenuControls,
    registerInputControls,
    setInputValue,
  } = useInteraction()
  const { commands, executeCommand } = useChatCommands()
  const dialogOpen = dialog !== null
  const cursorOffset = instanceRef.current?.cursorOffset ?? inputValue.length
  const query = inputValue.trim()
  const commandSuggestions = useMemo(() => {
    if (!query.startsWith("/")) return []
    return commands.filter((command) => command.name.startsWith(query))
  }, [commands, query])

  const clearValue = useCallback(() => {
    instanceRef.current?.clear()
    setInputValue("")
  }, [setInputValue])

  const blurAndClearValue = useCallback(() => {
    instanceRef.current?.blur()
    clearValue()
  }, [clearValue])

  const {
    dismissCommandMenu,
    handleCommandMenuKeyDown,
    hasScrollableOverflow,
    isOpen: commandMenuOpen,
    selectIndex: selectCommandIndex,
    selectedCommand,
    selectedIndex,
    visibleCommandLimit,
  } = useCommandMenu({
    commands: commandSuggestions,
    onDismiss: clearValue,
    query,
    scrollRef: commandMenuScrollRef,
  })

  const executeSelectedCommand = useCallback(() => {
    if (!selectedCommand) return
    if (selectedCommand.clearInputOnRun !== false) clearValue()
    void executeCommand(selectedCommand.name, { input: { clear: blurAndClearValue } })
  }, [blurAndClearValue, clearValue, executeCommand, selectedCommand])

  const insertFileReference = useCallback(
    (item: FileReferenceItem, triggerStart: number, nextCursorOffset: number) => {
      const textarea = instanceRef.current
      if (!textarea) return

      textarea.setSelection(triggerStart, nextCursorOffset)
      textarea.insertText(`@${item.path}`)
      setInputValue(textarea.plainText)
    },
    [setInputValue],
  )

  const {
    confirmSelectedFileReference,
    dismissFileReferenceMenu,
    fileReferenceItems,
    handleFileReferenceMenuKeyDown,
    hasScrollableOverflow: hasScrollableFileReferenceOverflow,
    isOpen: fileReferenceMenuOpen,
    selectIndex: selectFileReferenceIndex,
    selectedIndex: selectedFileReferenceIndex,
    visibleFileReferenceLimit,
  } = useFileReferenceMenu({
    cursorOffset,
    onConfirm: insertFileReference,
    scrollRef: fileReferenceMenuScrollRef,
    value: inputValue,
  })

  useEffect(() => {
    setInputValue(instanceRef.current?.plainText ?? "")
    return registerInputControls({
      blur: () => instanceRef.current?.blur(),
      clear: clearValue,
      getValue: () => instanceRef.current?.plainText ?? "",
    })
  }, [clearValue, registerInputControls, setInputValue])

  useEffect(() => {
    return registerCommandMenuControls({
      cancel: dismissCommandMenu,
      executeSelected: executeSelectedCommand,
      isOpen: () => commandMenuOpen,
    })
  }, [commandMenuOpen, dismissCommandMenu, executeSelectedCommand, registerCommandMenuControls])

  useEffect(() => {
    return registerFileReferenceMenuControls({
      cancel: dismissFileReferenceMenu,
      confirmSelected: confirmSelectedFileReference,
      isOpen: () => fileReferenceMenuOpen,
    })
  }, [confirmSelectedFileReference, dismissFileReferenceMenu, fileReferenceMenuOpen, registerFileReferenceMenuControls])

  const handleKeyDown = useCallback(
    (event: KeyEvent) => {
      const isReturn = event.name === "return" || event.name === "enter"
      const isLinefeed = event.name === "linefeed"
      const hasModifier = event.shift || event.ctrl || event.meta || event.option || event.super || event.hyper
      const isNewlineShortcut = (isReturn && hasModifier) || isLinefeed || (event.name === "j" && event.ctrl)

      if (handleFileReferenceMenuKeyDown(event)) return
      if (handleCommandMenuKeyDown(event)) return

      if (isReturn && !hasModifier) {
        event.preventDefault()
        const value = instanceRef.current?.plainText ?? ""
        const trimmedValue = value.trim()
        if (!trimmedValue) return

        const command = commandMenuOpen ? selectedCommand : commands.find((item) => item.name === trimmedValue)
        if (command) {
          if (command.clearInputOnRun !== false) clearValue()
          void executeCommand(command.name, { input: { clear: blurAndClearValue } })
          return
        }

        if (trimmedValue.startsWith("/")) return

        if (clearOnSubmit) clearValue()
        onSubmit?.(value)
        return
      }

      if (isNewlineShortcut) {
        event.preventDefault()
        instanceRef.current?.insertText("\n")
      }
    },
    [
      blurAndClearValue,
      clearOnSubmit,
      clearValue,
      commandMenuOpen,
      commands,
      executeCommand,
      handleCommandMenuKeyDown,
      handleFileReferenceMenuKeyDown,
      onSubmit,
      selectedCommand,
    ],
  )

  return (
    <box style={{ width: "100%", position: "relative" }}>
      <ChatPanel variant="input">
        <textarea
          ref={instanceRef}
          placeholder={placeholder}
          focused={!disabled && !dialogOpen}
          textColor={theme.colors.textSoft}
          focusedTextColor={theme.colors.text}
          cursorColor={cursorColor}
          placeholderColor={theme.colors.placeholder}
          wrapMode="word"
          onKeyDown={handleKeyDown}
          onContentChange={() => setInputValue(instanceRef.current?.plainText ?? "")}
          style={{ width: "100%" }}
        />
        <InputStatus />
      </ChatPanel>
      {fileReferenceMenuOpen ? (
        <FileReferenceMenu
          hasScrollableOverflow={hasScrollableFileReferenceOverflow}
          items={fileReferenceItems}
          onSelectIndex={selectFileReferenceIndex}
          scrollRef={fileReferenceMenuScrollRef}
          selectedIndex={selectedFileReferenceIndex}
          visibleFileReferenceLimit={visibleFileReferenceLimit}
        />
      ) : commandMenuOpen ? (
        <CommandMenu
          commands={commandSuggestions}
          hasScrollableOverflow={hasScrollableOverflow}
          onSelectIndex={selectCommandIndex}
          scrollRef={commandMenuScrollRef}
          selectedIndex={selectedIndex}
          visibleCommandLimit={visibleCommandLimit}
        />
      ) : null}
    </box>
  )
}
