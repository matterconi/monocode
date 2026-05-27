import { createContext, useCallback, useContext, useState, type ReactNode } from "react"
import { getTheme, themeNames, type Theme, type ThemeName } from "../../theme"

interface ThemeContextValue {
  themeName: ThemeName
  previewThemeName: ThemeName | null
  themeNames: ThemeName[]
  theme: Theme
  clearThemePreview: () => void
  previewTheme: (themeName: ThemeName) => void
  selectTheme: (themeName: ThemeName) => void
}

const defaultThemeName: ThemeName = "dark"

const ThemeContext = createContext<ThemeContextValue>({
  themeName: defaultThemeName,
  previewThemeName: null,
  themeNames,
  theme: getTheme(defaultThemeName),
  clearThemePreview: () => {},
  previewTheme: () => {},
  selectTheme: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>(defaultThemeName)
  const [previewThemeName, setPreviewThemeName] = useState<ThemeName | null>(null)

  const clearThemePreview = useCallback(() => {
    setPreviewThemeName(null)
  }, [])

  const selectTheme = useCallback((nextThemeName: ThemeName) => {
    setThemeName(nextThemeName)
    setPreviewThemeName(null)
  }, [])

  return (
    <ThemeContext.Provider
      value={{
        themeName,
        previewThemeName,
        themeNames,
        theme: getTheme(previewThemeName ?? themeName),
        clearThemePreview,
        previewTheme: setPreviewThemeName,
        selectTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
