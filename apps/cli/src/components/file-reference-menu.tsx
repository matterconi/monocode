import type { ScrollBoxRenderable } from "@opentui/core"
import type { RefObject } from "react"
import type { FileReferenceItem } from "../lib/file-references"
import { useTheme } from "../providers/theme-provider"
import { FloatingListMenu } from "./floating-list-menu"

interface FileReferenceMenuProps {
  hasScrollableOverflow: boolean
  items: FileReferenceItem[]
  onSelectIndex: (index: number) => void
  scrollRef?: RefObject<ScrollBoxRenderable | null>
  selectedIndex: number
  visibleFileReferenceLimit: number
}

export function FileReferenceMenu({
  hasScrollableOverflow,
  items,
  onSelectIndex,
  scrollRef,
  selectedIndex,
  visibleFileReferenceLimit,
}: FileReferenceMenuProps) {
  const { theme } = useTheme()

  return (
    <FloatingListMenu
      getItemId={(index) => `file-reference-menu-item-${items[index]?.path ?? index}`}
      getItemKey={(index) => items[index]?.path ?? String(index)}
      hasScrollableOverflow={hasScrollableOverflow}
      itemCount={items.length}
      onSelectIndex={onSelectIndex}
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
      visibleItemLimit={visibleFileReferenceLimit}
    />
  )
}
