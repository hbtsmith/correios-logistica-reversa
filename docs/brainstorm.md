# Brainstorm — correios-logistica-reversa

**Author:** Herbert Smith  
**Date:** 2026-06-25  
**Harness class:** C (net-new open-source library)

## Problem

Brazilian e-commerce and consignment operations rely on **Correios Logística Reversa** (reverse logistics SOAP WS) so customers can return goods with a prepaid authorization code. The Node.js ecosystem has libraries for freight, CEP, and tracking — but **no maintained TypeScript client** for the reverse-logistics SOAP contract.

## Goal

Ship a **professional, installable npm package** (`correios-logistica-reversa`) that any Node/TypeScript project can use to:

1. Issue reverse-logistics authorization (`solicitarPostagemReversa`)
2. Track by order number (`acompanharPedido`)
3. Track by date (`acompanharPedidoPorData`)
4. Cancel authorization (`cancelarPedido`)

## Non-goals (v1)

- Full SIGEP (labels, PLP, PDF chancelas)
- Freight calculator / CEP lookup
- Correios REST “pré-postagem” API (future community extension)
- Privato business rules (guards, MySQL, WhatsApp)

## Success criteria

- `npm install correios-logistica-reversa` works in any TS/JS project
- Zero hardcoded credentials; `.env` + programmatic config
- CI green on every push (unit tests with fixtures; no live Correios in CI)
- README quick-start under 2 minutes
- MIT license, maintained by Herbert Smith on [github.com/hbtsmith](https://github.com/hbtsmith)

## Reference implementation

Behaviour aligned with production usage in Privato legacy (`php-sigep` LR subset + `RsvLogisticaController`), implemented as **clean-room** from Correios manual — not a line-by-line PHP port.

## Risks

| Risk | Mitigation |
|------|------------|
| SOAP / SSL quirks | Documented env flags; injectable transport for tests |
| Correios response variance | Structured errors + raw payload on `CorreiosResponseError` |
| Secret leakage | `.env` gitignored; CI secret scan; live tests opt-in |