import type { Command } from "./commands"

export interface InputHandle {
  blur: () => void
  clear: () => void
  getInputText: () => string
  getTextCursorOffset: () => number
  replaceTextRange: (start: number, end: number, text: string) => void
}

export interface CommandMenuHandle {
  cancel: () => void
  executeSelected: () => void
  isOpen: () => boolean
}

export interface FileReferenceMenuHandle {
  cancel: () => void
  confirmSelected: () => void
  isOpen: () => boolean
}

export interface ChatStreamHandle {
  isStreaming: () => boolean
  stop: () => void
}

export interface InputInteraction {
  actions: {
    blurInput: () => void
    clearInput: () => void
    registerInputHandle: (handle: InputHandle) => () => void
    replaceTextRange: (start: number, end: number, text: string) => void
    setInputText: (text: string) => void
    setTextCursorOffset: (offset: number) => void
  }
  state: {
    canFocus: boolean
    inputText: string
    isActive: boolean
    textCursorOffset: number
  }
}

export interface CommandMenuInteraction {
  actions: {
    dismissCommandMenu: () => void
    prepareInputForCommand: (command: Command) => void
    registerCommandMenuHandle: (handle: CommandMenuHandle) => () => void
    setCommandMenuOpen: (open: boolean) => void
  }
  state: {
    canOpen: boolean
    commandMenuOpen: boolean
    query: string
  }
}

export interface FileReferenceMenuInteraction {
  actions: {
    registerFileReferenceMenuHandle: (handle: FileReferenceMenuHandle) => () => void
    setFileReferenceMenuOpen: (open: boolean) => void
  }
  state: {
    fileReferenceMenuOpen: boolean
  }
}

export interface ChatStreamInteraction {
  actions: {
    registerChatStreamHandle: (handle: ChatStreamHandle) => () => void
  }
}

export interface InteractionContextValue {
  chatStream: ChatStreamInteraction
  commandMenu: CommandMenuInteraction
  fileReferenceMenu: FileReferenceMenuInteraction
  input: InputInteraction
}
