import { createClerkClient, type AuthObject, type ClerkOptions } from "@clerk/backend"
import { createMiddleware } from "hono/factory"

export type ClerkAuth = Extract<AuthObject, { isAuthenticated: true }>

export type ClerkAuthEnv = {
  Variables: {
    auth: ClerkAuth
  }
}

function getAuthorizationDebug(authorizationHeader: string | undefined) {
  if (!authorizationHeader) return { hasAuthorization: false, scheme: null }

  const [scheme] = authorizationHeader.split(" ")
  return { hasAuthorization: true, scheme: scheme || null }
}

export function createClerkAuthMiddleware(options: ClerkOptions = {}) {
  const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    ...options,
  })

  return createMiddleware<ClerkAuthEnv>(async (c, next) => {
    const authorizationDebug = getAuthorizationDebug(c.req.header("Authorization"))
    const requestState = await clerkClient.authenticateRequest(c.req.raw, {
      acceptsToken: ["session_token", "oauth_token"],
    })
    const auth = requestState.toAuth()

    if (process.env.AUTH_DEBUG === "1") {
      console.log("[auth] request", {
        method: c.req.method,
        path: c.req.path,
        ...authorizationDebug,
        requestStatus: requestState.status,
        requestTokenType: requestState.tokenType,
        requestIsAuthenticated: requestState.isAuthenticated,
        authTokenType: auth?.tokenType ?? null,
        authIsAuthenticated: auth?.isAuthenticated ?? false,
        reason: requestState.reason,
        message: requestState.message,
      })
    }

    if (!auth?.isAuthenticated) {
      return c.json({ error: "Unauthorized" }, 401)
    }

    c.set("auth", auth)
    await next()
  })
}

export const clerkAuthMiddleware = createClerkAuthMiddleware()
