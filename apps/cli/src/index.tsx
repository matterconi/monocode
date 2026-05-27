import { createCliRenderer } from "@opentui/core"
import { createRoot } from "@opentui/react"
import { RouterProvider } from "react-router"
import { router } from "./router"
import { ModeProvider } from "./providers/mode"
import { ThemeProvider } from "./providers/theme"

const renderer = await createCliRenderer({ exitOnCtrlC: false })

let rendererDestroyed = false
function destroyRenderer() {
  if (rendererDestroyed) return
  rendererDestroyed = true
  renderer.destroy()
}

process.once("SIGINT", () => {
  destroyRenderer()
  process.exit(0)
})
process.once("SIGTERM", () => {
  destroyRenderer()
  process.exit(0)
})
process.once("exit", destroyRenderer)

createRoot(renderer).render(
  <ThemeProvider>
    <ModeProvider>
      <RouterProvider router={router} />
    </ModeProvider>
  </ThemeProvider>,
)
