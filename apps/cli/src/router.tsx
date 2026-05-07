import { createMemoryRouter } from "react-router"
import { RootLayout } from "./root-layout"
import { HomeScreen } from "./screens/home-screen"
import { AboutScreen } from "./screens/about-screen"
import { CounterScreen } from "./screens/counter-screen"
import { LlmScreen } from "./screens/llm-screen"
import { NotFoundScreen } from "./screens/not-found-screen"

export const router = createMemoryRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomeScreen /> },
      { path: "about", element: <AboutScreen /> },
      { path: "counter", element: <CounterScreen /> },
      { path: "llm", element: <LlmScreen /> },
      { path: "*", element: <NotFoundScreen /> },
    ],
  },
])
