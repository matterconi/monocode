import { createUIMessageStream, processChatResponse, DefaultChatTransport } from "ai"
import type { UIMessage } from "ai"
import { client } from "../lib/client"

const messages: UIMessage[] = [
  {
    id: "user-1",
    role: "user",
    parts: [{ type: "text", text: "Ciao! Dimmi una cosa interessante su Bun runtime." }],
  },
]

const api = client.chat.$url().toString()
console.log(`POST ${api}\n`)

const response = await fetch(api, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ messages }),
})

if (!response.ok || !response.body) {
  console.error(`HTTP ${response.status}`, await response.text())
  process.exit(1)
}

const allMessages: UIMessage[] = [...messages]

await processChatResponse({
  response,
  update({ message }) {
    allMessages[allMessages.length - 1] = message
  },
  onFinish({ message }) {
    allMessages[allMessages.length - 1] = message
  },
  generateId: () => `assistant-${Date.now()}`,
  getCurrentDate: () => new Date(),
  lastMessage: {
    id: `assistant-${Date.now()}`,
    role: "assistant",
    parts: [],
  },
})

console.log("=== MESSAGES ===\n")
for (const msg of allMessages) {
  console.log(`[${msg.role}]`)
  for (const part of msg.parts) {
    switch (part.type) {
      case "text":
        console.log(`  text: ${part.text}`)
        break
      case "reasoning":
        console.log(`  reasoning (${part.state}): ${part.text.slice(0, 120)}...`)
        break
      default:
        if (part.type.startsWith("tool-")) {
          console.log(`  tool ${part.type.slice(5)} [${(part as any).state}]`)
        } else {
          console.log(`  part: ${part.type}`)
        }
    }
  }
  console.log()
}
