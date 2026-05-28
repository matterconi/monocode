export type ToastVariant = "success" | "error" | "warning" | "info"

export interface ToastOptions {
  duration?: number
  message: string
  title?: string
  variant?: ToastVariant
}

export interface ToastItem {
  duration: number
  id: string
  message: string
  title?: string
  variant: ToastVariant
}

export interface ToastContextValue {
  actions: {
    clear: () => void
    dismiss: (id: string) => void
    error: (error: unknown, options?: Omit<ToastOptions, "message" | "variant">) => string
    info: (message: string, options?: Omit<ToastOptions, "message" | "variant">) => string
    show: (options: ToastOptions) => string
    success: (message: string, options?: Omit<ToastOptions, "message" | "variant">) => string
    warning: (message: string, options?: Omit<ToastOptions, "message" | "variant">) => string
  }
  state: {
    toasts: ToastItem[]
  }
}
