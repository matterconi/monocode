export function openBrowser(url: URL) {
  const target = url.toString()

  if (process.platform === "darwin") {
    Bun.spawn(["open", target], { stderr: "ignore", stdout: "ignore" })
    return
  }

  if (process.platform === "win32") {
    Bun.spawn(["cmd", "/c", "start", "", target], { stderr: "ignore", stdout: "ignore" })
    return
  }

  Bun.spawn(["xdg-open", target], { stderr: "ignore", stdout: "ignore" })
}
