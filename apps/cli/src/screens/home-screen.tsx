import { useState } from "react"
import { useNavigate } from "react-router"
import { InputHints } from "../components/input/input-meta"
import { InputSurface } from "../components/input/input-surface"
import { client } from "../lib/client"
import { sessionSchema } from "../lib/sessions"
import { useSessions } from "../providers/sessions"
import { useTheme } from "../providers/theme"

export function HomeScreen() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const [submitting, setSubmitting] = useState(false)
  const { cacheSession } = useSessions()

  async function handleSubmit(value: string) {
    if (!value.trim() || submitting) return
    setSubmitting(true)
    try {
      const res = await client.sessions.$post({ json: {} })
      const session = sessionSchema.parse(await res.json())
      cacheSession(session)
      navigate(`/sessions/${session.id}`, { state: { prompt: value } })
    } catch {
      setSubmitting(false)
    }
  }

  return (
    <box flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1} gap={2}>
      <box style={{ flexDirection: "column", alignItems: "center", gap: 1 }}>
        <ascii-font text="MONOCODE" font="block" color={theme.colors.accent} />
      </box>
      <box flexDirection="column" width="100%">
        <InputSurface
          disabled={submitting}
          onSubmit={handleSubmit}
          placeholder="Ask anything... (Enter to send, Ctrl+J for newline)"
          variant="home"
        />
        <InputHints />
      </box>
    </box>
  )
}
