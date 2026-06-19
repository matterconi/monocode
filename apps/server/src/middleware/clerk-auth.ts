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

function getClerkEnvDebug() {
  return {
    hasClerkSecretKey: Boolean(process.env.CLERK_SECRET_KEY?.trim()),
    hasClerkPublishableKey: Boolean(process.env.CLERK_PUBLISHABLE_KEY?.trim()),
  }
}

export function createClerkAuthMiddleware(options: ClerkOptions = {}) {
  const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    ...options,
  })

  return createMiddleware<ClerkAuthEnv>(async (c, next) => {
    const authorizationDebug = getAuthorizationDebug(c.req.header("Authorization"))
    const requestDebug = {
      method: c.req.method,
      path: c.req.path,
      ...authorizationDebug,
      ...getClerkEnvDebug(),
    }
    async function authenticateClerkRequest() {
      return clerkClient.authenticateRequest(c.req.raw, {
        acceptsToken: ["session_token", "oauth_token"],
      })
    }

    let requestState: Awaited<ReturnType<typeof authenticateClerkRequest>>

    try {
      requestState = await authenticateClerkRequest()
    } catch (err) {
      if (process.env.AUTH_DEBUG === "1") {
        console.log("[auth] error", {
          ...requestDebug,
          errorName: err instanceof Error ? err.name : null,
          errorMessage: err instanceof Error ? err.message : String(err),
        })
      }

      return c.json({ error: "Authentication failed" }, 500)
    }

    const auth = requestState.toAuth()

    if (process.env.AUTH_DEBUG === "1") {
      console.log("[auth] request", {
        ...requestDebug,
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
