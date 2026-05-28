import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { loginWithPkce } from "../../lib/auth/pkce-login"
import { refreshAccessToken as refreshAuthAccessToken } from "../../lib/auth/refresh-token"
import { revokeRefreshToken } from "../../lib/auth/revoke-refresh-token"
import { deleteAuthSession, loadAuthSession, saveAuthSession } from "../../lib/auth/session-storage"
import { getAccessTokenRefreshDelayMs } from "../../lib/auth/token-expiry"
import type { AuthSession, AuthStatus } from "../../types/auth"
import { useToast } from "../toast"
import { AuthContext } from "./auth-context"

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (typeof error === "string" && error.trim()) return error
  return "Authentication failed"
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [status, setStatus] = useState<AuthStatus>("loading")
  const [error, setError] = useState<string | null>(null)
  const { error: showToastError, warning: showToastWarning } = useToast().actions
  const loginPromiseRef = useRef<Promise<void> | null>(null)
  const logoutPromiseRef = useRef<Promise<void> | null>(null)
  const refreshPromiseRef = useRef<Promise<AuthSession> | null>(null)
  const sessionRef = useRef<AuthSession | null>(null)

  sessionRef.current = session

  const clearSession = useCallback(() => {
    setSession(null)
    setError(null)
    setStatus("unauthenticated")
  }, [])

  const persistSession = useCallback(
    async (nextSession: AuthSession) => {
      try {
        await saveAuthSession(nextSession)
      } catch {
        showToastWarning("Auth session could not be saved locally.", { title: "Auth" })
      }
    },
    [showToastWarning],
  )

  const deletePersistedSession = useCallback(async () => {
    try {
      await deleteAuthSession()
    } catch {
      showToastWarning("Auth session file could not be deleted.", { title: "Auth" })
    }
  }, [showToastWarning])

  const login = useCallback(async () => {
    if (loginPromiseRef.current) return loginPromiseRef.current

    const loginPromise = (async () => {
      setStatus("authenticating")
      setError(null)

      try {
        const nextSession = await loginWithPkce()
        await persistSession(nextSession)
        setSession(nextSession)
        setStatus("authenticated")
      } catch (loginError) {
        const message = getErrorMessage(loginError)
        setError(message)
        setStatus("error")
        throw loginError
      } finally {
        loginPromiseRef.current = null
      }
    })()

    loginPromiseRef.current = loginPromise
    return loginPromise
  }, [persistSession])

  const logout = useCallback(async () => {
    if (logoutPromiseRef.current) return logoutPromiseRef.current

    const logoutPromise = (async () => {
      const currentSession = sessionRef.current

      try {
        if (currentSession) await revokeRefreshToken(currentSession)
      } catch {
        showToastWarning("Refresh token revocation failed. Local logout completed.", { title: "Auth" })
      } finally {
        await deletePersistedSession()
        clearSession()
        logoutPromiseRef.current = null
      }
    })()

    logoutPromiseRef.current = logoutPromise
    return logoutPromise
  }, [clearSession, deletePersistedSession, showToastWarning])

  const refreshAccessToken = useCallback(async () => {
    if (refreshPromiseRef.current) return refreshPromiseRef.current

    const refreshPromise = (async () => {
      const currentSession = sessionRef.current
      if (!currentSession?.refreshToken) {
        const message = "Refresh token is missing. Please run /login again."
        await deletePersistedSession()
        clearSession()
        setError(message)
        setStatus("error")
        showToastError(message, { title: "Auth" })
        throw new Error(message)
      }

      try {
        const nextSession = await refreshAuthAccessToken(currentSession)
        await persistSession(nextSession)
        setSession(nextSession)
        setError(null)
        setStatus("authenticated")
        return nextSession
      } catch (refreshError) {
        const message = getErrorMessage(refreshError)
        await deletePersistedSession()
        clearSession()
        setError(message)
        setStatus("error")
        showToastError("Session expired. Please run /login again.", { title: "Auth" })
        throw refreshError
      } finally {
        refreshPromiseRef.current = null
      }
    })()

    refreshPromiseRef.current = refreshPromise
    return refreshPromise
  }, [clearSession, deletePersistedSession, persistSession, showToastError])

  useEffect(() => {
    let cancelled = false

    async function hydrateSession() {
      try {
        const storedSession = await loadAuthSession()
        if (cancelled) return

        if (!storedSession) {
          setStatus("unauthenticated")
          return
        }

        if (!storedSession.refreshToken) {
          await deletePersistedSession()
          if (cancelled) return
          setError("Refresh token is missing. Please run /login again.")
          setStatus("error")
          return
        }

        if (getAccessTokenRefreshDelayMs(storedSession) === 0) {
          const nextSession = await refreshAuthAccessToken(storedSession)
          await persistSession(nextSession)
          if (cancelled) return
          setSession(nextSession)
          setError(null)
          setStatus("authenticated")
          return
        }

        setSession(storedSession)
        setError(null)
        setStatus("authenticated")
      } catch (hydrateError) {
        const message = getErrorMessage(hydrateError)
        await deletePersistedSession()
        if (cancelled) return
        setSession(null)
        setError(message)
        setStatus("error")
        showToastError("Stored session expired. Please run /login again.", { title: "Auth" })
      }
    }

    void hydrateSession()

    return () => {
      cancelled = true
    }
  }, [deletePersistedSession, persistSession, showToastError])

  useEffect(() => {
    if (status === "loading") return
    if (!session) return

    if (!session.refreshToken) {
      const message = "Refresh token is missing. Please run /login again."
      void deletePersistedSession()
      clearSession()
      setError(message)
      setStatus("error")
      showToastError(message, { title: "Auth" })
      return
    }

    const timeout = setTimeout(() => {
      void refreshAccessToken()
    }, getAccessTokenRefreshDelayMs(session))

    return () => clearTimeout(timeout)
  }, [clearSession, deletePersistedSession, refreshAccessToken, session, showToastError, status])

  const value = useMemo(
    () => ({
      actions: {
        login,
        logout,
        refreshAccessToken,
      },
      state: {
        error,
        session,
        status,
      },
    }),
    [error, login, logout, refreshAccessToken, session, status],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
