import * as oauth from "oauth4webapi"
import type { AuthSession, AuthUserInfo } from "../../types/auth"
import { openBrowser } from "./browser"
import { startAuthCallbackServer } from "./callback-server"
import { getAuthConfig } from "./config"

export async function loginWithPkce(): Promise<AuthSession> {
  const config = getAuthConfig()
  const discoveryResponse = await oauth.discoveryRequest(config.issuerUrl)
  const authorizationServer = await oauth.processDiscoveryResponse(config.issuerUrl, discoveryResponse)
  const client: oauth.Client = { client_id: config.clientId }

  if (!authorizationServer.authorization_endpoint) throw new Error("Authorization endpoint was not discovered")
  if (!authorizationServer.token_endpoint) throw new Error("Token endpoint was not discovered")

  const codeVerifier = oauth.generateRandomCodeVerifier()
  const codeChallenge = await oauth.calculatePKCECodeChallenge(codeVerifier)
  const state = oauth.generateRandomState()
  const callbackServer = startAuthCallbackServer()

  try {
    const authorizeUrl = new URL(authorizationServer.authorization_endpoint)
    authorizeUrl.searchParams.set("response_type", "code")
    authorizeUrl.searchParams.set("client_id", config.clientId)
    authorizeUrl.searchParams.set("redirect_uri", callbackServer.redirectUri)
    authorizeUrl.searchParams.set("scope", config.scope)
    authorizeUrl.searchParams.set("code_challenge", codeChallenge)
    authorizeUrl.searchParams.set("code_challenge_method", "S256")
    authorizeUrl.searchParams.set("prompt", "login")
    authorizeUrl.searchParams.set("state", state)

    openBrowser(authorizeUrl)

    const callback = await callbackServer.waitForCallback()
    const callbackParameters = oauth.validateAuthResponse(authorizationServer, client, callback.callbackUrl, state)
    const tokenResponse = await oauth.authorizationCodeGrantRequest(
      authorizationServer,
      client,
      oauth.None(),
      callbackParameters,
      callbackServer.redirectUri,
      codeVerifier,
    )
    const tokens = await oauth.processAuthorizationCodeResponse(authorizationServer, client, tokenResponse)
    const userInfo = await fetchUserInfo(authorizationServer, client, tokens.access_token)

    return {
      accessToken: tokens.access_token,
      expiresAt: Date.now() + (tokens.expires_in ?? 0) * 1000,
      idToken: tokens.id_token ?? null,
      refreshToken: tokens.refresh_token ?? null,
      scope: tokens.scope ?? null,
      tokenType: tokens.token_type,
      userInfo,
    }
  } finally {
    callbackServer.close()
  }
}

async function fetchUserInfo(
  authorizationServer: oauth.AuthorizationServer,
  client: oauth.Client,
  accessToken: string,
): Promise<AuthUserInfo | null> {
  if (!authorizationServer.userinfo_endpoint) return null

  const response = await oauth.userInfoRequest(authorizationServer, client, accessToken)
  const userInfo = await oauth.processUserInfoResponse(
    authorizationServer,
    client,
    oauth.skipSubjectCheck,
    response,
  )

  return {
    email: userInfo.email ?? null,
    emailVerified: userInfo.email_verified ?? null,
    familyName: userInfo.family_name ?? null,
    givenName: userInfo.given_name ?? null,
    name: userInfo.name ?? null,
    nickname: userInfo.nickname ?? null,
    picture: userInfo.picture ?? null,
    preferredUsername: userInfo.preferred_username ?? null,
    sub: userInfo.sub,
  }
}
