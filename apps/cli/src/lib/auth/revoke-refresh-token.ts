import * as oauth from "oauth4webapi"
import type { AuthSession } from "../../types/auth"
import { getAuthConfig } from "./config"

type RevokeRefreshTokenInput = AuthSession | string | null | undefined

function getRefreshToken(input: RevokeRefreshTokenInput) {
  if (typeof input === "string") return input
  return input?.refreshToken ?? null
}

export async function revokeRefreshToken(input: RevokeRefreshTokenInput): Promise<void> {
  const refreshToken = getRefreshToken(input)
  if (!refreshToken) return

  const config = getAuthConfig()
  const discoveryResponse = await oauth.discoveryRequest(config.issuerUrl)
  const authorizationServer = await oauth.processDiscoveryResponse(config.issuerUrl, discoveryResponse)
  const client: oauth.Client = { client_id: config.clientId }

  if (!authorizationServer.revocation_endpoint) throw new Error("Revocation endpoint was not discovered")

  const response = await oauth.revocationRequest(authorizationServer, client, oauth.None(), refreshToken, {
    additionalParameters: new URLSearchParams({ token_type_hint: "refresh_token" }),
  })

  await oauth.processRevocationResponse(response)
}
