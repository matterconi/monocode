import { hc } from "hono/client"
import type { AppType } from "@monocode/server/rpc"

const productionServerUrl = "https://monocode.vercel.app/api"
const serverUrl = process.env.MONOCODE_SERVER_URL?.trim() || productionServerUrl

export const client = hc<AppType>(serverUrl)
