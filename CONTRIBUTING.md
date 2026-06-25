# Contributing

Thank you for helping improve `correios-logistica-reversa`.

## Governance (read first)

| Doc | Purpose |
|-----|---------|
| [CONSTITUTION.md](./CONSTITUTION.md) | Non-negotiable rules (secrets, SOLID, tests, CI) |
| [PROCESS.md](./PROCESS.md) | SDD phases: spec → plan → tasks → implement → QA |
| [STACK.md](./STACK.md) | Technology stack |
| [docs/spec.md](./docs/spec.md) | Behaviour contract |

## Ground rules

1. **No secrets in code** — use `.env` locally; never commit credentials.
2. **Tests required** — unit tests with fixtures for any behaviour change; TDD when `docs/tasks.md` tags `[TEST]`.
3. **CI must pass** — `npm run typecheck`, `npm run lint`, `npm run test:coverage` (≥ 80%), `npm run build`.
4. **Clean code** — SOLID, DRY, English structural identifiers; Correios SOAP field names on DTOs only.
5. **Scope** — v1 focuses on Logística Reversa SOAP; SIGEP/PLP can be proposed as separate modules.

## Workflow

1. Fork [hbtsmith/correios-logistica-reversa](https://github.com/hbtsmith/correios-logistica-reversa)
2. Create a branch: `feat/short-description`
3. Implement with tests
4. Open a PR with a clear description and link to Correios manual section if relevant

## Live Correios tests

Optional integration tests live under `tests/live/`. Run only when you have contract credentials:

```bash
CORREIOS_LIVE_TEST=1 npm run test:live
```

Cancel any authorizations created during live tests.

## Maintainer

Herbert Smith — [@hbtsmith](https://github.com/hbtsmith)