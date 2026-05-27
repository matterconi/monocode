import { createRandomSessionTitle, db } from '../src/index.ts'

const sessions = await db.session.findMany({
  where: { title: null },
  orderBy: { createdAt: 'asc' },
})

for (const [index, session] of sessions.entries()) {
  const title = createRandomSessionTitle(index)
  await db.session.update({
    where: { id: session.id },
    data: { title },
  })
  console.log(`${session.id} -> ${title}`)
}

console.log(`Updated ${sessions.length} session title(s)`)
await db.$disconnect()
