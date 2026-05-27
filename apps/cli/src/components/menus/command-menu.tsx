import type { KeyEvent, ScrollBoxRenderable } from "@opentui/core"
import { useKeyboard } from "@opentui/react"
import { useCallback, useEffect, useMemo, useRef } from "react"
import { useCommandMenu } from "../../hooks/use-command-menu"
import { useCommandRuntime } from "../../providers/command-runtime"
import { useCommandMenuInteraction } from "../../providers/interaction"
import { useTheme } from "../../providers/theme"
import type { Command } from "../../types/commands"
import { FloatingListMenu } from "./floating-list-menu"

export function CommandMenu() {
  const scrollRef = useRef<ScrollBoxRenderable | null>(null)
  const { theme } = useTheme()
  const commandMenuInteraction = useCommandMenuInteraction()
  const commandRuntime = useCommandRuntime()
  const {
    dismissCommandMenu,
    prepareInputForCommand,
    registerCommandMenuHandle,
    setCommandMenuOpen,
  } = commandMenuInteraction.actions
  const { canOpen, query } = commandMenuInteraction.state
  const { executeCommand } = commandRuntime.actions
  const { commands } = commandRuntime.state
  const matchingCommands = useMemo(() => {
    if (!query.startsWith("/")) return []
    return commands.filter((command) => command.name.startsWith(query))
  }, [commands, query])

  // Command activation prepares the input layer before running the product effect.
  const activateCommand = useCallback(
    (command: Command) => {
      prepareInputForCommand(command)
      void executeCommand(command)
    },
    [executeCommand, prepareInputForCommand],
  )

  const commandMenuController = useCommandMenu({
    commands: matchingCommands,
    onConfirm: activateCommand,
    onDismiss: dismissCommandMenu,
    query,
    scrollRef,
  })
  const { dismiss, handleKeyDown, selectIndex } = commandMenuController.actions
  const { hasScrollableOverflow, visibleItemLimit } = commandMenuController.layout
  const { isOpen, selectedCommand, selectedIndex } = commandMenuController.state
  const isCommandMenuVisible = isOpen && canOpen

  // Publish open state so the interaction layer can derive global layer priority.
  useEffect(() => {
    setCommandMenuOpen(isCommandMenuVisible)

    return () => setCommandMenuOpen(false)
  }, [isCommandMenuVisible, setCommandMenuOpen])

  // Register only menu capabilities needed by global Ctrl+C/Esc/Tab handling.
  useEffect(() => {
    return registerCommandMenuHandle({
      cancel: dismiss,
      executeSelected: () => {
        if (selectedCommand) activateCommand(selectedCommand)
      },
      isOpen: () => isCommandMenuVisible,
    })
  }, [activateCommand, dismiss, isCommandMenuVisible, registerCommandMenuHandle, selectedCommand])

  useKeyboard((event: KeyEvent) => {
    if (isCommandMenuVisible) handleKeyDown(event)
  })

  if (!isCommandMenuVisible) return null

  return (
    <FloatingListMenu
      getItemId={(index) => `command-menu-item-${matchingCommands[index]?.name ?? index}`}
      getItemKey={(index) => matchingCommands[index]?.name ?? String(index)}
      hasScrollableOverflow={hasScrollableOverflow}
      itemCount={matchingCommands.length}
      onSelectIndex={selectIndex}
      renderItem={(index, selected) => {
        const command = matchingCommands[index]
        if (!command) return null

        return (
          <>
            <text fg={selected ? theme.colors.selectedText : theme.colors.text}>{command.name}</text>
            <text fg={selected ? theme.colors.text : theme.colors.dim}>{command.description}</text>
          </>
        )
      }}
      scrollRef={scrollRef}
      selectedIndex={selectedIndex}
      visibleItemLimit={visibleItemLimit}
    />
  )
}
