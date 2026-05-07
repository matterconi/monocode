import { hc } from "hono/client"
import type { AppType } from "@matcode/server/rpc"

const serverUrl = "http://localhost:3001"

export const client = hc<AppType>(serverUrl)
