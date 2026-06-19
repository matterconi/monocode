import type { ModeName } from "@monocode-ai/ai"

export interface ModeTheme {
  bar: string
  label: string
  text: string
}

export interface CliTheme {
  colors: {
    accent: string
    backgroundPanel: string
    border: string
    danger: string
    dim: string
    muted: string
    overlayBackground: string
    placeholder: string
    "text-placeholder": string
    selectedBackground: string
    selectedText: string
    success: string
    text: string
    textSoft: string
    tool: string
    toolApproval: string
    toolApprovalSent: string
    toolDenied: string
    warning: string
  }
  modes: Record<ModeName, ModeTheme>
}
