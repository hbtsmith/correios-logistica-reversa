# Implementation plan — correios-logistica-reversa

## Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Language | TypeScript 5.x strict | OSS standard, types exported |
| Build | tsup | Dual ESM/CJS + `.d.ts` |
| Test | Vitest | Fast, native ESM |
| Lint | ESLint 9 flat + typescript-eslint | CI gate |
| SOAP | `soap` npm | Mature WSDL client |
| Validation | Zod | Config + input guards |

## Layout

```
src/
  index.ts              # public exports
  client.ts             # CorreiosLogisticaReversaClient
  config.ts             # CorreiosConfig + loadConfigFromEnv
  errors.ts
  constants.ts          # WSDL URLs, defaults
  types/                # public interfaces
  soap/
    transport.ts        # injectable SoapTransport
    create-client.ts
  methods/              # one file per SOAP op
  parsers/              # normalize Correios responses
tests/
  unit/
  fixtures/
```

## Design decisions

1. **Injectable transport** — tests mock SOAP without network.
2. **Payload builders** — pure functions, unit-tested separately from client.
3. **English method names** — public API; SOAP names in JSDoc.
4. **No global state** — one client instance per config.

## CI pipeline

```
lint → typecheck → test → build
```

## Release

- Semver from v0.1.0 during SDD implement phase
- v1.0.0 when: 4 methods + fixtures + README + live spike documented

## Consumer integration (Privato platform)

```json
"correios-logistica-reversa": "^1.0.0"
```

Dev link: `"file:../../lr-correios"` until npm publish.