# Monocode

Monocode is a Bun-based monorepo for a context-aware coding workflow.

It combines:

- a terminal-first AI coding CLI built with OpenTUI React
- a Hono API server for sessions, streaming chat, and auth-backed data access
- a Vite landing site with a dedicated `/docs` page
- shared AI and database packages for the runtime and persisted state

## Why Monocode

Most AI tools only see the current prompt. Monocode is built around the idea that good coding assistance needs the full project context: goals, architecture, standards, open issues, session history, and local filesystem access.

## What it includes

- `@monocode-ai/cli` - the published terminal CLI users run locally
- `@monocode/server` - Hono server for sessions and streaming chat
- `@monocode/web` - public landing page and documentation UI
- `@monocode-ai/ai` - shared AI message/model/tool runtime helpers
- `@monocode/db` - Prisma/Postgres persistence layer

## Features

- Terminal UI with keyboard-driven workflow
- Persisted chat sessions and message history
- Build / Plan mode switching
- Session discovery, chat routing, and input lifecycle management
- Local file references with `@` suggestions
- Slash commands like `/new`, `/sessions`, `/model`, `/theme`, and `/login`
- AI tool execution from the CLI against the active workspace
- Vercel deployment for the landing page and API

## Project Structure

```text
Monocode/
├── apps/
│   ├── cli/      # OpenTUI CLI package
│   ├── server/   # Hono API server
│   └── web/      # Vite landing page + docs
├── api/          # Vercel function entrypoints
├── packages/
│   ├── ai/       # shared AI runtime helpers
│   ├── db/       # Prisma/Postgres layer
│   └── shared/   # shared utilities
├── context/      # project context used by the CLI
└── vercel.json   # Vercel build/output config
```

## Requirements

- Bun 1.3.x
- A Postgres database for Prisma
- Groq API key for the server-side model provider
- Clerk keys for authenticated server routes and CLI login

## Quick Start

```bash
bun install
bun run web
```

The landing page runs on `http://localhost:5173`.

### Run the server

```bash
bun run server
```

The server runs on `http://localhost:3001` by default.

### Run the CLI

```bash
bun run cli
```

The CLI uses the current working directory as its workspace boundary.

## Environment Variables

### Server

- `GROQ_API_KEY`
- `DATABASE_URL`
- `CLERK_SECRET_KEY`
- `CLERK_PUBLISHABLE_KEY`
- `PORT` (optional, defaults to `3001`)

### CLI

- `MONOCODE_SERVER_URL` - overrides the API base URL
- `MONOCODE_SERVER_ENV=development` - points the CLI at `http://localhost:3001`
- `MONOCODE_WORKSPACE_ROOT` - overrides the workspace boundary when needed

## Web Docs

The landing page includes a built-in docs experience at `/docs`.

It covers:

- quick start
- context file setup
- core commands
- key concepts

## Scripts

### Root

- `bun run web` - start the landing page in dev mode
- `bun run server` - start the Hono server
- `bun run cli` - start the terminal CLI
- `bun run check` - run Fallow dead-code and duplicate checks

### App packages

- `bun run --cwd apps/web build`
- `bun run --cwd apps/server dev`
- `bun run --cwd apps/cli dev`

## Architecture

- The web app is a Vite SPA.
- The CLI is the primary product surface.
- The server owns HTTP, auth, and persistence boundaries.
- The AI and DB packages are shared runtime layers.
- Vercel serves the web app and the API from the repo root.

## Deployment

Vercel is configured to:

- build `packages/ai`
- build `apps/web`
- serve `apps/web/dist`
- expose the Hono API under `/api/*`

The docs route is handled by the SPA and rewrites in `vercel.json`.

## Status

Monocode is still in active scaffolding, but the core flow is in place:

- CLI home/chat route model
- persisted sessions and messages
- session title generation
- CLI auth session storage
- Vercel-ready landing + API setup

## Contributing

This repo is optimized for small, incremental changes. Keep modifications focused, update the `context/` files when behavior changes, and prefer the current architecture over broad rewrites.

## License

No license has been declared yet.
