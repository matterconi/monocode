import type { KeyEvent, ScrollBoxRenderable } from "@opentui/core"
import { useCallback, useEffect, useMemo, useState, type RefObject } from "react"
import { listFileReferences, type FileReferenceItem } from "../lib/file-references"
import { useSelectableList } from "./use-selectable-list"

interface UseFileReferenceMenuOptions {
  inputText: string
  onConfirm: (item: FileReferenceItem, triggerStart: number, textCursorOffset: number) => void
  scrollRef?: RefObject<ScrollBoxRenderable | null>
  textCursorOffset: number
}

interface FileReferenceTrigger {
  query: string
  start: number
}

const visibleFileReferenceLimit = 5

function getFileReferenceTrigger(inputText: string, textCursorOffset: number): FileReferenceTrigger | null {
  const beforeCursor = inputText.slice(0, textCursorOffset)
  const atIndex = beforeCursor.lastIndexOf("@")

  if (atIndex === -1) return null
  if (atIndex > 0 && !/\s/.test(beforeCursor[atIndex - 1] ?? "")) return null

  const query = beforeCursor.slice(atIndex + 1)
  if (/\s/.test(query)) return null

  return { query, start: atIndex }
}

export function useFileReferenceMenu({ inputText, onConfirm, scrollRef, textCursorOffset }: UseFileReferenceMenuOptions) {
  const [items, setItems] = useState<FileReferenceItem[]>([])
  const [dismissedToken, setDismissedToken] = useState<string | null>(null)
  const trigger = getFileReferenceTrigger(inputText, textCursorOffset)
  const token = trigger ? `${trigger.start}:${trigger.query}` : ""

  useEffect(() => {
    let cancelled = false

    void listFileReferences().then((nextItems) => {
      if (!cancelled) setItems(nextItems)
    })

    return () => {
      cancelled = true
    }
  }, [])

  const filteredItems = useMemo(() => {
    if (!trigger) return []

    const normalizedQuery = trigger.query.toLowerCase()
    if (!normalizedQuery) return items


    return items.filter((item) => item.path.toLowerCase().includes(normalizedQuery))
  }, [items, trigger])

  const isOpen = Boolean(trigger && filteredItems.length > 0 && dismissedToken !== token)
  const getItemId = useCallback(
    (index: number) => `file-reference-menu-item-${filteredItems[index]?.path ?? index}`,
    [filteredItems],
  )
  const confirmIndex = useCallback(
    (index: number) => {
      if (!trigger) return

      const item = filteredItems[index]
      if (item) onConfirm(item, trigger.start, textCursorOffset)
    },
    [filteredItems, onConfirm, textCursorOffset, trigger],
  )
  const { handleSelectableListKeyDown, selectedIndex, selectIndex } = useSelectableList({
    getItemId,
    itemCount: filteredItems.length,
    onConfirm: confirmIndex,
    resetKey: token,
    scrollRef,
  })
  const selectedItem = isOpen ? (filteredItems[selectedIndex] ?? filteredItems[0]) : undefined

  const dismissFileReferenceMenu = useCallback(() => {
    setDismissedToken(token)
  }, [token])

  const confirmSelectedFileReference = useCallback(() => {
    if (!trigger || !selectedItem) return
    onConfirm(selectedItem, trigger.start, textCursorOffset)
  }, [onConfirm, selectedItem, textCursorOffset, trigger])

  const handleFileReferenceMenuKeyDown = useCallback(
    (event: KeyEvent) => {
      if (!isOpen) return false

      return handleSelectableListKeyDown(event)
    },
    [handleSelectableListKeyDown, isOpen],
  )

  return useMemo(
    () => ({
      actions: {
        confirmSelected: confirmSelectedFileReference,
        dismiss: dismissFileReferenceMenu,
        handleKeyDown: handleFileReferenceMenuKeyDown,
        selectIndex,
      },
      layout: {
        hasScrollableOverflow: filteredItems.length > visibleFileReferenceLimit,
        visibleItemLimit: visibleFileReferenceLimit,
      },
      state: {
        isOpen,
        items: filteredItems,
        selectedIndex,
      },
    }),
    [
      confirmSelectedFileReference,
      dismissFileReferenceMenu,
      filteredItems,
      handleFileReferenceMenuKeyDown,
      isOpen,
      selectIndex,
      selectedIndex,
    ],
  )
}
