# Monocode

## Overview

Monocode is a full-stack Bun monorepo with a lightweight Hono HTTP server, a terminal UI CLI built with OpenTUI React, and a Vite React web landing package. The project serves as the foundation for a developer-facing tool, currently in early scaffolding.

## Goals

1. Stable Bun monorepo with clean workspace setup
2. Hono server with structured routing and middleware
3. Terminal UI CLI using OpenTUI React with proper lifecycle management
4. Vite React landing page for product presentation

## Packages

- `@monocode/server` — Hono HTTP server, port 3001
- `@monocode/cli` — OpenTUI React terminal welcome screen
- `@monocode/web` — Vite React landing page, port 5173 in dev

## Current State

Scaffolding complete. Server and CLI install and run, and `apps/web` now serves a Vite React landing page. Chat sessions are persisted in Prisma Postgres, and every persisted message stores its `mode` (`build`/`plan`) so history renders with the original mode context instead of the current global mode. The CLI has a context-driven slash command menu shared by home and chat inputs; `/new` returns to home, home first submit creates a persisted session, `/sessions` opens a cached sessions dialog, and `/exit` closes the renderer. Sessions are prefetched into an in-memory provider, newly created sessions are cached without refetch, old missing titles were backfilled with deterministic adjective-noun titles, and first-message titles are now generated server-side via a small LLM classification call. CLI keyboard layers are now centralized in `InteractionProvider`. Vercel deployment prep is in place: the landing builds from `apps/web`, the Hono API is exposed under `/api`, and the CLI package is prepared for public npm publish after the generated Vercel URL is known. Stale test/check issues remain open.

## Out of Scope (for now)

- Authentication
- Database
- Production hardening beyond the initial Vercel deployment
