import path from "path"

function normalizeWorkspaceInput(input: string) {
  return input.trim().replace(/^@+/, "")
}

function assertInsideWorkspace(resolved: string, workspaceRoot: string, input: string) {
  const relative = path.relative(workspaceRoot, resolved)
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Path escape attempt blocked: ${input}`)
  }
}

export function getWorkspaceRoot() {
  const configuredRoot = process.env.MATCODE_WORKSPACE_ROOT?.trim()
  if (configuredRoot) return path.resolve(configuredRoot)

  return path.resolve(process.cwd())
}

export const BASE_DIR = getWorkspaceRoot()

export function safePath(input: string): string {
  const normalizedInput = normalizeWorkspaceInput(input)
  const resolved = path.isAbsolute(normalizedInput)
    ? path.resolve(normalizedInput)
    : path.resolve(BASE_DIR, normalizedInput)

  assertInsideWorkspace(resolved, BASE_DIR, input)
  return resolved
}
