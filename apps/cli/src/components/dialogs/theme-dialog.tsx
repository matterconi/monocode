import { useCallback, useEffect, useMemo, useState } from "react"
import { useDialog } from "../../providers/dialog"
import { useTheme } from "../../providers/theme"
import type { ThemeName } from "../../theme"
import { Dialog } from "./dialog"
import { DialogSearchInput } from "./dialog-search-input"
import { SelectableDialogList } from "./selectable-dialog-list"

function getThemeLabel(themeName: ThemeName) {
  return themeName.charAt(0).toUpperCase() + themeName.slice(1)
}

export function ThemeDialog() {
  const [query, setQuery] = useState("")

  return (
    <Dialog title="Themes">
      <DialogSearchInput focused value={query} onInput={setQuery} placeholder="Search themes..." />
      <box flexDirection="column" gap={1} width="100%">
        <ThemeDialogContent query={query} />
      </box>
    </Dialog>
  )
}

function ThemeDialogContent({ query }: { query: string }) {
  const dialog = useDialog()
  const { clearThemePreview, previewTheme, selectTheme, theme, themeName, themeNames } = useTheme()
  const normalizedQuery = query.trim().toLowerCase()

  useEffect(() => {
    return () => {
      clearThemePreview()
    }
  }, [clearThemePreview])

  // Theme filtering is local dialog orchestration, not dialog-host behavior.
  const filteredThemeNames = useMemo(() => {
    if (!normalizedQuery) return themeNames

    return themeNames.filter((name) => {
      return name.toLowerCase().includes(normalizedQuery) || getThemeLabel(name).toLowerCase().includes(normalizedQuery)
    })
  }, [normalizedQuery, themeNames])

  const selectThemeAndClose = useCallback(
    (nextThemeName: ThemeName) => {
      selectTheme(nextThemeName)
      dialog.actions.closeDialog()
    },
    [dialog.actions, selectTheme],
  )

  // Selecting a theme is the product action; closing the modal is host interaction.
  return (
    <box flexDirection="column" gap={1} width="100%">
      {filteredThemeNames.length === 0 ? <text fg={theme.colors.dim}>No themes found.</text> : null}
      {filteredThemeNames.length > 0 ? (
        <SelectableDialogList
          getItemId={(name) => `theme-dialog-item-${name}`}
          getItemKey={(name) => name}
          items={filteredThemeNames}
          onConfirm={selectThemeAndClose}
          onSelect={previewTheme}
          renderItem={(name, selected) => {
            const active = name === themeName

            return (
              <>
                <text fg={selected ? theme.colors.selectedText : theme.colors.textSoft}>{getThemeLabel(name)}</text>
                <text fg={selected ? theme.colors.text : theme.colors.dim}>{active ? "active" : "select"}</text>
              </>
            )
          }}
          resetKey={normalizedQuery}
        />
      ) : null}
    </box>
  )
}
