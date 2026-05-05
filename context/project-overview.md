# Matcode

## Overview

Matcode is a full-stack Bun monorepo with two packages: a lightweight Hono HTTP server and a terminal UI CLI built with OpenTUI React. The project serves as the foundation for a developer-facing tool, currently in early scaffolding.

## Goals

1. Stable Bun monorepo with clean workspace setup
2. Hono server with structured routing and middleware
3. Terminal UI CLI using OpenTUI React with proper lifecycle management

## Packages

- `@matcode/server` — Hono HTTP server, port 3001
- `@matcode/cli` — OpenTUI React terminal welcome screen

## Current State

Scaffolding complete. Both packages install and run. The CLI has lifecycle issues (exits immediately, terminal state not cleaned up on exit). The server has a cosmetic issue with Bun's built-in HMR dev server appearing alongside the app server.

## Out of Scope (for now)

- Authentication
- Database
- Production deployment
