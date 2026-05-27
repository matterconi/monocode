import type { KeyEvent, TextareaRenderable } from "@opentui/core"
import { decodePasteBytes } from "@opentui/core"
import { usePaste } from "@opentui/react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useInputInteraction } from "../../providers/interaction"
import { useTheme } from "../../providers/theme"
import { ChatPanel } from "../chat/chat-panel"
import { InputStatus } from "./input-meta"

export interface InputProps {
  clearOnSubmit?: boolean
  disabled?: boolean
  onSubmit?: (value: string) => void
  placeholder: string
  variant: "chat" | "home"
}

interface PasteBlock {
  label: string
  offset: number
  text: string
}

const countLines = (text: string) => text.split(/\r\n|\r|\n/).length

const createPastePlaceholder = (lineCount: number) => `[Pasted ${lineCount} lines]`

export function Input({ clearOnSubmit = false, disabled = false, onSubmit, placeholder, variant }: InputProps) {
  const instanceRef = useRef<TextareaRenderable>(null)
  const pasteBlocksRef = useRef<PasteBlock[]>([])
  const [visiblePasteBlocks, setVisiblePasteBlocks] = useState<PasteBlock[]>([])
  const { theme } = useTheme()
  const inputInteraction = useInputInteraction()
  const inputActions = inputInteraction.actions
  const hasVisiblePasteBlock = visiblePasteBlocks.length > 0

  const resolvePasteBlocks = useCallback((value: string) => {
    let resolvedValue = value

    for (const block of [...pasteBlocksRef.current].sort((a, b) => b.offset - a.offset)) {
      resolvedValue = `${resolvedValue.slice(0, block.offset)}${block.text}${resolvedValue.slice(block.offset)}`
    }

    return resolvedValue
  }, [])

  const clearValue = useCallback(() => {
    pasteBlocksRef.current = []
    setVisiblePasteBlocks([])
    instanceRef.current?.clear()
    inputActions.setInputText("")
    inputActions.setTextCursorOffset(0)
  }, [inputActions])

  const replaceTextRange = useCallback(
    (start: number, end: number, text: string) => {
      pasteBlocksRef.current = []
      setVisiblePasteBlocks([])
      instanceRef.current?.setSelection(start, end)
      instanceRef.current?.insertText(text)
      inputActions.setInputText(instanceRef.current?.plainText ?? "")
      inputActions.setTextCursorOffset(instanceRef.current?.cursorOffset ?? 0)
    },
    [inputActions],
  )

  const removeLastPasteBlock = useCallback(() => {
    const nextPasteBlocks = pasteBlocksRef.current.slice(0, -1)
    pasteBlocksRef.current = nextPasteBlocks
    setVisiblePasteBlocks(nextPasteBlocks)
  }, [])

  // Register narrow textarea capabilities instead of exposing the OpenTUI ref globally.
  useEffect(() => {
    const textarea = instanceRef.current
    inputActions.setInputText(textarea?.plainText ?? "")
    inputActions.setTextCursorOffset(textarea?.cursorOffset ?? 0)

    return inputActions.registerInputHandle({
      blur: () => instanceRef.current?.blur(),
      clear: clearValue,
      getInputText: () => resolvePasteBlocks(instanceRef.current?.plainText ?? ""),
      getTextCursorOffset: () => instanceRef.current?.cursorOffset ?? 0,
      replaceTextRange,
    })
  }, [clearValue, inputActions, replaceTextRange, resolvePasteBlocks])

  usePaste((event) => {
    if (disabled || !inputInteraction.state.isActive) return

    const pastedText = decodePasteBytes(event.bytes)
    const lineCount = countLines(pastedText)
    if (lineCount <= 1) return

    const textarea = instanceRef.current
    if (!textarea) return

    const pasteLabel = createPastePlaceholder(lineCount)
    const currentText = textarea.plainText ?? ""
    const cursorOffset = textarea.cursorOffset ?? currentText.length

    const nextPasteBlocks = [...pasteBlocksRef.current, { label: pasteLabel, offset: cursorOffset, text: pastedText }]
    pasteBlocksRef.current = nextPasteBlocks
    setVisiblePasteBlocks(nextPasteBlocks)

    queueMicrotask(() => {
      textarea.clear()
      textarea.insertText(currentText)
      textarea.setSelection(cursorOffset, cursorOffset)
      inputActions.setInputText(currentText)
      inputActions.setTextCursorOffset(textarea.cursorOffset ?? cursorOffset)
    })
  })

  const handleKeyDown = useCallback(
    (event: KeyEvent) => {
      const isReturn = event.name === "return" || event.name === "enter"
      const isLinefeed = event.name === "linefeed"
      const isDeletePasteBlock = event.name === "backspace" || event.name === "delete"
      const hasModifier = event.shift || event.ctrl || event.meta || event.option || event.super || event.hyper
      const isNewlineShortcut = (isReturn && hasModifier) || isLinefeed || (event.name === "j" && event.ctrl)

      if (isDeletePasteBlock && pasteBlocksRef.current.length > 0) {
        const textarea = instanceRef.current
        const currentText = textarea?.plainText ?? ""
        const cursorOffset = textarea?.cursorOffset ?? 0

        if (!currentText || cursorOffset === 0) {
          event.preventDefault()
          removeLastPasteBlock()
          return
        }
      }

      if (isReturn && !hasModifier) {
        event.preventDefault()
        // Submit only when input is the top interaction layer.
        if (!inputInteraction.state.isActive) return

        const visibleValue = instanceRef.current?.plainText ?? ""
        const value = resolvePasteBlocks(visibleValue)
        if (!value.trim()) return
        if (visibleValue.trim().startsWith("/")) return

        if (clearOnSubmit) clearValue()
        onSubmit?.(value)
        return
      }

      if (isNewlineShortcut) {
        event.preventDefault()
        instanceRef.current?.insertText("\n")
      }
    },
    [clearOnSubmit, clearValue, inputInteraction.state.isActive, onSubmit, removeLastPasteBlock, resolvePasteBlocks],
  )

  const textarea = (
    <box style={{ width: "100%", position: "relative" }}>
      <ChatPanel variant="input">
        <box flexDirection="row" gap={1} style={{ width: "100%" }}>
          {hasVisiblePasteBlock ? (
            <box flexDirection="row" gap={1} flexShrink={0}>
              {visiblePasteBlocks.map((block, index) => (
                <text key={`${block.label}-${index}`} fg={theme.colors.text} bg={theme.colors.accent}>
                  {block.label}
                </text>
              ))}
            </box>
          ) : null}
          <textarea
            ref={instanceRef}
            placeholder={hasVisiblePasteBlock ? "" : placeholder}
            focused={!disabled && inputInteraction.state.canFocus}
            textColor={theme.colors.textSoft}
            focusedTextColor={theme.colors.text}
            cursorColor={variant === "home" ? theme.colors.accent : theme.colors.text}
            placeholderColor={theme.colors.placeholder}
            wrapMode="word"
            onKeyDown={handleKeyDown}
            onContentChange={() => {
              const currentText = instanceRef.current?.plainText ?? ""
              inputActions.setInputText(currentText)
              inputActions.setTextCursorOffset(instanceRef.current?.cursorOffset ?? 0)
            }}
            style={{ width: "100%" }}
          />
        </box>
        <InputStatus />
      </ChatPanel>
    </box>
  )

  if (variant === "home") {
    return (
      <box style={{ width: "100%", alignItems: "center" }}>
        <box style={{ width: "100%" }}>
          <box style={{ width: "100%", position: "relative", justifyContent: "center" }}>{textarea}</box>
        </box>
      </box>
    )
  }

  return (
    <box
      style={{ width: "100%", border: ["top"], borderColor: theme.colors.border }}
      flexShrink={0}
      paddingBottom={1}
    >
      {textarea}
    </box>
  )
}
