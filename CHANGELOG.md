# Changelog

All notable changes to `correios-logistica-reversa` are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.0.0] - 2026-06-25

### Added

- Zod input validation on all client methods (`CorreiosValidationError`, `VALIDATION_FAILED`)
- Typed cancel/track returns: `CancelOrderPayload`, `CancelPostalObject`, `TrackColetaEntry`
- Convenience fields on `CancelOrderResult`: `numeroPedido`, `statusPedido`, `datahoraCancelamento`
- Result helpers: `isIssueSuccess`, `isCorreiosBusinessError`
- Transport error codes: `TRANSPORT_ERROR_CODES` with WSDL/SOAP classifiers
- Shared SOAP parsers (`src/parsers/shared.ts`)
- `SOAP_OPERATIONS` constants and `SoapTransport` interface export
- SOAP client cache reset on WSDL creation failure (`NodeSoapTransport.reset()`)
- `examples/live-cancel-scenario.ts`

### Fixed

- WSDL fetch Basic Auth header (production 401 without it)
- `sms` flag only on remetente, not destinatario
- `resultado_solicitacao` parsed as array in production responses

### Changed

- `CancelOrderResult.objetoPostal` typed as `CancelOrderPayload` (was `unknown`)
- Expanded `docs/API.md` with validation, error codes, and helpers

## [0.1.0] - 2026-06-25

### Added

- Initial release: `CorreiosLogisticaReversaClient` with issue, track, cancel
- Config from env (`loadConfigFromEnv`)
- Homologation + production WSDL support
- Governance docs (CONSTITUTION, PROCESS, STACK)
- ≥80% test coverage enforced in CI