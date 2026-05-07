import { useEffect } from "react"
import { useLocation } from "react-router"
import { useCompletion } from "@ai-sdk/react"
import { z } from "zod"
import { client } from "../lib/client"

const ChatState = z.object({ prompt: z.string() })

export function ChatScreen() {
  const { state } = useLocation()
  const { prompt } = ChatState.parse(state)

  const { completion, complete, isLoading } = useCompletion({
    api: client.completion.$url().toString(),
  })

  useEffect(() => {
    complete(prompt)
  }, [])

  return (
    <box flexDirection="column" flexGrow={1} padding={2}>
      <text>{isLoading && !completion ? "..." : completion}</text>
    </box>
  )
}
