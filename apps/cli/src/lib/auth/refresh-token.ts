import * as oauth from "oauth4webapi"
import type { AuthSession } from "../../types/auth"
import { getAuthConfig } from "./config"

export async function refreshAccessToken(session: AuthSession): Promise<AuthSession> {
  if (!session.refreshToken) throw new Error("Refresh token is missing")

  const config = getAuthConfig()
  const discoveryResponse = await oauth.discoveryRequest(config.issuerUrl)
  const authorizationServer = await oauth.processDiscoveryResponse(config.issuerUrl, discoveryResponse)
  const client: oauth.Client = { client_id: config.clientId }

  if (!authorizationServer.token_endpoint) throw new Error("Token endpoint was not discovered")

  const tokenResponse = await oauth.refreshTokenGrantRequest(
    authorizationServer,
    client,
    oauth.None(),
    session.refreshToken,
  )
  const tokens = await oauth.processRefreshTokenResponse(authorizationServer, client, tokenResponse)

  if (!tokens.expires_in || tokens.expires_in <= 0) {
    throw new Error("Refresh response did not include a valid token expiry")
  }

  return {
    accessToken: tokens.access_token,
    expiresAt: Date.now() + tokens.expires_in * 1000,
    idToken: tokens.id_token ?? session.idToken,
    refreshToken: tokens.refresh_token ?? session.refreshToken,
    scope: tokens.scope ?? session.scope,
    tokenType: tokens.token_type,
    userInfo: session.userInfo,
  }
}
