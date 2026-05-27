import type { CliTheme } from "./types/theme"

const themes = {
  dark: {
    colors: {
      accent: "#2563EB",
      backgroundPanel: "#0F172A",
      border: "#1E293B",
      danger: "#EF4444",
      dim: "#475569",
      muted: "#94A3B8",
      overlayBackground: "#020617CC",
      placeholder: "#64748B",
      "text-placeholder": "#64748B",
      selectedBackground: "#1E3A5F",
      selectedText: "#60A5FA",
      success: "#22C55E",
      text: "#F1F5F9",
      textSoft: "#CBD5E1",
      tool: "#64748B",
      toolApproval: "#B45309",
      toolApprovalSent: "#4D7C0F",
      toolDenied: "#92400E",
      warning: "#F59E0B",
    },
    modes: {
      build: {
        bar: "#2563EB",
        label: "Build",
        text: "#60A5FA",
      },
      plan: {
        bar: "#D97706",
        label: "Plan",
        text: "#FBBF24",
      },
    },
  },
  matrix: {
    colors: {
      accent: "#00FF88",
      backgroundPanel: "#07120D",
      border: "#123524",
      danger: "#FF5C5C",
      dim: "#315A45",
      muted: "#5E8F72",
      overlayBackground: "#020604CC",
      placeholder: "#3E775A",
      "text-placeholder": "#3E775A",
      selectedBackground: "#0D2A1A",
      selectedText: "#9AFFC8",
      success: "#00FF88",
      text: "#E8FFF2",
      textSoft: "#B7E8C8",
      tool: "#5F9E78",
      toolApproval: "#B18A2E",
      toolApprovalSent: "#7C8E2C",
      toolDenied: "#B87333",
      warning: "#F5B642",
    },
    modes: {
      build: {
        bar: "#00FF88",
        label: "Build",
        text: "#7CFFB2",
      },
      plan: {
        bar: "#F5B642",
        label: "Plan",
        text: "#FFD166",
      },
    },
  },
  amber: {
    colors: {
      accent: "#F59E0B",
      backgroundPanel: "#1A1208",
      border: "#3A2A14",
      danger: "#EF4444",
      dim: "#6E5632",
      muted: "#A98750",
      overlayBackground: "#0A0602CC",
      placeholder: "#8A6A3A",
      "text-placeholder": "#8A6A3A",
      selectedBackground: "#2B1E0C",
      selectedText: "#FFD28A",
      success: "#86EFAC",
      text: "#FFF7E6",
      textSoft: "#E8CFA3",
      tool: "#B08A51",
      toolApproval: "#D6A43D",
      toolApprovalSent: "#A4A13D",
      toolDenied: "#C27A3D",
      warning: "#FBBF24",
    },
    modes: {
      build: {
        bar: "#65A30D",
        label: "Build",
        text: "#BEF264",
      },
      plan: {
        bar: "#F59E0B",
        label: "Plan",
        text: "#FCD34D",
      },
    },
  },
  ocean: {
    colors: {
      accent: "#22D3EE",
      backgroundPanel: "#071522",
      border: "#14324A",
      danger: "#FB7185",
      dim: "#44647C",
      muted: "#7EA4BA",
      overlayBackground: "#020812CC",
      placeholder: "#5D7F96",
      "text-placeholder": "#5D7F96",
      selectedBackground: "#0B2638",
      selectedText: "#A5F3FC",
      success: "#34D399",
      text: "#EAFBFF",
      textSoft: "#B9DDE8",
      tool: "#6F94A8",
      toolApproval: "#C084FC",
      toolApprovalSent: "#7DD3FC",
      toolDenied: "#F59E0B",
      warning: "#FBBF24",
    },
    modes: {
      build: {
        bar: "#22D3EE",
        label: "Build",
        text: "#67E8F9",
      },
      plan: {
        bar: "#A78BFA",
        label: "Plan",
        text: "#C4B5FD",
      },
    },
  },
} as const satisfies Record<string, CliTheme>

export const themeNames = Object.keys(themes) as ThemeName[]

export type ThemeName = keyof typeof themes
export type Theme = (typeof themes)[ThemeName]

export function getTheme(themeName: ThemeName): Theme {
  return themes[themeName]
}
