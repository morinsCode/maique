# MaiQue Copilot Instructions

## Project

MaiQue is a mixed-provider collaborative playlist application.

Current development phase: frontend-only prototype using React, Vite, and TypeScript. Do not add backend, database, rooms, or real-time collaboration unless explicitly requested.

## Coding guidelines

- Use TypeScript and avoid `any`.
- Use React function components and hooks.
- Prefer simple, readable code over premature abstraction.
- Keep components small and focused.
- Keep provider-specific Spotify and YouTube logic separate.
- Use provider-neutral domain types such as `Track` elsewhere.
- Do not install libraries without discussing the need first.
- Do not expand the MVP scope without explicit instruction.
- Preserve the planned `frontend/`, `backend/`, and `shared/` separation.
- When requirements are unclear, ask before making architectural decisions.

## Collaboration style

- Explain suggested changes briefly.
- When correcting code, explain what was wrong.
- Do not generate large implementations unless explicitly requested.
