import { useNavigate } from "react-router"
import { HomeAscii } from "../components/home-ascii"
import { HomeTextarea } from "../components/home-textarea"

export function HomeScreen() {
  const navigate = useNavigate()

  function handleSubmit(value: string) {
    if (!value.trim()) return
    navigate("/chat", { state: { prompt: value } })
  }

  return (
    <box flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1} gap={2}>
      <HomeAscii />
      <HomeTextarea onSubmit={handleSubmit} />
    </box>
  )
}
