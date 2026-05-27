import type { KeyEvent, ScrollBoxRenderable } from "@opentui/core"
import { useKeyboard } from "@opentui/react"
import { useCallback, useEffect, useRef } from "react"
import { useFileReferenceMenu } from "../../hooks/use-file-reference-menu"
import type { FileReferenceItem } from "../../lib/file-references"
import { useFileReferenceMenuInteraction, useInputInteraction } from "../../providers/interaction"
import { useTheme } from "../../providers/theme"
import { FloatingListMenu } from "./floating-list-menu"

export function FileReferenceMenu() {
  const scrollRef = useRef<ScrollBoxRenderable | null>(null)
  const { theme } = useTheme()
  const inputInteraction = useInputInteraction()
  const fileReferenceMenuInteraction = useFileReferenceMenuInteraction()
  const { replaceTextRange } = inputInteraction.actions
  const { inputText, textCursorOffset } = inputInteraction.state
  const { registerFileReferenceMenuHandle, setFileReferenceMenuOpen } = fileReferenceMenuInteraction.actions

  // File reference insertion edits only the active @query token in the input.
  const insertFileReference = useCallback(
    (item: FileReferenceItem, triggerStart: number, nextTextCursorOffset: number) => {
      replaceTextRange(triggerStart, nextTextCursorOffset, `@${item.path}`)
    },
    [replaceTextRange],
  )

  const fileReferenceMenuController = useFileReferenceMenu({
    inputText,
    onConfirm: insertFileReference,
    scrollRef,
    textCursorOffset,
  })
  const { confirmSelected, dismiss, handleKeyDown, selectIndex } = fileReferenceMenuController.actions
  const { hasScrollableOverflow, visibleItemLimit } = fileReferenceMenuController.layout
  const { isOpen, items, selectedIndex } = fileReferenceMenuController.state

  // Publish open state separately from the slash menu so priorities stay explicit.
  useEffect(() => {
    setFileReferenceMenuOpen(isOpen)

    return () => setFileReferenceMenuOpen(false)
  }, [isOpen, setFileReferenceMenuOpen])

  // Register only the capabilities consumed by global layer keyboard handling.
  useEffect(() => {
    return registerFileReferenceMenuHandle({
      cancel: dismiss,
      confirmSelected,
      isOpen: () => isOpen,
    })
  }, [confirmSelected, dismiss, isOpen, registerFileReferenceMenuHandle])

  useKeyboard((event: KeyEvent) => {
    if (isOpen) handleKeyDown(event)
  })

  if (!isOpen) return null

  return (
    <FloatingListMenu
      getItemId={(index) => `file-reference-menu-item-${items[index]?.path ?? index}`}
      getItemKey={(index) => items[index]?.path ?? String(index)}
      hasScrollableOverflow={hasScrollableOverflow}
      itemCount={items.length}
      onSelectIndex={selectIndex}
      renderItem={(index, selected) => {
        const item = items[index]
        if (!item) return null

        return (
          <>
            <text fg={selected ? theme.colors.selectedText : theme.colors.text}>{item.path}</text>
            <text fg={selected ? theme.colors.text : theme.colors.dim}>{item.type}</text>
          </>
        )
      }}
      scrollRef={scrollRef}
      selectedIndex={selectedIndex}
      visibleItemLimit={visibleItemLimit}
    />
  )
}
