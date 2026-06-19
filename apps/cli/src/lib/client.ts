import { hc } from "hono/client"
import type { AppType } from "@monocode/server/rpc"

const productionServerUrl = "https://monocode-server.vercel.app/api"
const developmentServerUrl = "http://localhost:3001"
const serverUrl =
  process.env.MONOCODE_SERVER_URL?.trim() ||
  (process.env.MONOCODE_SERVER_ENV === "development" ? developmentServerUrl : productionServerUrl)

export const client = hc<AppType>(serverUrl)
