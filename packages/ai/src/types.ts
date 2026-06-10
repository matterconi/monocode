import type { UIMessage } from "ai"
import type { ModeName } from "./modes"
import type { ModelId } from "./models"
import type {
  ListFilesArgs,
  ReadFileArgs,
  RunCommandArgs,
  SearchFilesArgs,
  WriteFileArgs,
} from "./tools/schemas"
import type { listFiles } from "./tools/list-files"
import type { readFile } from "./tools/read-file"
import type { runCommand } from "./tools/run-command"
import type { searchFiles } from "./tools/search-files"
import type { writeFile } from "./tools/write-file"

export type MessageMetadata = {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

export type CodingUITools = {
  read_file: {
    input: ReadFileArgs
    output: Awaited<ReturnType<typeof readFile>>
  }
  write_file: {
    input: WriteFileArgs
    output: Awaited<ReturnType<typeof writeFile>>
  }
  list_files: {
    input: ListFilesArgs
    output: Awaited<ReturnType<typeof listFiles>>
  }
  run_command: {
    input: RunCommandArgs
    output: Awaited<ReturnType<typeof runCommand>>
  }
  search_files: {
    input: SearchFilesArgs
    output: Awaited<ReturnType<typeof searchFiles>>
  }
}

type UnusedDataParts = Record<string, object>

export type CodingUIMessage = UIMessage<MessageMetadata, UnusedDataParts, CodingUITools> & {
  model?: ModelId
  mode?: ModeName
}
