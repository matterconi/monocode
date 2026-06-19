import * as serverApp from "./src/app.js"

const appModule = serverApp as unknown as { app?: typeof serverApp.app; default?: typeof serverApp.app }
const app = appModule.app ?? appModule.default

if (!app) throw new Error("Unable to resolve Hono app export")

export default app
