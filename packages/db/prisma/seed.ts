import { db } from '../src/index.ts'

async function main() {
  const session1 = await db.session.create({
    data: {
      title: 'First chat',
      messages: {
        create: [
          {
            id: 'msg_seed_001',
            role: 'user',
            model: 'anthropic/claude-sonnet-4-6',
            parts: [{ type: 'text', text: 'Hello! What can you do?' }],
          },
          {
            id: 'msg_seed_002',
            role: 'assistant',
            model: 'anthropic/claude-sonnet-4-6',
            parts: [{ type: 'text', text: 'I can help you write code, answer questions, and more.' }],
          },
        ],
      },
    },
  })

  const session2 = await db.session.create({
    data: {
      title: 'Code review',
      messages: {
        create: [
          {
            id: 'msg_seed_003',
            role: 'user',
            model: 'anthropic/claude-sonnet-4-6',
            parts: [{ type: 'text', text: 'Can you review this function?' }],
          },
        ],
      },
    },
  })

  console.log(`Seeded 2 sessions: ${session1.id}, ${session2.id}`)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
