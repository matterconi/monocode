import { safePath } from "./sandbox"
import type { SearchFilesInput } from "./schemas"

export async function searchFiles({ pattern, path }: SearchFilesInput) {
  const proc = Bun.spawn(["grep", "-r", "-n", "--include=*.ts", "--include=*.tsx", pattern, safePath(path)], {
    stdout: "pipe",
    stderr: "pipe",
  })
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ])
  if (exitCode === 1 && !stderr.trim()) return { matches: "No matches found." }
  if (exitCode !== 0) return { error: stderr }
  return { matches: stdout }
}
