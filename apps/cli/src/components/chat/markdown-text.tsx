import { SyntaxStyle } from "@opentui/core"
import { useMemo } from "react"
import { useTheme } from "../../providers/theme"

interface MarkdownTextProps {
  text: string
}

export function MarkdownText({ text }: MarkdownTextProps) {
  const { theme } = useTheme()
  const syntaxStyle = useMemo(
    () =>
      SyntaxStyle.fromStyles({
        default: { fg: theme.colors.textSoft },
        "markup.heading.1": { fg: theme.colors.accent, bold: true },
        "markup.heading.2": { fg: theme.colors.text, bold: true },
        "markup.heading.3": { fg: theme.colors.textSoft, bold: true },
        "markup.list": { fg: theme.colors.warning },
        "markup.quote": { fg: theme.colors.dim, italic: true },
        "markup.raw": { fg: theme.colors.success },
        "markup.strong": { fg: theme.colors.text, bold: true },
        "markup.emphasis": { fg: theme.colors.textSoft, italic: true },
      }),
    [theme],
  )

  return (
    <markdown
      content={text}
      conceal={true}
      flexShrink={0}
      syntaxStyle={syntaxStyle}
      tableOptions={{
        borderColor: theme.colors.border,
        cellPadding: 1,
        columnFitter: "balanced",
        style: "columns",
        widthMode: "full",
        wrapMode: "word",
      }}
      width="100%"
    />
  )
}
