# CLAUDE.md — correios-logistica-reversa index

@CONSTITUTION.md
@PROCESS.md
@STACK.md

> **Load order for AI sessions:**
> 1. This file (index + current state)
> 2. [docs/API.md](./docs/API.md) — install, env vars, methods, return shapes
> 3. [llms.txt](./llms.txt) — compact reference
> 4. [docs/spec.md](./docs/spec.md) — behaviour contract
> 5. [docs/tasks.md](./docs/tasks.md) — active checklist

---

## Project

**correios-logistica-reversa** — TypeScript client for Correios Logística Reversa SOAP WS.

- README: [README.md](./README.md)
- Governance: [CONSTITUTION.md](./CONSTITUTION.md)
- Process: [PROCESS.md](./PROCESS.md)
- Stack: [STACK.md](./STACK.md)

---

## Current phase

**v1 bootstrap** (2026-06-25) — core client shipped at `0.1.0`; governance docs added; v1.0.0 publish pending live spike.

### Shipped

- `CorreiosLogisticaReversaClient` — 4 SOAP operations
- `loadConfigFromEnv()` — Zod-validated config
- Typed errors, injectable SOAP transport
- Unit tests (Vitest), CI (Node 20/22), dual ESM/CJS build

### Open

- T018 — live integration test polish
- T020 — live spike (issue + cancel)
- T021 — tag v1.0.0, npm publish
- T022 — Privato platform wire-up (separate repo/sprint)

---

## Quick links

| Resource | Path |
|----------|------|
| Spec | [docs/spec.md](./docs/spec.md) |
| Plan | [docs/plan.md](./docs/plan.md) |
| Tasks | [docs/tasks.md](./docs/tasks.md) |
| Cursor index | [AGENTS.md](./AGENTS.md) |
| Contributing | [CONTRIBUTING.md](./CONTRIBUTING.md) |

---

## Quality gates

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

---

*Last updated: 2026-06-25*