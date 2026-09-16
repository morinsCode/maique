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

## End-of-day worklog

When asked to update `WORKLOG.md` with the day's work:

- Do not edit any source files; update only `WORKLOG.md` unless explicitly asked otherwise.
- Use `git log --since="<date> 00:00" --until="<date> 23:59:59"` to identify commits made that day.
- Inspect each relevant commit with `git show --stat` and `git show` as needed to describe actual behavioral changes, not just commit messages.
- Inspect current uncommitted work with `git diff` and staged work with `git diff --cached`. Include it only when the user confirms it belongs to that day, or when the request is clearly made at the end of the same day.
- Compare the findings against the existing `WORKLOG.md` entry for that date and avoid duplicate items.
- Record the local date. Include commit times when available and useful; do not invent timestamps for uncommitted work.
- Separate completed changes, bug fixes, tests/validation, and known limitations or follow-ups.
- Be precise about what was verified. Do not claim that a feature or test passed unless evidence from Git history, command output, or the user confirms it.
