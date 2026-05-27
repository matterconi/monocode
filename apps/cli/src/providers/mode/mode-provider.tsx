
import { createContext, useCallback, useContext, useState } from "react"
import { nextMode, type ModeName } from "@matcode/ai"

interface ModeContextValue {
  mode: ModeName
  toggleMode: () => void
}

const ModeContext = createContext<ModeContextValue>({ mode: "build", toggleMode: () => {} })

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ModeName>("build")

  const toggleMode = useCallback(() => setMode((prev) => nextMode(prev)), [])

  return <ModeContext.Provider value={{ mode, toggleMode }}>{children}</ModeContext.Provider>
}

export function useMode() {
  return useContext(ModeContext)
}
