# UI Context

## Environment

Terminal UI only. No web UI at this stage. All rendering via OpenTUI React (`@opentui/react` + `@opentui/core`).

## Design Language

Dark terminal aesthetic. High-contrast accents on near-black background. Minimal decoration — borders only where they add structure.

## Color Palette

| Role            | Value     | Usage                        |
| --------------- | --------- | ---------------------------- |
| Primary accent  | `#00FFFF` | ASCII font title             |
| Success / URL   | `#00FF88` | Server address, active items |
| Warning / info  | `#FFAA00` | Runtime label                |
| Muted text      | `#888888` | Subtitle, secondary info     |
| Dim hint        | `#555555` | Keyboard hints, footnotes    |

## Typography

All terminal — monospace only. ASCII art titles use `font: "block"` via `<ascii-font>`.

## Layout Patterns

- Root: full-width/height `<box>` with `flexDirection: "column"`, `alignItems: "center"`, `justifyContent: "center"`
- Info panels: `<box>` with `border: true`, `padding: 1`, `flexDirection: "column"`, `gap: 1`
- Titles: `<ascii-font>` component, `font: "block"`

## Components in Use

- `<ascii-font>` — logo/title
- `<box>` — layout containers and bordered panels
- `<text>` — all text content
- `<strong>` — bold inline text within `<text>`
