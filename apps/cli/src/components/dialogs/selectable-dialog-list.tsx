import type { KeyEvent, ScrollBoxRenderable } from "@opentui/core"
import { useKeyboard } from "@opentui/react"
import { useCallback, useRef, type ReactNode } from "react"
import { useSelectableList } from "../../hooks/use-selectable-list"
import { useTheme } from "../../providers/theme"

interface SelectableDialogListProps<TItem> {
  getItemId: (item: TItem, index: number) => string
  getItemKey: (item: TItem, index: number) => string
  items: TItem[]
  onConfirm: (item: TItem) => void
  onSelect?: (item: TItem) => void
  renderItem: (item: TItem, selected: boolean) => ReactNode
  resetKey: string
  visibleItemLimit?: number
}

export function SelectableDialogList<TItem>({
  getItemId,
  getItemKey,
  items,
  onConfirm,
  onSelect,
  renderItem,
  resetKey,
  visibleItemLimit = 7,
}: SelectableDialogListProps<TItem>) {
  const { theme } = useTheme()
  const scrollRef = useRef<ScrollBoxRenderable | null>(null)
  const getIndexedItemId = useCallback(
    (index: number) => {
      const item = items[index]
      return item ? getItemId(item, index) : `dialog-list-item-${index}`
    },
    [getItemId, items],
  )
  const { handleSelectableListKeyDown, selectedIndex, selectIndex } = useSelectableList({
    getItemId: getIndexedItemId,
    itemCount: items.length,
    onConfirm: (index) => {
      const item = items[index]
      if (item) onConfirm(item)
    },
    onSelect: (index) => {
      const item = items[index]
      if (item) onSelect?.(item)
    },
    resetKey,
    scrollRef,
  })

  // Dialog lists share keyboard/hover selection without making the dialog shell stateful.
  useKeyboard((event: KeyEvent) => {
    handleSelectableListKeyDown(event)
  })

  return (
    <scrollbox
      ref={scrollRef}
      height={Math.min(items.length, visibleItemLimit)}
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
      {items.map((item, index) => {
        const selected = index === selectedIndex

        return (
          <box
            key={getItemKey(item, index)}
            id={getItemId(item, index)}
            backgroundColor={selected ? theme.colors.selectedBackground : undefined}
            flexDirection="row"
            justifyContent="space-between"
            onMouseDown={() => onConfirm(item)}
            onMouseOver={() => selectIndex(index)}
            paddingX={1}
            width="100%"
          >
            {renderItem(item, selected)}
          </box>
        )
      })}
    </scrollbox>
  )
}
