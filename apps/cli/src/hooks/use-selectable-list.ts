import type { KeyEvent, ScrollBoxRenderable } from "@opentui/core"
import { useCallback, useEffect, useState, type RefObject } from "react"

interface UseSelectableListOptions {
  getItemId?: (index: number) => string
  initialIndex?: number
  itemCount: number
  onConfirm?: (index: number) => void
  onSelect?: (index: number) => void
  resetKey?: string
  scrollRef?: RefObject<ScrollBoxRenderable | null>
}

function clampIndex(index: number, itemCount: number) {
  return Math.max(0, Math.min(index, Math.max(itemCount - 1, 0)))
}

export function useSelectableList({
  getItemId,
  initialIndex = 0,
  itemCount,
  onConfirm,
  onSelect,
  resetKey = "",
  scrollRef,
}: UseSelectableListOptions) {
  const [selection, setSelection] = useState({ index: initialIndex, resetKey })
  const selectedIndex = selection.resetKey === resetKey ? clampIndex(selection.index, itemCount) : clampIndex(initialIndex, itemCount)
  const hasItems = itemCount > 0

  useEffect(() => {
    if (!hasItems || !getItemId) return
    scrollRef?.current?.scrollChildIntoView(getItemId(selectedIndex))
  }, [getItemId, hasItems, scrollRef, selectedIndex])

  const selectIndex = useCallback(
    (index: number) => {
      const nextIndex = clampIndex(index, itemCount)
      setSelection({ index: nextIndex, resetKey })
      onSelect?.(nextIndex)
    },
    [itemCount, onSelect, resetKey],
  )

  const moveSelection = useCallback(
    (delta: number) => {
      if (!hasItems) return
      const nextIndex = (selectedIndex + delta + itemCount) % itemCount
      setSelection({ index: nextIndex, resetKey })
      onSelect?.(nextIndex)
    },
    [hasItems, itemCount, onSelect, resetKey, selectedIndex],
  )

  const handleSelectableListKeyDown = useCallback(
    (event: KeyEvent) => {
      if (!hasItems) return false

      if (event.name === "down") {
        event.preventDefault()
        moveSelection(1)
        return true
      }

      if (event.name === "up") {
        event.preventDefault()
        moveSelection(-1)
        return true
      }

      if ((event.name === "return" || event.name === "enter") && onConfirm) {
        event.preventDefault()
        onConfirm(selectedIndex)
        return true
      }

      return false
    },
    [hasItems, moveSelection, onConfirm, selectedIndex],
  )

  return {
    handleSelectableListKeyDown,
    selectedIndex,
    selectIndex,
  }
}
