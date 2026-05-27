import { z } from "zod"

export const sessionSchema = z.object({
  createdAt: z.string(),
  id: z.string(),
  title: z.string().nullable(),
  updatedAt: z.string(),
})

export const sessionsSchema = z.array(sessionSchema)

export type Session = z.infer<typeof sessionSchema>

export function getSessionTitle(session: Session) {
  return session.title ?? session.id.slice(0, 12)
}

export function formatSessionDate(iso: string) {
  const date = new Date(iso)
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
}
