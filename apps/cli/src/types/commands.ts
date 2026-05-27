export type CommandName =
  | "/new"
  | "/exit"
  | "/sessions"
  | "/help"
  | "/clear"
  | "/history"
  | "/model"
  | "/theme"
  | "/settings"

export type InputActivationBehavior = "blurAndClear" | "clear" | "preserve"

export interface Command {
  name: CommandName
  description: string
  inputActivationBehavior?: InputActivationBehavior
}
