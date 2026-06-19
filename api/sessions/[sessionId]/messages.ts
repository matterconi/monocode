// fallow-ignore-next-line unused-files -- Vercel discovers API functions by filesystem convention.
import * as serverApp from "../../../apps/server/src/app.js"

const appModule = serverApp as unknown as { app?: typeof serverApp.app; default?: typeof serverApp.app }
const resolvedApp = appModule.app ?? appModule.default

if (!resolvedApp) throw new Error("Unable to resolve Hono app export")

const app = resolvedApp

export const runtime = "nodejs"
export const maxDuration = 60

function handleRequest(request: Request) {
  const url = new URL(request.url)
  if (url.pathname === "/api") url.pathname = "/"
  else if (url.pathname.startsWith("/api/")) url.pathname = url.pathname.slice(4)

  return app.fetch(new Request(url.toString(), request))
}

export const GET = handleRequest
export const POST = handleRequest
