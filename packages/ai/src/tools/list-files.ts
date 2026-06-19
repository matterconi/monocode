import { readdir } from "fs/promises"
import { safePath } from "./sandbox.js"
import type { ListFilesInput } from "./schemas"

export async function listFiles({ path }: ListFilesInput) {
  const entries = await readdir(safePath(path), { withFileTypes: true })
  return entries.map((e) => ({ name: e.name, type: e.isDirectory() ? "dir" : "file" }))
}
