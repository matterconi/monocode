import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import { client } from "../../lib/client"
import { sessionsSchema } from "../../lib/sessions"
import type { Session, SessionsContextValue, SessionsStatus } from "../../types/sessions"

const SessionsContext = createContext<SessionsContextValue | null>(null)

export function SessionsProvider({ children }: { children: ReactNode }) {
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

  // Dialogs can refresh stale data without blocking already cached rows.
  const refreshSessions = useCallback(async () => {
    setStatus("loading")

    try {
      const response = await client.sessions.$get()
      const loadedSessions = sessionsSchema.parse(await response.json())
      setSessions(loadedSessions)
      setError(null)
      setStatus("ready")
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setStatus("error")
    }
  }, [])

  useEffect(() => {
    void refreshSessions()
  }, [refreshSessions])

  return (
    <SessionsContext.Provider value={{ cacheSession, error, refreshSessions, sessions, status }}>
      {children}
    </SessionsContext.Provider>
  )
}

export function useSessions() {
  const context = useContext(SessionsContext)
  if (!context) throw new Error("useSessions must be used within SessionsProvider")
  return context
}
