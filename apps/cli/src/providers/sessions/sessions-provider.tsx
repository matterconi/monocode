import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import { getAuthHeaders } from "../../lib/auth/request-headers"
import { client } from "../../lib/client"
import { sessionsSchema } from "../../lib/sessions"
import type { Session, SessionsContextValue, SessionsStatus } from "../../types/sessions"
import { useAuth } from "../auth"

const SessionsContext = createContext<SessionsContextValue | null>(null)

export function SessionsProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [status, setStatus] = useState<SessionsStatus>("loading")
  const [error, setError] = useState<string | null>(null)

  // Creation flows cache returned sessions immediately instead of forcing a refetch.
  const cacheSession = useCallback((session: Session) => {
    setSessions((current) => {
      const existingIndex = current.findIndex((item) => item.id === session.id)
      if (existingIndex === -1) return [session, ...current]

      return current.map((item) => (item.id === session.id ? session : item))
    })
    setError(null)
    setStatus("ready")
  }, [])

  const clearSessions = useCallback(() => {
    setSessions([])
    setError(null)
    setStatus("ready")
  }, [])

  // Dialogs can refresh stale data without blocking already cached rows.
  const refreshSessions = useCallback(async () => {
    if (auth.state.status === "loading") {
      setStatus("loading")
      return
    }

    if (!auth.state.session) {
      setSessions([])
      setStatus("ready")
      setError("Please run /login before loading sessions.")
      return
    }

    setStatus("loading")

    try {
      const response = await client.sessions.$get(undefined, { headers: await getAuthHeaders(auth) })
      const loadedSessions = sessionsSchema.parse(await response.json())
      setSessions(loadedSessions)
      setError(null)
      setStatus("ready")
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setStatus("error")
    }
  }, [auth])

  useEffect(() => {
    void refreshSessions()
  }, [refreshSessions])

  return (
    <SessionsContext.Provider value={{ cacheSession, clearSessions, error, refreshSessions, sessions, status }}>
      {children}
    </SessionsContext.Provider>
  )
}

export function useSessions() {
  const context = useContext(SessionsContext)
  if (!context) throw new Error("useSessions must be used within SessionsProvider")
  return context
}
