import { TextAttributes } from "@opentui/core"
import type { KeyEvent } from "@opentui/core"
import { useKeyboard, useRenderer } from "@opentui/react"
import { Outlet, useLocation, useNavigate } from "react-router"
import { ROUTES } from "./routes"
import { AuthProvider } from "./providers/auth"
import { CommandRuntimeProvider } from "./providers/command-runtime"
import { DialogProvider } from "./providers/dialog"
import { InteractionProvider } from "./providers/interaction"
import { SessionsProvider } from "./providers/sessions"
import { ToastProvider } from "./providers/toast"

export function RootLayout() {
  const renderer = useRenderer()
  const navigate = useNavigate()
  const location = useLocation()

  useKeyboard((e: KeyEvent) => {
    for (const r of ROUTES) {
      if (e.name === r.key) navigate(r.path)
    }
    if (e.name === "q") renderer.destroy()
  })

  return (
    <ToastProvider>
      <AuthProvider>
        <SessionsProvider>
          <DialogProvider>
            <InteractionProvider>
              <CommandRuntimeProvider>
                <box flexDirection="column" flexGrow={1}>
                  <box flexGrow={1} padding={1}>
                    <Outlet />
                  </box>
                  <box
                    flexDirection="row"
                    justifyContent="center"
                    gap={2}
                    paddingY={1}
                    borderStyle="single"
                    border={["top"]}
                  >
                    {ROUTES.map((r) => (
                      <text
                        key={r.path}
                        attributes={
                          location.pathname === r.path
                            ? TextAttributes.BOLD | TextAttributes.UNDERLINE
                            : TextAttributes.NONE
                        }
                      >
                        [{r.key}] {r.label}
                      </text>
                    ))}
                    <text attributes={TextAttributes.DIM}>[q] Quit</text>
                  </box>
                </box>
              </CommandRuntimeProvider>
            </InteractionProvider>
          </DialogProvider>
        </SessionsProvider>
      </AuthProvider>
    </ToastProvider>
  )
}
