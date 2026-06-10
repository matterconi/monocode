import { useAgent } from "../../providers/agent"
import { useMode } from "../../providers/mode"
import { useTheme } from "../../providers/theme"

export function InputStatus() {
  const { activeReasoningEffort, canToggleThinking, modelDefinition, thinkingEnabled, toggleThinking } = useAgent()
  const { mode } = useMode()
  const { theme } = useTheme()
  const modeTheme = theme.modes[mode]

  return (
    <box flexDirection="row" gap={2} width="100%">
      <text fg={modeTheme.text}>
        {modeTheme.label} <span fg={theme.colors["text-placeholder"]}>·</span>
      </text>
      <text fg={theme.colors.textSoft}>
        {modelDefinition.label} <span fg={theme.colors.dim}>({modelDefinition.providerLabel})</span>
      </text>
      {canToggleThinking ? (
        <>
          <text fg={thinkingEnabled ? theme.colors.accent : theme.colors.dim} onMouseDown={toggleThinking}>
            thinking {thinkingEnabled ? "on" : "off"}
          </text>
          {activeReasoningEffort ? <text fg={theme.colors.dim}>effort {activeReasoningEffort}</text> : null}
        </>
      ) : null}
    </box>
  )
}

export function InputHints() {
  const { theme } = useTheme()

  return (
    <box paddingX={2} paddingTop={2} flexShrink={0}>
      <text fg={theme.colors.dim}>
        tab <span fg={theme.colors.placeholder}>mode</span>  /new <span fg={theme.colors.placeholder}>chat</span>  /model{" "}
        <span fg={theme.colors.placeholder}>model</span>  /effort <span fg={theme.colors.placeholder}>reasoning</span>  /exit{" "}
        <span fg={theme.colors.placeholder}>quit</span>  enter <span fg={theme.colors.placeholder}>send</span>
      </text>
    </box>
  )
}
