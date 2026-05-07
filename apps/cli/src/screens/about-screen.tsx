import { useEffect, useState } from "react"
import { client } from "../lib/client"

type HealthStatus = "checking" | "ok" | "error"

export function AboutScreen() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>("checking")
  const [timestamp, setTimestamp] = useState("loading")

  useEffect(() => {
    let mounted = true

    async function loadServerInfo() {
      try {
        const healthResponse = await client.health.$get()
        const timeResponse = await client.time.$get()

        if (!healthResponse.ok || !timeResponse.ok) {
          if (mounted) setHealthStatus("error")
          return
        }

        const healthBody = await healthResponse.json()
        const timeBody = await timeResponse.json()

        if (!mounted) return

        const serverTimestamp: string = timeBody.timestamp
        setHealthStatus(healthBody.status)
        setTimestamp(serverTimestamp)
      } catch {
        if (mounted) setHealthStatus("error")
      }
    }

    loadServerInfo()

    return () => {
      mounted = false
    }
  }, [])

  const healthColor = healthStatus === "ok" ? "green" : healthStatus === "error" ? "red" : "yellow"

  return (
    <box flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1} gap={1}>
      <text attributes={1}>About Matcode</text>
      <text fg={healthColor}>RPC /health: {healthStatus}</text>
      <text fg="cyan">RPC /time: {timestamp}</text>
      <text fg="green">✓ React Router is working</text>
      <text fg="cyan">You navigated to /about — press [1] to go back</text>
    </box>
  )
}
