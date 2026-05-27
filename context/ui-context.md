# UI Context

## Environment

Terminal UI only. No web UI at this stage. All rendering via OpenTUI React (`@opentui/react` + `@opentui/core`).

## Design Language

Dark terminal aesthetic. High-contrast accents on near-black background. Minimal decoration — borders only where they add structure.

## Color Palette

CLI colors are centralized in `apps/cli/src/theme.ts`. Components should read colors through `useTheme()` from `apps/cli/src/providers/theme-provider.tsx`, not hardcode hex values locally.

Theme selection is user-facing through the `/theme` dialog: `ThemeProvider` exposes `themeName`, `themeNames`, `theme`, `previewTheme()`, `clearThemePreview()`, and `selectTheme()`, and `ThemeDialog` filters/selects those names at runtime. Hovering or keyboard-selecting a theme previews it globally; click/Enter confirms it; closing the dialog clears the preview. The default theme is `dark`.

Themes may define mode accents under `theme.modes`. These are still part of the selected theme: `build`/`plan` colors are not separate global themes, but per-mode accents for labels and mode indicators such as the left input bar. Persisted chat messages use their own saved `message.mode` for historical rendering; they must not derive their border color from the currently selected global mode.

| Role            | Value     | Usage                        |
| --------------- | --------- | ---------------------------- |
| Primary accent  | `#00FFFF` | ASCII font title             |
| Success / URL   | `#00FF88` | Server address, active items |
| Warning / info  | `#FFAA00` | Runtime label                |
| Muted text      | `#888888` | Subtitle, secondary info     |
| Dim hint        | `#555555` | Keyboard hints, footnotes    |
| Build mode      | `#00FF88` | Build label and mode bar     |
| Plan mode       | `#FFAA00` | Plan label and mode bar      |

## Typography

All terminal — monospace only. ASCII art titles use `font: "block"` via `<ascii-font>`.

## Layout Patterns

- Root: full-width/height `<box>` with `flexDirection: "column"`, `alignItems: "center"`, `justifyContent: "center"`
- Info panels: `<box>` with `border: true`, `padding: 1`, `flexDirection: "column"`, `gap: 1`
- Titles: `<ascii-font>` component, `font: "block"`
- Chat input/user-message frame: shared `ChatPanel` with custom left border chars from `SplitBorder`; input content and message content remain separate children, not variants with embedded business logic.
- Chat history: `MessageList` is the scroll boundary via OpenTUI `<scrollbox>` with sticky bottom; `Input` and command/input hints stay outside the scroll area.
- Assistant content alignment: reasoning uses `ChatPanel variant="reasoning"` with only a left border and no background; text/tool parts without a border are indented to align with reasoning content. Tool lists get vertical spacing only when following non-reasoning text.
- Inline suggestion menus: `FloatingListMenu` is the shared absolute popup above the input and should read as a continuation of `ChatPanel`, not a separate modal. It has no top border, uses `theme.colors.placeholder` for the side border, caps visible height to 5 rows, supports mouse/trackpad scrolling via `<scrollbox>`, hides the visual scrollbar by matching scrollbar track/thumb to panel background, and keeps mouse hover selection synchronized with keyboard selection.
- Slash command menu: `CommandMenu` uses the shared inline suggestion shell and renders command name plus description.
- File reference menu: typing `@` at the start of a token opens the shared inline suggestion shell. It lists workspace-relative folders and files, inserts the selected reference inline, and does not open for `@` preceded by another character such as emails or quoted text.
- Dialog overlay: fullscreen absolute overlay with semitransparent dark backdrop (`theme.colors.overlayBackground`) so the current chat remains visible underneath. The centered `Dialog` is a borderless composable card with title, top-right clickable `esc`, children, and a `maxWidth` constraint. Reusable primitives such as `DialogSearchInput` and `SelectableDialogList` provide search/list behavior without making the dialog shell product-specific. Dialog search is visually flat by default and only the active input receives selection background. Sessions dialog content uses the shared selectable-list behavior: one selected row, hover selection, keyboard up/down, Enter to open, and scroll-into-view. Sessions are prefetched into memory at app start, so the dialog should show cached rows immediately and only use loading/error copy when no cached data is available. When opened from `/sessions`, focus should move away from the chat textarea and into the dialog search input; the chat input placeholder may remain visible under the overlay, but the chat textarea must not stay focused.
- Keyboard layers: `InteractionProvider` owns global cancel/confirm policy. `Ctrl+C` closes modal, then file reference menu, then command menu, then clears non-empty input, and exits only when no layer consumes it. `Esc` uses the same cancel order without exiting. `Tab` inserts the selected file reference when the `@` menu is open, executes the selected command when the command menu is open, does nothing inside a modal, and toggles mode from an active input otherwise.

## Components in Use

- `<ascii-font>` — logo/title
- `<box>` — layout containers and bordered panels
- `<text>` — all text content
- `<strong>` — bold inline text within `<text>`
- `<input>` — dialog searchbar and modal focus target
