import type { KeyEvent, TextareaRenderable } from "@opentui/core"
import { useCallback, useRef } from "react"

interface HomeTextareaProps {
  onSubmit?: (value: string) => void
  disabled?: boolean
}

export function HomeTextarea({ onSubmit, disabled = false }: HomeTextareaProps) {
  const instanceRef = useRef<TextareaRenderable>(null)

  const handleKeyDown = useCallback(
    (event: KeyEvent) => {
      const isReturn = event.name === "return" || event.name === "enter"
      const isLinefeed = event.name === "linefeed"
      const hasModifier = event.shift || event.ctrl || event.meta || event.option || event.super || event.hyper
      const isNewlineShortcut = (isReturn && hasModifier) || isLinefeed || (event.name === "j" && event.ctrl)

      if (isReturn && !hasModifier) {
        event.preventDefault()
        const value = instanceRef.current?.plainText ?? ""
        onSubmit?.(value)
        return
      }

      if (isNewlineShortcut) {
        event.preventDefault()
        instanceRef.current?.insertText("\n")
      }
    },
    [onSubmit],
  )

  return (
    <box style={{ width: "100%", alignItems: "center" }}>
      <box style={{ width: "100%" }}>
        <box style={{ border: ["left"], borderColor: "#00FFFF", width: "100%" }}>
          <box
            style={{
              position: "relative",
              justifyContent: "center",
              backgroundColor: "#1A1A24",
              width: "100%",
            }}
            paddingX={2}
            paddingY={1}
            gap={1}
          >
            <textarea
              ref={instanceRef}
              placeholder="Ask anything... (Enter to send, Ctrl+J for newline)"
              focused={!disabled}
              textColor="#CCCCCC"
              focusedTextColor="#FFFFFF"
              cursorColor="#00FFFF"
              placeholderColor="#444444"
              wrapMode="word"
              onKeyDown={handleKeyDown}
            />
          </box>
        </box>
      </box>
    </box>
  )
}
