# STACK.md — Technology Stack

> Authoritative stack definition for **correios-logistica-reversa**.
> Changes that alter this table require an update here and a note in `docs/plan.md`.

---

## Summary

| Layer | Technology | Version policy |
|-------|------------|----------------|
| **Language** | TypeScript | 5.x, `strict: true` |
| **Runtime** | Node.js | ≥ 20 (CI: 20 + 22) |
| **Module format** | ESM + CJS dual publish | `type: module` + tsup CJS |
| **Build** | tsup | 8.x |
| **Unit tests** | Vitest | 3.x |
| **Lint** | ESLint 9 flat config | + typescript-eslint |
| **SOAP client** | `soap` (npm) | WSDL-driven |
| **Runtime validation** | Zod | Config + input guards |
| **CI** | GitHub Actions | ubuntu-latest matrix |
| **Package manager** | npm | lockfile committed |

---

## Language & compiler

```json
// tsconfig.json highlights
{
  "compilerOptions": {
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ES2022",
    "declaration": true,
    "noUncheckedIndexedAccess": true
  }
}
```

- Source under `src/` only; emitted JS under `dist/` (not hand-edited).
- Public types exported from `src/index.ts` — consumers import from package root.

---

## Build (tsup)

- Entry: `src/index.ts`
- Outputs: `dist/index.js` (ESM), `dist/index.cjs` (CJS), `.d.ts` / `.d.cts`
- `package.json` `exports` map is the contract — keep in sync with tsup config.

```bash
npm run build    # production bundle
npm run dev      # watch mode
```

---

## Testing (Vitest)

| Suite | Path | When |
|-------|------|------|
| Unit | `tests/unit/**/*.test.ts` | Every PR; CI |
| Live | `tests/live/**/*.test.ts` | Local opt-in only |

```bash
npm test                  # unit
npm run test:watch        # dev loop
npm run test:coverage     # coverage report
CORREIOS_LIVE_TEST=1 npm run test:live
```

- Unit tests mock `SoapTransport` — no network in CI.
- Live config: `vitest.live.config.ts` (separate from unit config).

---

## Lint

- Flat config: `eslint.config.js`
- Scope: `src/`, `tests/`
- Zero warnings policy in CI (`npm run lint`)

---

## Runtime dependencies

| Package | Role |
|---------|------|
| `soap` | WSDL client, SOAP call serialization |
| `zod` | `loadConfigFromEnv()` and input validation |

**Policy:** resist new runtime deps. Each addition needs justification in `docs/plan.md`.

---

## External systems

| System | Protocol | Environments |
|--------|----------|--------------|
| Correios Logística Reversa WS | SOAP 1.1 / WSDL | `production`, `homologation` |

WSDL URLs live in `src/constants.ts` (override via `CorreiosConfig.wsdlUrl`).

---

## Tooling scripts

| Script | Purpose |
|--------|---------|
| `typecheck` | `tsc --noEmit` |
| `lint` | ESLint |
| `test` | Vitest unit run |
| `test:live` | Opt-in integration |
| `test:coverage` | Unit + coverage |
| `build` | tsup |
| `prepublishOnly` | Full gate before npm publish |

---

## What we deliberately do not use

| Excluded | Reason |
|----------|--------|
| NestJS / Express | Library, not a server |
| Prisma / database | Stateless SOAP client |
| Monorepo (Turborepo/pnpm) | Single package; npm is enough |
| Jest | Vitest native ESM is simpler here |
| PHP / legacy bridge | Zero PHP runtime boundary |

---

## Upgrade policy

- **Patch** deps: safe anytime; CI must stay green.
- **Minor** TypeScript / Vitest / tsup: upgrade in `chore/*` branch with full gate.
- **Major** `soap` or Node engine: spec + plan update; consider semver major on this package.

---

*Last updated: 2026-06-25*