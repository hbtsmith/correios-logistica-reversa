# CONSTITUTION.md — correios-logistica-reversa

> Authoritative governance for all AI-assisted and human development on this repository.
> Load this file first. It supersedes any conflicting instruction elsewhere.
> Keep this file stable — add sections only for project-wide, permanent decisions.

---

## Project

**correios-logistica-reversa** — TypeScript client for the Correios **Logística Reversa** SOAP Web Service.

| Field | Value |
|-------|-------|
| npm | `correios-logistica-reversa` |
| Repository | https://github.com/hbtsmith/correios-logistica-reversa |
| License | MIT |
| Maintainer | Herbert Smith ([@hbtsmith](https://github.com/hbtsmith)) |
| Runtime | Node.js ≥ 20 |

**Scope (v1):** `issueAuthorization`, `trackByOrderNumber`, `trackByDate`, `cancelOrder`.

**Out of scope:** SIGEP labels/PLP, freight calculator, CEP lookup, Correios REST pré-postagem.

Product behaviour: `docs/spec.md` · Stack detail: `STACK.md` · Process: `PROCESS.md`

---

## Mission

Ship a **small, trustworthy, well-tested** OSS library that any Node.js project can depend on for Correios reverse logistics — without copying legacy PHP or hardcoding credentials.

Principles:

- **Correctness over cleverness** — SOAP quirks are documented and tested, not guessed.
- **Injectable boundaries** — transport and config are mockable; no hidden globals.
- **Spec before code** — behaviour is agreed in `docs/` before implementation.
- **Open by default** — issues and PRs welcome; decisions live in git, not chat.

---

## Non-Negotiable Rules

### Secrets — HARD RULE

- **Never commit credentials** — `.env` only; `.env.example` is the template.
- Never log `senha`, contract numbers, or full CNPJ in production code paths.
- Live integration tests are **opt-in** (`CORREIOS_LIVE_TEST=1`); CI never runs them.
- Homologation sandbox values in `.env.example` are documentation only — rotate if exposed.

### English identifiers — HARD RULE

All **structural** code identifiers MUST be English:

- File and folder names under `src/` and `tests/`
- Exports, classes, functions, variables, constants, enums
- Error class names and stable `code` strings on `CorreiosError`
- Git branches, commit messages, PR titles

**Exception — Correios domain DTOs:** public input/output field names that map 1:1 to the SOAP contract (`destinatario`, `coleta`, `numeroPedido`, `codigoServico`, etc.) stay as Correios defines them. TypeScript **property names** mirror upstream; **method names** on the client are English (`issueAuthorization`, not `solicitarPostagemReversa`).

**Wrong:** `function solicitarAutorizacao()` / `const configCorreios = ...`
**Right:** `issueAuthorization()` / `const correiosConfig = ...`

### Public API stability

- Breaking changes require a **major** semver bump.
- Additive fields on input types are non-breaking; removing or renaming exported symbols is breaking.
- Deprecated APIs: mark `@deprecated` in JSDoc for one minor release before removal.

### TypeScript strict mode

- `strict: true` in `tsconfig.json` — no exceptions.
- `exactOptionalPropertyTypes: true` — optional props are not assigned `undefined` explicitly.
- No `any` without a one-line comment explaining why it is unavoidable.
- Prefer `unknown` over `any` at SOAP boundaries; narrow in parsers.

### Git branch discipline

- Every change starts from a branch off `main`: `feat/*`, `fix/*`, `chore/*`, `docs/*`.
- Direct commits on `main` are forbidden during feature work (maintainer may hotfix with review).
- `main` must always pass CI: typecheck, lint, unit tests, build.

### CI gate before merge (non-negotiable)

Never merge while any check is failing, pending, or absent on the PR's latest commit.

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Matrix: Node 20 and 22 (see `.github/workflows/ci.yml`).

---

## Tech Stack

Full detail: **`STACK.md`**. Summary:

| Layer | Technology |
|-------|------------|
| Language | TypeScript 5.x (strict) |
| Runtime | Node.js ≥ 20 |
| Build | tsup (ESM + CJS + declarations) |
| Test | Vitest (unit); opt-in live under `tests/live/` |
| Lint | ESLint 9 flat + typescript-eslint |
| SOAP | `soap` npm |
| Config validation | Zod |

---

## Repository Structure

```
correios-logistica-reversa/
├── src/
│   ├── index.ts           # public barrel
│   ├── client.ts          # CorreiosLogisticaReversaClient
│   ├── config.ts          # CorreiosConfig + loadConfigFromEnv
│   ├── errors.ts
│   ├── constants.ts
│   ├── types/
│   ├── soap/              # transport + WSDL client factory
│   └── parsers/           # normalize SOAP responses
├── tests/
│   ├── unit/
│   └── live/              # opt-in integration
├── docs/
│   ├── brainstorm.md
│   ├── spec.md
│   ├── plan.md
│   └── tasks.md
├── examples/
├── .github/workflows/
├── CONSTITUTION.md        # this file
├── PROCESS.md
├── STACK.md
├── AGENTS.md              # Cursor / AI index
└── CLAUDE.md              # Claude Code index
```

---

## Clean Code Principles

### Functions

- **Max ~30 lines.** Exceed only when splitting harms readability.
- **Max 3 parameters.** More → use an input interface or options object.
- **Early return.** Guard clauses first; avoid deep `else` chains.
- **Single abstraction level.** Do not mix SOAP wire format, parsing, and public API in one function.
- **Descriptive names.** `parseIssueAuthorizationResponse` beats `parseResp`.

### Classes & modules

- **SRP** — one module, one reason to change (`parsers/track.ts` parses; `client.ts` orchestrates).
- **SOLID** — especially **D** (dependency inversion): `SoapTransport` is injectable; client depends on the interface, not `soap` directly in tests.
- **DRY** — shared payload builders and parsers live once; no copy-paste between the four operations.
- **Open/Closed** — extend via new methods or parsers; avoid editing shared transport for one-off hacks.

### Comments

- Explain **why**, not **what**.
- JSDoc on all **public** exports (`@param`, `@returns`, `@throws`).

### Error handling

- Typed hierarchy: `CorreiosError` → `CorreiosConfigError`, `CorreiosValidationError`, `CorreiosResponseError`, `CorreiosTransportError`.
- No silent `try/catch` — rethrow or wrap with context.
- Parsers return discriminated results where Correios uses business error codes in-body (not only SOAP faults).

---

## Unit Tests — Mandatory

> A behaviour change without tests is not done.

### Requirements

- Every public client method: **happy path + main failure path** in unit tests.
- Parsers and config: tested in isolation with fixtures (no network).
- **AAA pattern** — Arrange, Act, Assert.
- Tests live in `tests/unit/**/*.test.ts`.

### Coverage

- Target: **≥ 80%** statements/branches/functions/lines on `src/` (library is small; hold a high bar).
- Run: `npm run test:coverage` before closing a feature slice.
- New code paths without tests block merge.

### Test-first workflow (preferred)

1. Derive cases from `docs/spec.md` or issue acceptance criteria
2. Write test that **fails**
3. Implement minimum change to go green
4. Refactor; keep green

### Live tests

- Under `tests/live/` only.
- Gated by `CORREIOS_LIVE_TEST=1` and local `.env`.
- Authorizations created in live tests must be **cancelled** in the same run when possible.

### Green gate — always

After **every** code change:

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

Zero failing tests. No "fix later."

---

## Development Conventions

| Topic | Rule |
|-------|------|
| Package manager | npm (`package-lock.json` committed) |
| Module system | ESM primary; CJS via tsup dual build |
| Commits | Conventional Commits — see `PROCESS.md` |
| Versioning | Semver; `prepublishOnly` runs full gate |
| Dependencies | Minimal runtime deps (`soap`, `zod`); pin major upgrades consciously |

---

## Git Commit Convention

**Format:** `type(scope): description`

| Type | When |
|------|------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Refactor, no behaviour change |
| `docs` | Documentation only |
| `test` | Add or change tests |
| `style` | Formatting only |
| `perf` | Performance |
| `chore` | Tooling, CI, deps |

Lowercase imperative mood · no trailing period · max 72 chars · scope = area (`client`, `parsers`, `soap`, `config`).

---

## AI Workflow

**Process:** `PROCESS.md` — brainstorm → spec → plan → tasks → implement → QA → close.

**Load order:** `AGENTS.md` or `CLAUDE.md` → `CONSTITUTION.md` → `STACK.md` → active `docs/spec.md` + `docs/tasks.md`.

**Execution hygiene:**

- Re-read files before editing in long sessions
- One task from `tasks.md` at a time; mark `[x]` only when gates are green
- Renames: grep exports, tests, README, examples

---

*Constitution version: 1.0 — 2026-06-25*
*Initial governance port from Bervice SDD model, adapted for OSS SOAP client library.*