export type CommandName =
  | "/new"
  | "/login"
  | "/logout"
  | "/auth"
  | "/exit"
  | "/sessions"
  | "/help"
  | "/clear"
  | "/history"
  | "/model"
  | "/effort"
  | "/theme"
  | "/settings"

export type InputActivationBehavior = "blurAndClear" | "clear" | "preserve"

export interface Command {
  name: CommandName
  description: string
  inputActivationBehavior?: InputActivationBehavior
}
