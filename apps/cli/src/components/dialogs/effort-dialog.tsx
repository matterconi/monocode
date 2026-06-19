import { useCallback, useMemo, useState } from "react"
import type { ReasoningEffort } from "@monocode-ai/ai"
import { useAgent } from "../../providers/agent"
import { useDialog } from "../../providers/dialog"
import { useTheme } from "../../providers/theme"
import { Dialog } from "./dialog"
import { DialogSearchInput } from "./dialog-search-input"
import { SelectableDialogList } from "./selectable-dialog-list"

function getEffortDescription(reasoningEffort: ReasoningEffort) {
  switch (reasoningEffort) {
    case "none":
      return "Disable reasoning"
    case "default":
      return "Provider default"
    case "low":
      return "Low reasoning"
    case "medium":
      return "Medium reasoning"
    case "high":
      return "High reasoning"
  }
}

export function EffortDialog() {
  const [query, setQuery] = useState("")

  return (
    <Dialog title="Reasoning Effort">
      <DialogSearchInput focused value={query} onInput={setQuery} placeholder="Search effort..." />
      <box flexDirection="column" gap={1} width="100%">
        <EffortDialogContent query={query} />
      </box>
    </Dialog>
  )
}

function EffortDialogContent({ query }: { query: string }) {
  const { modelDefinition, reasoningEffort, reasoningEffortOptions, selectReasoningEffort } = useAgent()
  const dialog = useDialog()
  const { theme } = useTheme()
  const normalizedQuery = query.trim().toLowerCase()

  const filteredEfforts = useMemo(() => {
    if (!normalizedQuery) return reasoningEffortOptions
    return reasoningEffortOptions.filter((effort) => {
      return effort.includes(normalizedQuery) || getEffortDescription(effort).toLowerCase().includes(normalizedQuery)
    })
  }, [normalizedQuery, reasoningEffortOptions])

  const initialSelectedIndex = Math.max(0, filteredEfforts.indexOf(reasoningEffort ?? filteredEfforts[0]))

  const selectEffortAndClose = useCallback(
    (nextReasoningEffort: ReasoningEffort) => {
      selectReasoningEffort(nextReasoningEffort)
      dialog.actions.closeDialog()
    },
    [dialog.actions, selectReasoningEffort],
  )

  return (
    <box flexDirection="column" gap={1} width="100%">
      {reasoningEffortOptions.length === 0 ? (
        <text fg={theme.colors.dim}>{modelDefinition.label} does not support configurable reasoning effort.</text>
      ) : null}
      {reasoningEffortOptions.length > 0 && filteredEfforts.length === 0 ? <text fg={theme.colors.dim}>No efforts found.</text> : null}
      {filteredEfforts.length > 0 ? (
        <SelectableDialogList
          getItemId={(effort) => `effort-dialog-item-${effort}`}
          getItemKey={(effort) => effort}
          initialIndex={initialSelectedIndex}
          items={filteredEfforts}
          onConfirm={selectEffortAndClose}
          renderItem={(effort, selected) => {
            const active = effort === reasoningEffort

            return (
              <>
                <box flexDirection="column">
                  <text fg={selected ? theme.colors.selectedText : theme.colors.textSoft}>{effort}</text>
                  <text fg={selected ? theme.colors.text : theme.colors.dim}>{getEffortDescription(effort)}</text>
                </box>
                <text fg={selected ? theme.colors.text : theme.colors.dim}>{active ? "active" : "select"}</text>
              </>
            )
          }}
          resetKey={normalizedQuery}
        />
      ) : null}
    </box>
  )
}
