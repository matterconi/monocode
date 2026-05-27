import { createMemoryRouter, useParams } from "react-router"
import { RootLayout } from "./root-layout"
import { HomeScreen } from "./screens/home-screen"
import { ChatScreen } from "./screens/chat-screen"

function ChatRoute() {
  const { sessionId } = useParams<{ sessionId: string }>()
  return <ChatScreen key={sessionId} />
}

export const router = createMemoryRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomeScreen /> },
      { path: "sessions/:sessionId", element: <ChatRoute /> },
    ],
  },
])
