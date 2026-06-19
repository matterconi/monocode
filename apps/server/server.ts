import * as serverApp from "./src/app.js"

const appModule = serverApp as unknown as { app?: typeof serverApp.app; default?: typeof serverApp.app }
const resolvedApp = appModule.app ?? appModule.default

if (!resolvedApp) throw new Error("Unable to resolve Hono app export")

const app = resolvedApp

export default app
