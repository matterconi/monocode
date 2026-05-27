import { BASE_DIR } from "./sandbox"
import type { RunCommandInput } from "./schemas"

export async function runCommand({ command, args }: RunCommandInput) {
  const proc = Bun.spawn([command, ...args], {
    cwd: BASE_DIR,
    stdout: "pipe",
    stderr: "pipe",
  })
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ])
  return { stdout, stderr, exitCode }
}
