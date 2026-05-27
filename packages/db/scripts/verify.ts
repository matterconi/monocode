import { db } from '../src/index.ts'

const sessions = await db.session.findMany({ include: { messages: true } })
console.log(`✅ Connected — ${sessions.length} session(s), ${sessions.flatMap(s => s.messages).length} message(s)`)
await db.$disconnect()
