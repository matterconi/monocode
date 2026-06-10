import type { Command } from "../types/commands"

export const commands = [
  { name: "/new", description: "Start a new chat" },
  { name: "/login", description: "Sign in with browser", inputActivationBehavior: "blurAndClear" },
  { name: "/logout", description: "Sign out locally", inputActivationBehavior: "blurAndClear" },
  { name: "/auth", description: "Show auth status" },
  { name: "/exit", description: "Exit Monocode", inputActivationBehavior: "preserve" },
  { name: "/sessions", description: "Open sessions", inputActivationBehavior: "blurAndClear" },
  { name: "/help", description: "Show command help" },
  { name: "/clear", description: "Clear the current view" },
  { name: "/history", description: "Open chat history" },
  { name: "/model", description: "Select a model", inputActivationBehavior: "blurAndClear" },
  { name: "/effort", description: "Select reasoning effort", inputActivationBehavior: "blurAndClear" },
  { name: "/theme", description: "Change theme", inputActivationBehavior: "blurAndClear" },
  { name: "/settings", description: "Open settings" },
] satisfies Command[]
