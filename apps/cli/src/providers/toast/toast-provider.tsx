import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { ToastViewport } from "../../components/toasts/toast-viewport"
import type { ToastItem, ToastOptions, ToastVariant } from "../../types/toasts"
import { ToastContext } from "./toast-context"

const defaultToastDuration = 3500
const maxVisibleToasts = 3

function createToastId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (typeof error === "string" && error.trim()) return error
  return "An unknown error has occurred"
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timeoutRefs = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  const clearToastTimer = useCallback((id: string) => {
    const timeout = timeoutRefs.current.get(id)
    if (!timeout) return
    clearTimeout(timeout)
    timeoutRefs.current.delete(id)
  }, [])

  const dismiss = useCallback(
    (id: string) => {
      clearToastTimer(id)
      setToasts((current) => current.filter((toast) => toast.id !== id))
    },
    [clearToastTimer],
  )

  const clear = useCallback(() => {
    for (const id of timeoutRefs.current.keys()) clearToastTimer(id)
    setToasts([])
  }, [clearToastTimer])

  const show = useCallback(
    (options: ToastOptions) => {
      const toast: ToastItem = {
        duration: options.duration ?? defaultToastDuration,
        id: createToastId(),
        message: options.message,
        title: options.title,
        variant: options.variant ?? "info",
      }

      setToasts((current) => {
        const nextToasts = [...current, toast]
        const droppedToasts = nextToasts.slice(0, Math.max(0, nextToasts.length - maxVisibleToasts))
        for (const droppedToast of droppedToasts) clearToastTimer(droppedToast.id)
        return nextToasts.slice(-maxVisibleToasts)
      })

      const timeout = setTimeout(() => {
        dismiss(toast.id)
      }, toast.duration)
      timeoutRefs.current.set(toast.id, timeout)

      return toast.id
    },
    [clearToastTimer, dismiss],
  )

  const showVariant = useCallback(
    (variant: ToastVariant, message: string, options?: Omit<ToastOptions, "message" | "variant">) => {
      return show({ ...options, message, variant })
    },
    [show],
  )

  const showError = useCallback(
    (error: unknown, options?: Omit<ToastOptions, "message" | "variant">) => {
      return showVariant("error", getErrorMessage(error), options)
    },
    [showVariant],
  )

  const showInfo = useCallback(
    (message: string, options?: Omit<ToastOptions, "message" | "variant">) => showVariant("info", message, options),
    [showVariant],
  )

  const showSuccess = useCallback(
    (message: string, options?: Omit<ToastOptions, "message" | "variant">) => showVariant("success", message, options),
    [showVariant],
  )

  const showWarning = useCallback(
    (message: string, options?: Omit<ToastOptions, "message" | "variant">) => showVariant("warning", message, options),
    [showVariant],
  )

  useEffect(() => {
    return () => {
      for (const timeout of timeoutRefs.current.values()) clearTimeout(timeout)
      timeoutRefs.current.clear()
    }
  }, [])

  const value = useMemo(
    () => ({
      actions: {
        clear,
        dismiss,
        error: showError,
        info: showInfo,
        show,
        success: showSuccess,
        warning: showWarning,
      },
      state: {
        toasts,
      },
    }),
    [clear, dismiss, show, showError, showInfo, showSuccess, showWarning, toasts],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  )
}
