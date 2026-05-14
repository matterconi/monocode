import { readdir, readFile } from "fs/promises"
import path from "path"

export interface FileReferenceItem {
  path: string
  type: "dir" | "file"
}

const ignoredNames = new Set([
  ".git",
  ".next",
  ".turbo",
  "coverage",
  "dist",
  "generated",
  "node_modules",
  "out",
])

const maxFileReferences = 500

async function hasWorkspacePackageJson(directory: string) {
  try {
    const packageJson = JSON.parse(await readFile(path.join(directory, "package.json"), "utf8")) as { workspaces?: unknown }
    return Array.isArray(packageJson.workspaces)
  } catch {
    return false
  }
}

async function getWorkspaceRoot() {
  let directory = process.cwd()

  while (true) {
    if (await hasWorkspacePackageJson(directory)) return directory

    const parent = path.dirname(directory)
    if (parent === directory) return process.cwd()
    directory = parent
  }
}

function compareFileReferences(a: FileReferenceItem, b: FileReferenceItem) {
  if (a.type !== b.type) return a.type === "dir" ? -1 : 1
  return a.path.localeCompare(b.path)
}

export async function listFileReferences() {
  const root = await getWorkspaceRoot()
  const items: FileReferenceItem[] = []

  async function visit(directory: string, relativeDirectory: string) {
    if (items.length >= maxFileReferences) return

    const entries = await readdir(directory, { withFileTypes: true })
    const sortedEntries = entries
      .filter((entry) => !ignoredNames.has(entry.name))
      .sort((a, b) => {
        if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1
        return a.name.localeCompare(b.name)
      })

    for (const entry of sortedEntries) {
      if (items.length >= maxFileReferences) return

      const relativePath = relativeDirectory ? `${relativeDirectory}/${entry.name}` : entry.name

      if (entry.isDirectory()) {
        items.push({ path: `${relativePath}/`, type: "dir" })
        await visit(path.join(directory, entry.name), relativePath)
        continue
      }

      if (entry.isFile()) items.push({ path: relativePath, type: "file" })
    }
  }

  await visit(root, "")
  return items.sort(compareFileReferences)
}
