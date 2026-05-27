import { PrismaClient } from '../generated/client/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg(process.env.DATABASE_URL!)
export const db = new PrismaClient({ adapter })

export { createRandomSessionTitle, createSessionTitleFromText, getTextFromMessageParts } from './session-titles'
export type { Session, Message, Role, Prisma } from '../generated/client/client'
