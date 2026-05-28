export type AuthCallbackResult = {
  callbackUrl: URL
  code: string
  state: string
}

export type AuthCallbackServer = {
  redirectUri: string
  waitForCallback: () => Promise<AuthCallbackResult>
  close: () => void
}

const callbackPath = "/oauth/callback"
const callbackPort = 8976
const callbackTimeoutMs = 5 * 60 * 1000

export function startAuthCallbackServer(): AuthCallbackServer {
  let resolveCallback: (result: AuthCallbackResult) => void
  let rejectCallback: (error: Error) => void

  const callbackPromise = new Promise<AuthCallbackResult>((resolve, reject) => {
    resolveCallback = resolve
    rejectCallback = reject
  })

  const timeout = setTimeout(() => {
    rejectCallback(new Error("Login timed out before the browser callback completed"))
  }, callbackTimeoutMs)

  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: callbackPort,
    fetch(request) {
      const callbackUrl = new URL(request.url)

      if (callbackUrl.pathname !== callbackPath) {
        return new Response("Not found", { status: 404 })
      }

      const error = callbackUrl.searchParams.get("error")
      if (error) {
        const description = callbackUrl.searchParams.get("error_description")
        rejectCallback(new Error(description ? `${error}: ${description}` : error))
        return new Response(createCallbackHtml("Login failed. You can return to Monocode."), {
          headers: { "content-type": "text/html; charset=utf-8" },
        })
      }

      const code = callbackUrl.searchParams.get("code")
      const state = callbackUrl.searchParams.get("state")
      if (!code || !state) {
        rejectCallback(new Error("OAuth callback is missing code or state"))
        return new Response(createCallbackHtml("Login failed. You can return to Monocode."), {
          headers: { "content-type": "text/html; charset=utf-8" },
        })
      }

      resolveCallback({ callbackUrl, code, state })
      return new Response(createCallbackHtml("Login completed. You can return to Monocode."), {
        headers: { "content-type": "text/html; charset=utf-8" },
      })
    },
  })

  return {
    close() {
      clearTimeout(timeout)
      server.stop(true)
    },
    redirectUri: `http://127.0.0.1:${callbackPort}${callbackPath}`,
    waitForCallback() {
      return callbackPromise
    },
  }
}

function createCallbackHtml(message: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>Monocode Login</title></head><body><h1>${message}</h1></body></html>`
}
