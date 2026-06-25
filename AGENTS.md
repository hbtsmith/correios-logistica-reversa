# AGENTS.md — correios-logistica-reversa (Cursor)

> Load before implementation work in this repository.

1. [docs/API.md](./docs/API.md) — **integration reference** (install, env, methods, returns)
2. [llms.txt](./llms.txt) — compact machine-readable summary
3. [CONSTITUTION.md](./CONSTITUTION.md) — non-negotiables
4. [STACK.md](./STACK.md) — technology choices
5. [PROCESS.md](./PROCESS.md) — SDD phases and gates
6. Active artefacts: [docs/spec.md](./docs/spec.md) + [docs/tasks.md](./docs/tasks.md)

---

## Project

TypeScript **npm library** — Correios Logística Reversa SOAP client.

| Field | Value |
|-------|-------|
| Package | `correios-logistica-reversa` |
| Repo | https://github.com/hbtsmith/correios-logistica-reversa |
| Maintainer | Herbert Smith |

**Not** the Privato platform monorepo. Integration with Privato is a separate sprint (`docs/tasks.md` T022).

---

## Quality gates (mandatory)

Before marking any task `[x]`:

```bash
npm run typecheck
npm run lint
npm run test:coverage   # ≥ 80% all metrics — enforced in CI
npm run build
```

Type errors = failing test. Do not mark done while red.

---

## Implementation rules (short)

- Follow `docs/tasks.md` order; TDD when `[TEST]` present
- No secrets in source; `loadConfigFromEnv()` + `.env` only
- English method names; Correios SOAP field names on DTOs only
- Injectable `SoapTransport` for tests
- Grep new code for hardcoded passwords / production credentials — must be zero

---

## Current state

**Phase:** v1 bootstrap — implementation complete; governance + v1.0.0 gate in progress.

**Open tasks:** see [docs/tasks.md](./docs/tasks.md) (T018 live test polish, T020–T021 publish).

---

## Links

| Doc | Path |
|-----|------|
| Constitution | [CONSTITUTION.md](./CONSTITUTION.md) |
| Process | [PROCESS.md](./PROCESS.md) |
| Stack | [STACK.md](./STACK.md) |
| **API / integration** | [docs/API.md](./docs/API.md) |
| AI summary | [llms.txt](./llms.txt) |
| Spec | [docs/spec.md](./docs/spec.md) |
| Plan | [docs/plan.md](./docs/plan.md) |
| Tasks | [docs/tasks.md](./docs/tasks.md) |
| Brainstorm | [docs/brainstorm.md](./docs/brainstorm.md) |

---

*Keep in sync with CLAUDE.md when phase or version changes.*