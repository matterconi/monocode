import { useTheme } from "../../providers/theme"

interface DialogSearchInputProps {
  focused?: boolean
  onInput?: (value: string) => void
  placeholder: string
  value?: string
}

export function DialogSearchInput({ focused = false, onInput, placeholder, value = "" }: DialogSearchInputProps) {
  const { theme } = useTheme()
  const handleInput = (nextValue: string) => {
    onInput?.(nextValue.replace(/\r\n|\r|\n/g, " "))
  }

  return (
    <box
      flexDirection="row"
      gap={1}
      paddingX={1}
      style={{ width: "100%" }}
    >
      <text fg={theme.colors.placeholder}>/</text>
      <input
        focused={focused}
        value={value}
        placeholder={placeholder}
        onInput={handleInput}
        placeholderColor={theme.colors.placeholder}
        textColor={theme.colors.textSoft}
        focusedTextColor={theme.colors.text}
        focusedBackgroundColor={theme.colors.selectedBackground}
        cursorColor={theme.colors.text}
        style={{ width: "100%" }}
      />
    </box>
  )
}
