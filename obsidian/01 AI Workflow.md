# AI Workflow

Goal: make AI sessions faster, cheaper, and less likely to repeat old mistakes.

## Before Editing

1. Read `CLAUDE.md`.
2. Read `00 AI Index.md`.
3. Identify the task type from the Fast Context Map.
4. Read only the relevant sections in `Project Second Brain.md`.
5. Use `rg` to find real callers before editing shared functions.

## Context Budget Rules

- Do not paste whole files into notes.
- Prefer this format: `path -> function -> purpose -> callers`.
- Keep change log entries one line unless the change creates a new subsystem.
- If a note section grows too large, split it into a focused note and link it from `00 AI Index.md`.

## Task Loop

1. Scope: one sentence.
2. Map: list touched files.
3. Edit: smallest working change.
4. Verify: one command or one manual check.
5. Record: update Obsidian notes.
6. Report: changed files and verification only.

## Retrieval Prompts For AI

```text
Read CLAUDE.md, obsidian/00 AI Index.md, and only the Obsidian sections relevant to: <task>. Then inspect the real code before editing.
```

```text
Before coding, list the exact files and functions this task touches. Use the Obsidian notes only as a map; source code is truth.
```

```text
After the change, update the smallest relevant Obsidian note with what changed, where it came from, what calls it, and how it was verified.
```

## When To Create A Task Card

Create a copy of `02 Task Card Template.md` when:

- work spans both `client/` and `server/`,
- work cannot finish in one session,
- a bug has unclear root cause,
- deployment or auth is involved,
- a change affects response shape, storage, or cache behavior.

Name task cards like:

```text
obsidian/tasks/YYYY-MM-DD short-task-name.md
```

## What Not To Document

- Formatting-only edits.
- One-line typo fixes.
- Exact code blocks that already exist in source.
- Temporary failed attempts unless they explain a real constraint.

## Verification Notes

```text
Verified: <command/manual check> -> <result>
```

```text
Not verified: <reason>
```
