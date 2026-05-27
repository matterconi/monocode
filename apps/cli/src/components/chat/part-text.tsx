import type { TextUIPart } from "ai"
import { MarkdownText } from "./markdown-text"

interface PartTextProps {
  markdown?: boolean
  part: TextUIPart
}

export function PartText({ markdown = false, part }: PartTextProps) {
  if (markdown) return <MarkdownText text={part.text} />

  return <text flexShrink={0}>{part.text}</text>
}
