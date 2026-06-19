import path from "path"
import { getWorkspaceRoot } from "@monocode-ai/ai"
import { readdir } from "fs/promises"

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

function compareFileReferences(a: FileReferenceItem, b: FileReferenceItem) {
  if (a.type !== b.type) return a.type === "dir" ? -1 : 1
  return a.path.localeCompare(b.path)
}

export async function listFileReferences() {
  const root = getWorkspaceRoot()
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
