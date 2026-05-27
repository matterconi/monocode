import type { KeyEvent, ScrollBoxRenderable } from "@opentui/core"
import { useCallback, useMemo, type RefObject } from "react"
import type { Command } from "../types/commands"
import { useSelectableList } from "./use-selectable-list"

interface CommandMenuState {
  commands: Command[]
  onConfirm?: (command: Command) => void
  onDismiss?: () => void
  query: string
  scrollRef?: RefObject<ScrollBoxRenderable | null>
}

const visibleCommandLimit = 5

export function useCommandMenu({ commands, onConfirm, onDismiss, query, scrollRef }: CommandMenuState) {
  const isOpen = commands.length > 0
  const getItemId = useCallback((index: number) => `command-menu-item-${commands[index]?.name ?? index}`, [commands])
  const { handleSelectableListKeyDown, selectedIndex, selectIndex } = useSelectableList({
    getItemId,
    itemCount: commands.length,
    onConfirm: (index) => {
      const command = commands[index]
      if (command) onConfirm?.(command)
    },
    resetKey: query,
    scrollRef,
  })
  const selectedCommand = isOpen ? (commands[selectedIndex] ?? commands[0]) : undefined
  const dismissCommandMenu = useCallback(() => {
    onDismiss?.()
  }, [onDismiss])

  const handleCommandMenuKeyDown = useCallback(
    (event: KeyEvent) => {
      if (!isOpen) return false

      return handleSelectableListKeyDown(event)
    },
    [handleSelectableListKeyDown, isOpen],
  )

  return useMemo(
    () => ({
      actions: {
        dismiss: dismissCommandMenu,
        handleKeyDown: handleCommandMenuKeyDown,
        selectIndex,
      },
      layout: {
        hasScrollableOverflow: commands.length > visibleCommandLimit,
        visibleItemLimit: visibleCommandLimit,
      },
      state: {
        isOpen,
        selectedCommand,
        selectedIndex,
      },
    }),
    [commands.length, dismissCommandMenu, handleCommandMenuKeyDown, isOpen, selectIndex, selectedCommand, selectedIndex],
  )
}
