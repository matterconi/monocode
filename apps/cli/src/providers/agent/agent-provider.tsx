import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"
import {
  canToggleThinking,
  defaultCodingModelId,
  modelDefinitions,
  type ModelDefinition,
  type ModelId,
  type ModelSettingOverrides,
  type ReasoningEffort,
} from "@matcode/ai"

interface AgentContextValue {
  activeReasoningEffort?: ReasoningEffort
  canToggleThinking: boolean
  modelSettings?: ModelSettingOverrides
  modelDefinition: ModelDefinition
  modelId: ModelId
  reasoningEffort?: ReasoningEffort
  reasoningEffortOptions: ReasoningEffort[]
  selectReasoningEffort: (reasoningEffort: ReasoningEffort) => void
  selectModel: (modelId: ModelId) => void
  thinkingEnabled: boolean
  toggleThinking: () => void
}

const AgentContext = createContext<AgentContextValue | null>(null)

function getReasoningEffortSetting(modelId: ModelId) {
  const modelDefinition: ModelDefinition = modelDefinitions[modelId]
  return modelDefinition.settings.reasoningEffort
}

export function AgentProvider({ children }: { children: ReactNode }) {
  const [modelId, setModelId] = useState<ModelId>(defaultCodingModelId)
  const [reasoningEffort, setReasoningEffort] = useState<ReasoningEffort | undefined>(
    getReasoningEffortSetting(defaultCodingModelId)?.default,
  )
  const [thinkingEnabled, setThinkingEnabled] = useState(true)

  const selectModel = useCallback((nextModelId: ModelId) => {
    const setting = getReasoningEffortSetting(nextModelId)
    setReasoningEffort((currentReasoningEffort) => {
      if (!setting) return undefined
      if (currentReasoningEffort && setting.options.includes(currentReasoningEffort)) return currentReasoningEffort
      return setting.default
    })
    setModelId(nextModelId)
  }, [])

  const selectReasoningEffort = useCallback(
    (nextReasoningEffort: ReasoningEffort) => {
      const setting = getReasoningEffortSetting(modelId)
      if (!setting) {
        setReasoningEffort(undefined)
        return
      }

      setReasoningEffort(setting.options.includes(nextReasoningEffort) ? nextReasoningEffort : setting.default)
    },
    [modelId],
  )

  const toggleThinking = useCallback(() => {
    setThinkingEnabled((enabled) => !enabled)
  }, [])

  const value = useMemo(
    () => {
      const toggleableThinking = canToggleThinking(modelId)
      const modelDefinition: ModelDefinition = modelDefinitions[modelId]
      const reasoningEffortSetting = modelDefinition.settings.reasoningEffort
      const resolvedReasoningEffort = reasoningEffort && reasoningEffortSetting?.options.includes(reasoningEffort)
        ? reasoningEffort
        : reasoningEffortSetting?.default
      const disabledReasoningEffort = reasoningEffortSetting?.options.includes("none") ? "none" : undefined
      const outgoingReasoningEffort = thinkingEnabled ? resolvedReasoningEffort : disabledReasoningEffort
      const modelSettings: ModelSettingOverrides | undefined =
        toggleableThinking && outgoingReasoningEffort
        ? { reasoningEffort: outgoingReasoningEffort }
          : undefined

      return {
        activeReasoningEffort: outgoingReasoningEffort,
        canToggleThinking: toggleableThinking,
        modelDefinition,
        modelId,
        modelSettings,
        reasoningEffort: resolvedReasoningEffort,
        reasoningEffortOptions: reasoningEffortSetting?.options ?? [],
        selectReasoningEffort,
        selectModel,
        thinkingEnabled,
        toggleThinking,
      }
    },
    [modelId, reasoningEffort, selectModel, selectReasoningEffort, thinkingEnabled, toggleThinking],
  )

  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>
}

export function useAgent() {
  const context = useContext(AgentContext)
  if (!context) throw new Error("useAgent must be used within AgentProvider")
  return context
}
