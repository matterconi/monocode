import type { AuthSession } from "../../types/auth"

const authRefreshSkewMs = 60_000

export function isAccessTokenExpired(session: AuthSession) {
  return Date.now() > session.expiresAt
}

export function isAccessTokenExpiring(session: AuthSession) {
  return Date.now() > session.expiresAt - authRefreshSkewMs
}

export function getAccessTokenRefreshDelayMs(session: AuthSession) {
  return Math.max(session.expiresAt - authRefreshSkewMs - Date.now(), 0)
}
