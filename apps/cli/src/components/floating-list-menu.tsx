import type { ScrollBoxRenderable } from "@opentui/core"
import type { ReactNode, RefObject } from "react"
import { useTheme } from "../providers/theme-provider"

interface FloatingListMenuProps {
  hasScrollableOverflow: boolean
  itemCount: number
  getItemId: (index: number) => string
  getItemKey: (index: number) => string
  onSelectIndex: (index: number) => void
  renderItem: (index: number, selected: boolean) => ReactNode
  scrollRef?: RefObject<ScrollBoxRenderable | null>
  selectedIndex: number
  visibleItemLimit: number
}

export function FloatingListMenu({
  getItemId,
  getItemKey,
  hasScrollableOverflow,
  itemCount,
  onSelectIndex,
  renderItem,
  scrollRef,
  selectedIndex,
  visibleItemLimit,
}: FloatingListMenuProps) {
  const { theme } = useTheme()
  const viewportHeight = Math.min(itemCount, visibleItemLimit)

  return (
    <box
      border={hasScrollableOverflow ? ["left", "right"] : ["left"]}
      borderColor={theme.colors.placeholder}
      customBorderChars={{
        bottomLeft: "┃",
        bottomRight: "┃",
        bottomT: "━",
        cross: "━",
        horizontal: "━",
        leftT: "┣",
        rightT: "┫",
        topLeft: "┏",
        topRight: "┓",
        topT: "┳",
        vertical: "┃",
      }}
      flexDirection="column"
      gap={0}
      paddingX={2}
      paddingY={1}
      style={{
        backgroundColor: theme.colors.backgroundPanel,
        bottom: 5,
        left: 0,
        position: "absolute",
        width: "100%",
      }}
    >
      <scrollbox
        ref={scrollRef}
        height={viewportHeight}
        scrollY={true}
        viewportCulling={false}
        contentOptions={{ flexDirection: "column", gap: 0 }}
        scrollbarOptions={{
          trackOptions: {
            backgroundColor: theme.colors.backgroundPanel,
            foregroundColor: theme.colors.backgroundPanel,
          },
        }}
      >
        {Array.from({ length: itemCount }, (_, index) => {
          const selected = index === selectedIndex

          return (
            <box
              key={getItemKey(index)}
              id={getItemId(index)}
              backgroundColor={selected ? theme.colors.selectedBackground : undefined}
              flexDirection="row"
              justifyContent="space-between"
              onMouseOver={() => onSelectIndex(index)}
              paddingX={1}
              width="100%"
            >
              {renderItem(index, selected)}
            </box>
          )
        })}
      </scrollbox>
    </box>
  )
}
