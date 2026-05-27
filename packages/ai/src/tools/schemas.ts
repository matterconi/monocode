import { z } from "zod"

export const readFileSchema = z.object({
  path: z.string().describe("Workspace-relative path from the project root. An optional @ prefix is accepted."),
})

export const writeFileSchema = z.object({
  path: z.string().describe("Workspace-relative path from the project root. An optional @ prefix is accepted."),
  content: z.string().describe("Full content to write to the file"),
})

export const listFilesSchema = z.object({
  path: z.string().optional().default(".").describe("Directory path relative to the project root. An optional @ prefix is accepted."),
})

export const runCommandSchema = z.object({
  command: z.string().describe("The executable to run"),
  args: z.array(z.string()).optional().default([]).describe("Arguments to pass to the command"),
})

export const searchFilesSchema = z.object({
  pattern: z.string().describe("Regex pattern to search for"),
  path: z.string().optional().default(".").describe("Directory to search in, relative to project root. An optional @ prefix is accepted."),
})

export type ReadFileArgs = z.input<typeof readFileSchema>
export type ReadFileInput = z.output<typeof readFileSchema>

export type WriteFileArgs = z.input<typeof writeFileSchema>
export type WriteFileInput = z.output<typeof writeFileSchema>

export type ListFilesArgs = z.input<typeof listFilesSchema>
export type ListFilesInput = z.output<typeof listFilesSchema>

export type RunCommandArgs = z.input<typeof runCommandSchema>
export type RunCommandInput = z.output<typeof runCommandSchema>

export type SearchFilesArgs = z.input<typeof searchFilesSchema>
export type SearchFilesInput = z.output<typeof searchFilesSchema>
