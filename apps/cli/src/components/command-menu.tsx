import type { ScrollBoxRenderable } from "@opentui/core"
import type { RefObject } from "react"
import type { ChatCommand } from "../commands/chat-commands"
import { useTheme } from "../providers/theme-provider"
import { FloatingListMenu } from "./floating-list-menu"

interface CommandMenuProps {
  commands: ChatCommand[]
  hasScrollableOverflow: boolean
  onSelectIndex: (index: number) => void
  scrollRef?: RefObject<ScrollBoxRenderable | null>
  selectedIndex: number
  visibleCommandLimit: number
}

export function CommandMenu({
  commands,
  hasScrollableOverflow,
  onSelectIndex,
  scrollRef,
  selectedIndex,
  visibleCommandLimit,
}: CommandMenuProps) {
  const { theme } = useTheme()

  return (
    <FloatingListMenu
      getItemId={(index) => `command-menu-item-${commands[index]?.name ?? index}`}
      getItemKey={(index) => commands[index]?.name ?? String(index)}
      hasScrollableOverflow={hasScrollableOverflow}
      itemCount={commands.length}
      onSelectIndex={onSelectIndex}
      renderItem={(index, selected) => {
        const command = commands[index]
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
      visibleItemLimit={visibleCommandLimit}
    />
  )
}
