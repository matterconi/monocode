import { useNavigate } from "react-router"
import { HomeAscii } from "../components/home-ascii"
import { HomeTextarea } from "../components/home-textarea"
import { ROUTES } from "../routes"

export function HomeScreen() {
  const navigate = useNavigate()

  function handleSubmit(value: string) {
    if (!value.startsWith("/")) return
    const cmd = value.slice(1).trim()
    const match = ROUTES.find((r) => r.path.replace("/", "") === cmd)
    if (match) navigate(match.path)
  }

  return (
    <box flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1} gap={2}>
      <HomeAscii />
      <HomeTextarea onSubmit={handleSubmit} />
    </box>
  )
}
