# Specification — correios-logistica-reversa v1

**Status:** Approved for implementation  
**Harness:** C  
**Maintainer:** Herbert Smith

## Package identity

| Field | Value |
|-------|-------|
| npm name | `correios-logistica-reversa` |
| Repository | `https://github.com/hbtsmith/correios-logistica-reversa` |
| License | MIT |
| Runtime | Node.js ≥ 20 |

## Public API

### Entry

```ts
import {
  CorreiosLogisticaReversaClient,
  loadConfigFromEnv,
  type CorreiosConfig,
} from 'correios-logistica-reversa';
```

### Client methods

| Method | SOAP operation | Purpose |
|--------|----------------|---------|
| `issueAuthorization(input)` | `solicitarPostagemReversa` | Create LR authorization |
| `trackByOrderNumber(input)` | `acompanharPedido` | Track single order |
| `trackByDate(input)` | `acompanharPedidoPorData` | Bulk sync by date |
| `cancelOrder(input)` | `cancelarPedido` | Cancel authorization |

### Configuration

**Programmatic** (`CorreiosConfig`):

- `environment`: `'production' | 'homologation'`
- `usuario`, `senha`
- `codAdministrativo`, `cartaoPostagem`, `numeroContrato`, `cnpjEmpresa`
- `codigoServico` (PAC `04677` or SEDEX `04170` — caller chooses)
- Optional: `wsdlUrl`, `timeoutMs`, `rejectUnauthorized`

**From environment** (`loadConfigFromEnv()`):

All fields via `CORREIOS_*` variables (see `.env.example`). Missing required vars throw `CorreiosConfigError`.

### Domain types

- `Party` — remetente/destinatário (nome, endereço, CEP, UF, contato)
- `CollectionRequest` — tipo `A`, ag (validity days), valorDeclarado optional
- `IssueAuthorizationInput` — destinatario + coletas (remetente inside coleta)
- `TrackByOrderNumberInput` — numeroPedido, tipoBusca default `H`, tipoSolicitacao default `A`
- `TrackByDateInput` — data `YYYY-MM-DD`, tipoSolicitacao default `A`
- `CancelOrderInput` — numeroPedido, tipo default `A`

### Errors

| Class | When |
|-------|------|
| `CorreiosConfigError` | Invalid/missing config |
| `CorreiosValidationError` | Input validation failed |
| `CorreiosResponseError` | Correios returned business/soap error |
| `CorreiosTransportError` | Network/timeout |

All extend `CorreiosError` with optional `code` and `raw`.

### Responses

Parsed as plain objects (not class instances). Success shapes mirror SOAP `resultado_solicitacao` / `coleta` / `objetoPostal` with TypeScript interfaces documented in README.

## Security requirements

- **No secrets in source code or git**
- `.env` in `.gitignore`
- Integration tests require `CORREIOS_LIVE_TEST=1` and local `.env`
- Homologation sandbox credentials from Correios manual may appear in `.env.example` as documentation only

## Testing requirements

- Unit: config loader, payload builders, response parsers (fixtures)
- Integration (opt-in): one issue + cancel cycle against real API
- CI: unit only; Node 20 + 22 matrix

## Out of scope v1

SIGEP etiquetas, PLP, PDF, calcPrecoPrazo, rastreio SRO.