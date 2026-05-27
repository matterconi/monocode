import { z } from "zod"
import { codingTools } from "../tools/definitions"

export const modeSchema = z.enum(["build", "plan"])

export type ModeName = z.infer<typeof modeSchema>

export interface ModeConfig {
  label: string
  systemPromptSuffix?: string
}

export const modes: Record<ModeName, ModeConfig> = {
  build: {
    label: "Build",
  },
  plan: {
    label: "Plan",
    systemPromptSuffix:
      "You are in planning mode. You may only read files and explore the codebase. Never write files or execute commands.",
  },
}

export const modeOrder: ModeName[] = ["build", "plan"]

const planTools = {
  read_file: codingTools.read_file,
  list_files: codingTools.list_files,
  search_files: codingTools.search_files,
}

export function nextMode(current: ModeName): ModeName {
  const idx = modeOrder.indexOf(current)
  return modeOrder[(idx + 1) % modeOrder.length]
}

export function getToolsForMode(mode: ModeName) {
  switch (mode) {
    case "build":
      return codingTools
    case "plan":
      return planTools
  }
}
