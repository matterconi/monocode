// fallow-ignore-next-line unused-files -- Vercel discovers API functions by filesystem convention.
import { app } from "../apps/server/src/app"

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
