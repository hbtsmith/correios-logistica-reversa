# Tasks — correios-logistica-reversa

Execute in order. Mark `[x]` when done.

## Phase 0 — Bootstrap

- [x] T001 Create repo structure + SDD docs
- [x] T002 `package.json`, tsconfig, vitest, eslint, tsup
- [x] T003 `.gitignore`, `.env.example`, MIT LICENSE
- [x] T004 `git init` + initial commit scaffold

## Phase 1 — Foundation [TEST]

- [x] T005 [TEST] `CorreiosConfig` + `loadConfigFromEnv` unit tests
- [x] T006 Implement config module with Zod
- [x] T007 [TEST] Error classes + payload builders
- [x] T008 Implement `errors.ts`, `constants.ts`, `types/*`

## Phase 2 — SOAP client [TEST]

- [x] T009 [TEST] SoapTransport mock + issueAuthorization parser tests
- [x] T010 Implement `soap/transport.ts` + `create-client.ts`
- [x] T011 Implement `issueAuthorization` method
- [x] T012 Implement `trackByOrderNumber` method
- [x] T013 Implement `trackByDate` method
- [x] T014 Implement `cancelOrder` method
- [x] T015 Wire `CorreiosLogisticaReversaClient`

## Phase 3 — DX & OSS polish

- [x] T016 README + CONTRIBUTING
- [x] T017 GitHub Actions CI
- [x] T017b Governance: CONSTITUTION, PROCESS, STACK, AGENTS, CLAUDE, `.cursor/rules`
- [x] T018 [TEST] Opt-in live integration test script (`test:live`)
- [x] T018b [TEST] Unit coverage ≥ 80% enforced (Vitest thresholds + CI)
- [x] T019 npm publish dry-run + github repo push (manual)

## Phase 4 — v1.0.0 gate

- [ ] T020 Live spike: issue + cancel with `.env` (Herbert)
- [ ] T021 Tag v1.0.0, publish npm
- [ ] T022 Privato platform wires dependency (separate sprint)