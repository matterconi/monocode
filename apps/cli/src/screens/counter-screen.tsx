import { useState } from "react"
import { useKeyboard } from "@opentui/react"
import type { KeyEvent } from "@opentui/core"

export function CounterScreen() {
  const [count, setCount] = useState(0)

  useKeyboard((e: KeyEvent) => {
    if (e.name === "up") setCount((c) => c + 1)
    if (e.name === "down") setCount((c) => c - 1)
    if (e.name === "r") setCount(0)
  })

  return (
    <box flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1} gap={1}>
      <text attributes={1}>Counter</text>
      <text fg={count > 0 ? "green" : count < 0 ? "red" : "white"}>{count}</text>
      <text fg="gray">↑ increment  ↓ decrement  [r] reset</text>
    </box>
  )
}
