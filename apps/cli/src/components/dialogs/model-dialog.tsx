import { useCallback, useMemo, useState } from "react"
import { modelDefinitions, modelOrder, type ModelDefinition, type ModelId } from "@monocode/ai"
import { useAgent } from "../../providers/agent"
import { useDialog } from "../../providers/dialog"
import { useTheme } from "../../providers/theme"
import { Dialog } from "./dialog"
import { DialogSearchInput } from "./dialog-search-input"
import { SelectableDialogList } from "./selectable-dialog-list"

export function ModelDialog() {
  const [query, setQuery] = useState("")

  return (
    <Dialog title="Models">
      <DialogSearchInput focused value={query} onInput={setQuery} placeholder="Search models..." />
      <box flexDirection="column" gap={1} width="100%">
        <ModelDialogContent query={query} />
      </box>
    </Dialog>
  )
}

function matchesModelQuery(model: ModelDefinition, query: string) {
  return (
    model.id.toLowerCase().includes(query) ||
    model.label.toLowerCase().includes(query) ||
    model.providerLabel.toLowerCase().includes(query) ||
    model.description.toLowerCase().includes(query)
  )
}

function ModelDialogContent({ query }: { query: string }) {
  const { modelId, selectModel } = useAgent()
  const dialog = useDialog()
  const { theme } = useTheme()
  const normalizedQuery = query.trim().toLowerCase()

  const filteredModelIds = useMemo(() => {
    if (!normalizedQuery) return modelOrder
    return modelOrder.filter((id) => matchesModelQuery(modelDefinitions[id], normalizedQuery))
  }, [normalizedQuery])
  const initialSelectedIndex = Math.max(0, filteredModelIds.indexOf(modelId))

  const selectModelAndClose = useCallback(
    (nextModelId: ModelId) => {
      selectModel(nextModelId)
      dialog.actions.closeDialog()
    },
    [dialog.actions, selectModel],
  )

  return (
    <box flexDirection="column" gap={1} width="100%">
      {filteredModelIds.length === 0 ? <text fg={theme.colors.dim}>No models found.</text> : null}
      {filteredModelIds.length > 0 ? (
        <SelectableDialogList
          getItemId={(id) => `model-dialog-item-${id}`}
          getItemKey={(id) => id}
          initialIndex={initialSelectedIndex}
          items={filteredModelIds}
          onConfirm={selectModelAndClose}
          renderItem={(id, selected) => {
            const model = modelDefinitions[id]
            const active = id === modelId

            return (
              <>
                <box flexDirection="column">
                  <text fg={selected ? theme.colors.selectedText : theme.colors.textSoft}>{model.label}</text>
                  <text fg={selected ? theme.colors.text : theme.colors.dim}>{model.id}</text>
                </box>
                <text fg={selected ? theme.colors.text : theme.colors.dim}>{active ? "active" : model.providerLabel}</text>
              </>
            )
          }}
          resetKey={normalizedQuery}
        />
      ) : null}
    </box>
  )
}
