import { safePath } from "./sandbox.js"
import type { ReadFileInput } from "./schemas"

export async function readFile({ path }: ReadFileInput) {
  const file = Bun.file(safePath(path))
  if (!(await file.exists())) return { error: `File not found: ${path}` }
  return { content: await file.text() }
}
