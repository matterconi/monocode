import { tool } from "ai"
import {
  listFilesSchema,
  readFileSchema,
  runCommandSchema,
  searchFilesSchema,
  writeFileSchema,
} from "./schemas"

export const codingTools = {
  read_file: tool({
    description: "Read the contents of a file. Path is relative to the project root.",
    inputSchema: readFileSchema,
  }),
  write_file: tool({
    description: "Write content to a file, creating it if it doesn't exist. Path is relative to the project root.",
    inputSchema: writeFileSchema,
  }),
  list_files: tool({
    description: "List files and directories at a path relative to the project root.",
    inputSchema: listFilesSchema,
  }),
  run_command: tool({
    description: "Execute a shell command in the project root directory.",
    inputSchema: runCommandSchema,
  }),
  search_files: tool({
    description: "Search for a regex pattern recursively in files. Returns matching lines with line numbers.",
    inputSchema: searchFilesSchema,
  }),
}
