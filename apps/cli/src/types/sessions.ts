import type { Session } from "../lib/sessions"

export type SessionsStatus = "loading" | "ready" | "error"

export interface SessionsContextValue {
  cacheSession: (session: Session) => void
  error: string | null
  refreshSessions: () => Promise<void>
  sessions: Session[]
  status: SessionsStatus
}

export type { Session }
