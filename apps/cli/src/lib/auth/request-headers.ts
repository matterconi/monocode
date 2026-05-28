import type { AuthContextValue } from "../../types/auth"
import { isAccessTokenExpiring } from "./token-expiry"

export async function getAuthHeaders(auth: AuthContextValue) {
  const currentSession = auth.state.session
  if (!currentSession) throw new Error("Please run /login before using the app.")

  const session = isAccessTokenExpiring(currentSession)
    ? await auth.actions.refreshAccessToken()
    : currentSession

  return {
    Authorization: `Bearer ${session.accessToken}`,
  }
}
