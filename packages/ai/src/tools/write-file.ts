import { safePath } from "./sandbox.js"
import type { WriteFileInput } from "./schemas"

export async function writeFile({ path, content }: WriteFileInput) {
  await Bun.write(safePath(path), content)
  return { success: true, path }
}
