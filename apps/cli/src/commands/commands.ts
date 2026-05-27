import type { Command } from "../types/commands"

export const commands = [
  { name: "/new", description: "Start a new chat" },
  { name: "/exit", description: "Exit Monocode", inputActivationBehavior: "preserve" },
  { name: "/sessions", description: "Open sessions", inputActivationBehavior: "blurAndClear" },
  { name: "/help", description: "Show command help" },
  { name: "/clear", description: "Clear the current view" },
  { name: "/history", description: "Open chat history" },
  { name: "/model", description: "Select a model" },
  { name: "/theme", description: "Change theme", inputActivationBehavior: "blurAndClear" },
  { name: "/settings", description: "Open settings" },
] satisfies Command[]
