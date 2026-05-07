import { createMemoryRouter } from "react-router"
import { RootLayout } from "./root-layout"
import { HomeScreen } from "./screens/home-screen"
import { ChatScreen } from "./screens/chat-screen"

export const router = createMemoryRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomeScreen /> },
      { path: "chat", element: <ChatScreen /> },
    ],
  },
])
