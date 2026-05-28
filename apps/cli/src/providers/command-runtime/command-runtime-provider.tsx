import { useRenderer } from "@opentui/react"
import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react"
import { useNavigate } from "react-router"
import { commands } from "../../commands/commands"
import { SessionsDialog } from "../../components/dialogs/sessions-dialog"
import { ThemeDialog } from "../../components/dialogs/theme-dialog"
import { isAccessTokenExpired, isAccessTokenExpiring } from "../../lib/auth/token-expiry"
import type { Command } from "../../types/commands"
import { useAuth } from "../auth"
import { useDialog } from "../dialog"
import { useSessions } from "../sessions"
import { useToast } from "../toast"

interface CommandRuntimeContextValue {
  actions: {
    executeCommand: (command: Command) => Promise<void>
  }
  state: {
    commands: Command[]
  }
}

const CommandRuntimeContext = createContext<CommandRuntimeContextValue | null>(null)

function formatAuthExpiresAt(expiresAt: number) {
  if (!Number.isFinite(expiresAt) || expiresAt <= 0) return "unknown"
  return new Date(expiresAt).toLocaleString()
}

function formatAuthStatusMessage(authState: ReturnType<typeof useAuth>["state"]) {
  const { error, session, status } = authState

  if (!session) {
    return error ? `status: ${status}\nerror: ${error}` : `status: ${status}\nsession: none`
  }

  const user = session.userInfo?.email ?? session.userInfo?.preferredUsername ?? session.userInfo?.sub ?? "unknown"

  return [
    `status: ${status}`,
    `user: ${user}`,
    `expires: ${formatAuthExpiresAt(session.expiresAt)}`,
    `expired: ${isAccessTokenExpired(session) ? "yes" : "no"}`,
    `expiring: ${isAccessTokenExpiring(session) ? "yes" : "no"}`,
    `tokenType: ${session.tokenType}`,
    `scope: ${session.scope ?? "none"}`,
    `accessToken: present`,
    `refreshToken: ${session.refreshToken ? "present" : "missing"}`,
    `idToken: ${session.idToken ? "present" : "missing"}`,
  ].join("\n")
}

export function CommandRuntimeProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()
  const dialog = useDialog()
  const navigate = useNavigate()
  const renderer = useRenderer()
  const { clearSessions, refreshSessions } = useSessions()
  const toast = useToast()

  // Commands own product effects; menus and shortcuts are only launch surfaces.
  const executeCommand = useCallback(
    async (command: Command) => {
      switch (command.name) {
        case "/new":
          navigate("/")
          return
        case "/login":
          toast.actions.info("Opening browser for login...", { title: "/login" })
          try {
            await auth.actions.login()
            toast.actions.success("Login completed.", { title: "/login" })
          } catch (error) {
            toast.actions.error(error, { title: "/login" })
          }
          return
        case "/logout":
          await auth.actions.logout()
          clearSessions()
          navigate("/")
          toast.actions.success("Logout completed.", { title: "/logout" })
          return
        case "/auth":
          toast.actions.info(formatAuthStatusMessage(auth.state), { duration: 8000, title: "/auth" })
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
          toast.actions.info("This command is not implemented yet.", { title: command.name })
          return
      }
    },
    [auth.actions, clearSessions, dialog.actions, navigate, refreshSessions, renderer, toast.actions],
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
