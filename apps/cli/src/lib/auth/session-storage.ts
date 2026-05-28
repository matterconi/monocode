import { chmod, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises"
import { homedir } from "node:os"
import { dirname, join } from "node:path"
import { z } from "zod"
import type { AuthSession } from "../../types/auth"

const authUserInfoSchema = z.object({
  email: z.string().nullable(),
  emailVerified: z.boolean().nullable(),
  familyName: z.string().nullable(),
  givenName: z.string().nullable(),
  name: z.string().nullable(),
  nickname: z.string().nullable(),
  picture: z.string().nullable(),
  preferredUsername: z.string().nullable(),
  sub: z.string(),
})

const authSessionSchema = z.object({
  accessToken: z.string().min(1),
  expiresAt: z.number().finite(),
  idToken: z.string().nullable(),
  refreshToken: z.string().nullable(),
  scope: z.string().nullable(),
  tokenType: z.string().min(1),
  userInfo: authUserInfoSchema.nullable(),
})

function getAuthSessionFilePath() {
  const configHome = process.env.XDG_CONFIG_HOME || join(homedir(), ".config")
  return join(configHome, "monocode", "auth-session.json")
}

async function ensureAuthSessionDirectory(filePath: string) {
  const directory = dirname(filePath)
  await mkdir(directory, { mode: 0o700, recursive: true })
  await chmod(directory, 0o700)
}

export async function loadAuthSession(): Promise<AuthSession | null> {
  const filePath = getAuthSessionFilePath()

  try {
    const content = await readFile(filePath, "utf8")
    return authSessionSchema.parse(JSON.parse(content))
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return null

    await deleteAuthSession()
    return null
  }
}

export async function saveAuthSession(session: AuthSession): Promise<void> {
  const filePath = getAuthSessionFilePath()
  await ensureAuthSessionDirectory(filePath)

  const tempFilePath = `${filePath}.${process.pid}.tmp`
  const payload = `${JSON.stringify(authSessionSchema.parse(session), null, 2)}\n`

  await writeFile(tempFilePath, payload, { mode: 0o600 })
  await chmod(tempFilePath, 0o600)
  await rename(tempFilePath, filePath)
  await chmod(filePath, 0o600)
}

export async function deleteAuthSession(): Promise<void> {
  await rm(getAuthSessionFilePath(), { force: true })
}
