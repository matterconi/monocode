// fallow-ignore-next-line unused-files -- Vercel discovers API functions by filesystem convention.
import { handle } from "hono/vercel"
import { Hono } from "hono"
import { app } from "../apps/server/src/app"

export const runtime = "nodejs"
export const maxDuration = 60

const api = new Hono().route("/api", app)

export const GET = handle(api)
export const POST = handle(api)
