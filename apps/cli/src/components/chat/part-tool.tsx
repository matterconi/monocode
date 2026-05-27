import { getToolName, type ToolUIPart, type DynamicToolUIPart, type UITools } from "ai"
import { useTheme } from "../../providers/theme"

type AnyToolPart = ToolUIPart<UITools> | DynamicToolUIPart

export function PartTool({ part }: { part: AnyToolPart }) {
  const name = getToolName(part)
  const { theme } = useTheme()

  switch (part.state) {
    case "input-streaming":
      return <text fg={theme.colors.dim} flexShrink={0}>⟳ {name}...</text>
    case "input-available":
      return <text fg={theme.colors.tool} flexShrink={0}>→ {name}</text>
    case "output-available":
      return <text fg={theme.colors.placeholder} flexShrink={0}>✓ {name}</text>
    case "output-error":
      return <text fg={theme.colors.danger} flexShrink={0}>✗ {name}: {part.errorText}</text>
    case "output-denied":
      return <text fg={theme.colors.toolDenied} flexShrink={0}>✗ {name}: denied</text>
    case "approval-requested":
      return <text fg={theme.colors.toolApproval} flexShrink={0}>? {name}: awaiting approval</text>
    case "approval-responded":
      return <text fg={theme.colors.toolApprovalSent} flexShrink={0}>? {name}: approval sent</text>
  }
}
