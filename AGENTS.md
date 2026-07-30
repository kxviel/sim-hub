# Project instructions

This is a Tauri desktop application with a Vite, React and TypeScript
frontend and a Rust backend.

## General approach

- Preserve existing behaviour unless fixing a confirmed bug.
- Follow existing naming, folder structure and coding patterns.
- Prefer small, focused changes.
- Do not redesign architecture without an explicit request.
- Do not add abstractions, helpers, hooks or dependencies unless they
  provide a clear practical benefit.
- Do not refactor unrelated code.
- When uncertain whether a refactor is beneficial, leave the code unchanged.
- Read nearby files before introducing a new pattern.

## Frontend

- This project uses Vite, not Next.js.
- Ignore Next.js, SSR, React Server Component and server-action guidance.
- Prefer existing components and utilities over introducing alternatives.
- Maintain existing TypeScript strictness and inferred types.
- Do not manually edit generated files such as routeTree.gen.ts.
- Avoid memoization unless there is a demonstrated rendering problem.

## TanStack Router

- Follow the existing file-based routing structure.
- Never manually edit generated route files such as `routeTree.gen.ts`.
- Preserve existing route, loader, search-parameter and navigation patterns.
- Do not restructure routing unless explicitly requested.

## Tauri and Rust

- Treat the frontend as an untrusted boundary.
- Validate inputs received by Tauri commands.
- Grant only the Tauri capabilities and plugin permissions actually required.
- Do not expose secrets or sensitive filesystem access to the frontend.
- Avoid unwrap and expect in user-reachable production paths.
- Do not add Rust crates unless existing dependencies cannot reasonably solve
  the problem.

## Verification

After relevant changes, run the available project checks:

- frontend formatter and linter
- TypeScript type checking
- frontend tests
- Vite production build
- cargo fmt --check
- cargo clippy
- cargo test

Run only checks relevant to the files changed, unless a full audit is requested.
