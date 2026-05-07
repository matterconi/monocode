export function HomeAscii() {
  return (
    <box style={{ flexDirection: "column", alignItems: "center", gap: 1 }}>
      <ascii-font text="MATCODE" font="block" color="#00FFFF" />
      <text fg="#555555">Full-stack monorepo powered by Bun + Hono + OpenTUI</text>
    </box>
  )
}
