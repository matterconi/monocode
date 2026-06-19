export type AuthConfig = {
  clientId: string
  issuerUrl: URL
  scope: string
}

const defaultScope = "openid email profile offline_access"
const defaultClerkFrontendApi = "https://diverse-caribou-7.clerk.accounts.dev"
const defaultClerkOauthClientId = "DrkIdPXABI01nqZY"

function envOrDefault(name: string, fallback: string) {
  return process.env[name]?.trim() || fallback
}

function normalizeIssuerUrl(frontendApi: string) {
  const withProtocol = frontendApi.startsWith("http://") || frontendApi.startsWith("https://")
    ? frontendApi
    : `https://${frontendApi}`
  const url = new URL(withProtocol)
  url.pathname = url.pathname.replace(/\/?\.well-known\/openid-configuration\/?$/, "").replace(/\/$/, "")
  url.search = ""
  url.hash = ""
  return url
}

export function getAuthConfig(): AuthConfig {
  return {
    clientId: envOrDefault("CLERK_OAUTH_CLIENT_ID", defaultClerkOauthClientId),
    issuerUrl: normalizeIssuerUrl(envOrDefault("CLERK_FRONTEND_API", defaultClerkFrontendApi)),
    scope: defaultScope,
  }
}
