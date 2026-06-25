# PROCESS.md — Software Development Process

> **For AI agents:** Load at the start of any brainstorm, planning, or implementation session.
> Cross-reference `CONSTITUTION.md` for non-negotiables.
>
> **For humans:** Read once top-to-bottom, then use as a per-phase reference.

---

## Philosophy — Spec-Driven Development (SDD)

The specification is the central artefact. Before code, we define **what** we build, **why** it matters, and **how** we deliver it. Implementation follows `tasks.md` task by task, verifiably.

**Why:**

- Eliminates wrong assumptions — code matches agreed behaviour.
- Makes AI collaboration reliable — unambiguous context in git.
- Creates traceability — decisions are searchable months later.
- Scales contributors — humans and agents read the same artefacts.

---

## Flow Overview

```
BACKLOG ──► BRAINSTORM ──► SPECIFY ──► PLAN ──► TASKS ──► IMPLEMENT ──► QA ──► CLOSE
                │               │          │        │          │            │
            brainstorm.md   spec.md   plan.md  tasks.md   code + tests  qa-summary.md
```

Each arrow is a gate. No phase starts until the previous artefact is approved.

For a library this small, phases may collapse into one folder (`docs/`) rather than `docs/sprints/active/`. The **artefacts and gates** still apply.

---

## Phase 1 — Backlog

**Where:** GitHub Issues or a short list in `docs/brainstorm.md` / maintainer notes.

Raw ideas: new SOAP operations, parser fixes, Node version bumps, docs improvements.

**Exit:** Maintainer picks an item and starts brainstorm.

---

## Phase 2 — Brainstorm

**Artefact:** `docs/brainstorm.md` (or `docs/sprints/planned/<slug>/brainstorm.md` for larger slices)

Surface:

- **What** — user-visible behaviour (npm API, error shapes, config)
- **Why** — pain (legacy PHP, missing npm lib, production bug)
- **Scope** — in / out for this iteration
- **Options** — alternatives considered
- **Risks** — SOAP quirks, credential handling, semver impact

No file-level design here — that is Plan.

**Exit:** Direction agreed; `brainstorm.md` committed.

---

## Phase 3 — Specify

**Artefact:** `docs/spec.md`

Behaviour and acceptance criteria only — no file paths. Each capability should be independently testable.

Check against `CONSTITUTION.md`:

- No secrets in spec examples
- English client method names
- Correios field names only where mirroring SOAP

**Exit:** `spec.md` approved.

---

## Phase 4 — Plan

**Artefact:** `docs/plan.md`

Maps spec to modules, types, parsers, and test strategy. **Constitution Check:**

| Check | Rule |
|-------|------|
| Secrets | Env-only config |
| Tests | Unit coverage for every new public method |
| API | Semver impact documented |
| Dependencies | Justified; prefer stdlib + existing deps |
| Live tests | Opt-in only, never in CI |

**Exit:** `plan.md` approved; no open constitution violations.

---

## Phase 5 — Tasks

**Artefact:** `docs/tasks.md`

Atomic checklist in phase order:

| Phase | Content |
|-------|---------|
| 0 | Setup: deps, tooling, CI |
| 1 | Foundation: types, errors, config + **failing tests** |
| 2…N | One phase per feature slice; checkpoint after each |
| N | Polish: README, coverage, publish gate |

**Task tags:**

| Tag | Meaning |
|-----|---------|
| `[TEST]` | Must run **before** paired implementation |
| `[P]` | Parallel-safe (different files) |
| `[LIVE]` | Requires `CORREIOS_LIVE_TEST=1` + `.env` |

**Exit:** `tasks.md` approved; implementation may start.

---

## Phase 6 — Engineering Review (when warranted)

**Artefact:** `docs/code-review.md` (optional for tiny doc-only changes)

Review `spec.md`, `plan.md`, `tasks.md` for:

- Missing SOAP edge cases
- Constitution violations
- Wrong task order (`[TEST]` after implementation)
- Semver / breaking export changes

**Mandatory** when adding a new public method or changing parser contracts.

**Exit:** Findings resolved or explicitly accepted.

---

## Phase 7 — Implementation (TDD)

Execute tasks in order:

```
[TEST] → confirm FAIL → implement → typecheck + lint + test + build → mark [x]
```

**Rules:**

- Never mark `[x]` while typecheck or lint is red
- Never skip `[TEST]` before implementation
- Update `README.md` when public API changes
- Update `docs/spec.md` if behaviour changes during implementation (spec first, then code)

**Verify after every task:**

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

**Exit:** All tasks `[x]`; gates green.

---

## Phase 8 — QA

**Artefacts:**

- `docs/qa-scenarios.md` — scenarios from spec (before QA)
- `docs/qa-summary.md` — results (after QA)

| Symbol | Meaning |
|--------|---------|
| ✅ | Passed |
| 🔧 | Fixed during QA; re-tested |
| 🟡 | Known gap — documented, deferred |
| ⏭ | Deferred (e.g. no homolog credentials) |
| 🔴 | Blocker |

**Library-specific QA:**

1. Unit suite green on Node 20 and 22
2. `npm run build` — `dist/` types and dual package exports sane
3. Optional: `CORREIOS_LIVE_TEST=1 npm run test:live` on homolog
4. README quick-start matches actual exports
5. `npm pack` dry-run — only intended files included

**Post-QA gate:**

```bash
npm run typecheck && npm run lint && npm test && npm run build
npm run test:coverage   # ≥ 80% on src/
```

**Exit:** `qa-summary.md` committed; zero 🔴 blockers.

---

## Phase 9 — Close

1. Confirm `tasks.md` all `[x]`
2. Confirm `spec.md` acceptance criteria met
3. Update `README.md`, `CHANGELOG.md` (if present), root index (`AGENTS.md` / `CLAUDE.md`)
4. Tag semver if releasing (`v1.0.0`)
5. `npm publish` when ready (`prepublishOnly` runs full gate)
6. PR merged to `main` with CI green on latest commit

**Exit:** Release artefact on npm (if applicable); docs reflect shipped behaviour.

---

## Artefact Map

```
docs/
├── brainstorm.md     # Phase 2 — why
├── spec.md           # Phase 3 — what
├── plan.md           # Phase 4 — how
├── tasks.md          # Phase 5 — checklist
├── code-review.md    # Phase 6 — optional review notes
├── qa-scenarios.md   # Phase 8 — test plan
└── qa-summary.md     # Phase 8 — results
```

**Traceability:** decisions live in these files or `CONSTITUTION.md` — not in chat memory.

---

## Principles

1. **Spec before code.** Always.
2. **Tests before implementation** when `[TEST]` is tagged.
3. **Main is always green.**
4. **Decisions in git, not in chat.**
5. **No skipped gates** — cost is paid later with interest.

---

*Version: 1.0 — 2026-06-25*
*Adapted from Bervice PROCESS.md for single-package OSS library.*