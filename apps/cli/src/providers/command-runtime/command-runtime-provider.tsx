import { useRenderer } from "@opentui/react"
import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react"
import { useNavigate } from "react-router"
import { commands } from "../../commands/commands"
import { SessionsDialog } from "../../components/dialogs/sessions-dialog"
import { ThemeDialog } from "../../components/dialogs/theme-dialog"
import type { Command } from "../../types/commands"
import { useDialog } from "../dialog"
import { useSessions } from "../sessions"

interface CommandRuntimeContextValue {
  actions: {
    executeCommand: (command: Command) => Promise<void>
  }
  state: {
    commands: Command[]
  }
}

const CommandRuntimeContext = createContext<CommandRuntimeContextValue | null>(null)

export function CommandRuntimeProvider({ children }: { children: ReactNode }) {
  const dialog = useDialog()
  const navigate = useNavigate()
  const renderer = useRenderer()
  const { refreshSessions } = useSessions()

  // Commands own product effects; menus and shortcuts are only launch surfaces.
  const executeCommand = useCallback(
    async (command: Command) => {
      switch (command.name) {
        case "/new":
          navigate("/")
          return
        case "/exit":
          renderer.destroy()
          return
        case "/sessions":
          // Show cached sessions immediately while refreshing in the background.
          void refreshSessions()
          dialog.actions.openDialog(<SessionsDialog />)
          return
        case "/theme":
          dialog.actions.openDialog(<ThemeDialog />)
          return
        case "/help":
        case "/clear":
        case "/history":
        case "/model":
        case "/settings":
          return
      }
    },
    [dialog.actions, navigate, refreshSessions, renderer],
  )

  const value = useMemo(
    () => ({
      actions: {
        executeCommand,
      },
      state: {
        commands,
      },
    }),
    [executeCommand],
  )

  return <CommandRuntimeContext.Provider value={value}>{children}</CommandRuntimeContext.Provider>
}

export function useCommandRuntime() {
  const context = useContext(CommandRuntimeContext)
  if (!context) throw new Error("useCommandRuntime must be used within CommandRuntimeProvider")
  return context
}
