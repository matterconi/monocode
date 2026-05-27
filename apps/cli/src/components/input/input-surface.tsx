import { Input, type InputProps } from "./input"
import { CommandMenu } from "../menus/command-menu"
import { FileReferenceMenu } from "../menus/file-reference-menu"

export function InputSurface(props: InputProps) {
  // Keep inline menus anchored to the input without making Input render menu behavior.
  return (
    <box style={{ width: "100%", position: "relative" }}>
      <Input {...props} />
      <FileReferenceMenu />
      <CommandMenu />
    </box>
  )
}
