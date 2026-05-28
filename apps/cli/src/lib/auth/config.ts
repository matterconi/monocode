export type AuthConfig = {
  clientId: string
  issuerUrl: URL
  scope: string
}

const defaultScope = "openid email profile offline_access"

function requireEnv(name: string) {
  const value = process.env[name]
  if (!value?.trim()) throw new Error(`${name} is required for /login`)
  return value.trim()
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
    clientId: requireEnv("CLERK_OAUTH_CLIENT_ID"),
    issuerUrl: normalizeIssuerUrl(requireEnv("CLERK_FRONTEND_API")),
    scope: defaultScope,
  }
}
