import type { ToolCall } from "./calls"
import { listFiles } from "./list-files"
import { readFile } from "./read-file"
import { runCommand } from "./run-command"
import { searchFiles } from "./search-files"
import {
  listFilesSchema,
  readFileSchema,
  runCommandSchema,
  searchFilesSchema,
  writeFileSchema,
} from "./schemas"
import { writeFile } from "./write-file"

export async function executeTool(call: ToolCall) {
  switch (call.toolName) {
    case "read_file":
      return readFile(readFileSchema.parse(call.input))

    case "write_file":
      return writeFile(writeFileSchema.parse(call.input))

    case "list_files":
      return listFiles(listFilesSchema.parse(call.input))

    case "run_command":
      return runCommand(runCommandSchema.parse(call.input))

    case "search_files":
      return searchFiles(searchFilesSchema.parse(call.input))
  }
}
