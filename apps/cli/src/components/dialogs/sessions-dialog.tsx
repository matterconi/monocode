import { useCallback, useMemo, useState } from "react"
import { useNavigate } from "react-router"
import { useSessions } from "../../hooks/use-sessions"
import { formatSessionDate, getSessionTitle } from "../../lib/sessions"
import { useDialog } from "../../providers/dialog"
import { useTheme } from "../../providers/theme"
import type { Session } from "../../types/sessions"
import { Dialog } from "./dialog"
import { DialogSearchInput } from "./dialog-search-input"
import { SelectableDialogList } from "./selectable-dialog-list"

export function SessionsDialog() {
  const [query, setQuery] = useState("")

  return (
    <Dialog title="Sessions">
      <DialogSearchInput focused value={query} onInput={setQuery} placeholder="Search sessions..." />
      <box flexDirection="column" gap={1} width="100%">
        <SessionsDialogContent query={query} />
      </box>
    </Dialog>
  )
}

function SessionsDialogContent({ query }: { query: string }) {
  const navigate = useNavigate()
  const dialog = useDialog()
  const dialogActions = dialog.actions
  const { theme } = useTheme()
  const { error, sessions, status } = useSessions()
  const normalizedQuery = query.trim().toLowerCase()

  // Session discovery is local to this dialog; the generic shell stays data-agnostic.
  const filteredSessions = useMemo(() => {
    if (!normalizedQuery) return sessions

    return sessions.filter((session) => {
      return getSessionTitle(session).toLowerCase().includes(normalizedQuery)
    })
  }, [normalizedQuery, sessions])

  const openSession = useCallback(
    (session: Session) => {
      dialogActions.closeDialog()
      navigate(`/sessions/${session.id}`)
    },
    [dialogActions, navigate],
  )

  const emptyMessage = normalizedQuery ? "No sessions found." : "No sessions yet."

  // Cached rows remain visible while refresh errors are reported non-destructively.
  return (
    <box flexDirection="column" gap={1} width="100%">
      {status === "loading" && sessions.length === 0 ? <text fg={theme.colors.dim}>Loading sessions...</text> : null}
      {status === "error" && sessions.length === 0 ? (
        <text fg={theme.colors.danger}>Could not load sessions: {error}</text>
      ) : null}
      {status === "error" && sessions.length > 0 ? <text fg={theme.colors.dim}>Could not refresh sessions.</text> : null}
      {filteredSessions.length === 0 && (status !== "loading" || sessions.length > 0) ? (
        <text fg={theme.colors.dim}>{emptyMessage}</text>
      ) : null}
      {filteredSessions.length > 0 ? (
        <SelectableDialogList
          getItemId={(session) => `sessions-dialog-item-${session.id}`}
          getItemKey={(session) => session.id}
          items={filteredSessions}
          onConfirm={openSession}
          renderItem={(session, selected) => (
            <>
              <text fg={selected ? theme.colors.selectedText : theme.colors.textSoft}>{getSessionTitle(session)}</text>
              <text fg={selected ? theme.colors.text : theme.colors.dim}>{formatSessionDate(session.updatedAt)}</text>
            </>
          )}
          resetKey={normalizedQuery}
        />
      ) : null}
    </box>
  )
}
