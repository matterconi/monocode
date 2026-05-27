import type {
  ListFilesArgs,
  ReadFileArgs,
  RunCommandArgs,
  SearchFilesArgs,
  WriteFileArgs,
} from "./schemas"

export type ToolCall =
  | { toolName: "read_file"; input: ReadFileArgs }
  | { toolName: "write_file"; input: WriteFileArgs }
  | { toolName: "list_files"; input: ListFilesArgs }
  | { toolName: "run_command"; input: RunCommandArgs }
  | { toolName: "search_files"; input: SearchFilesArgs }

export type ToolName = ToolCall["toolName"]
