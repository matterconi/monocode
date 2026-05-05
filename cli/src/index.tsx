import { createCliRenderer } from "@opentui/core"
import { createRoot } from "@opentui/react"

function App() {
  return (
    <box
      style={{
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        gap: 1,
      }}
    >
      <ascii-font text="MATCODE" font="block" color="#00FFFF" />

      <text fg="#888888">Full-stack monorepo powered by Bun + Hono + OpenTUI</text>

      <box style={{ border: true, padding: 1, flexDirection: "column", gap: 1, marginTop: 1 }}>
        <text fg="#00FF88">
          <strong>  server  </strong> → http://localhost:3001
        </text>
        <text fg="#FFAA00">
          <strong>  runtime </strong> → Bun
        </text>
      </box>

      <text fg="#555555">Press Ctrl+C to exit</text>
    </box>
  )
}

const renderer = await createCliRenderer({ exitOnCtrlC: true })
createRoot(renderer).render(<App />)
