import { useEffect } from "react"
import { useCompletion } from "@ai-sdk/react"

export function LlmScreen() {
  const { completion, isLoading, error, complete } = useCompletion({
    api: "http://localhost:3001/completion",
  })

  useEffect(() => {
    complete("Scrivi una breve poesia in italiano in stile Giacomo Leopardi, ispirata ai Canti Recanatesi. Usa endecasillabi e settenari, evoca la luna, l'infinito e il dolore dell'esistenza.")
  }, [])

  return (
    <box flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1} gap={2}>
      <text attributes={1}>LLM</text>
      {isLoading && !completion && <text fg="yellow">Connecting…</text>}
      {completion && <text fg="green">{completion}</text>}
      {error && <text fg="red">{error.message}</text>}
    </box>
  )
}
