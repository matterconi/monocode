import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"
import {
  defaultCodingModelId,
  modelDefinitions,
  type ModelDefinition,
  type ModelId,
} from "@matcode/ai"

interface AgentContextValue {
  modelDefinition: ModelDefinition
  modelId: ModelId
  selectModel: (modelId: ModelId) => void
}

const AgentContext = createContext<AgentContextValue | null>(null)

export function AgentProvider({ children }: { children: ReactNode }) {
  const [modelId, setModelId] = useState<ModelId>(defaultCodingModelId)

  const selectModel = useCallback((nextModelId: ModelId) => {
    setModelId(nextModelId)
  }, [])

  const value = useMemo(
    () => ({
      modelDefinition: modelDefinitions[modelId],
      modelId,
      selectModel,
    }),
    [modelId, selectModel],
  )

  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>
}

export function useAgent() {
  const context = useContext(AgentContext)
  if (!context) throw new Error("useAgent must be used within AgentProvider")
  return context
}
