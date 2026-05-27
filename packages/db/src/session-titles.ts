const adjectives = [
  "brave",
  "cosmic",
  "fantastic",
  "gentle",
  "hidden",
  "magic",
  "quiet",
  "silver",
  "solar",
  "wild",
]

const nouns = [
  "basil",
  "camomille",
  "cedar",
  "comet",
  "ember",
  "lantern",
  "mango",
  "orchid",
  "shampoo",
  "violet",
]

export function createRandomSessionTitle(index: number) {
  const adjective = adjectives[index % adjectives.length]
  const noun = nouns[Math.floor(index / adjectives.length) % nouns.length]
  return `${adjective}-${noun}`
}

export function createSessionTitleFromText(value: string) {
  const firstLine = value.trim().split("\n")[0]?.trim() ?? ""
  const title = firstLine.replace(/\s+/g, " ")
  if (!title) return "New session"
  return title.length > 80 ? `${title.slice(0, 77)}...` : title
}

export function getTextFromMessageParts(parts: unknown) {
  if (!Array.isArray(parts)) return ""

  return parts
    .map((part) => {
      if (typeof part !== "object" || part === null) return ""
      if (!("type" in part) || part.type !== "text") return ""
      return "text" in part && typeof part.text === "string" ? part.text : ""
    })
    .filter(Boolean)
    .join(" ")
}
