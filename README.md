# correios-logistica-reversa

TypeScript client for the **Correios Logística Reversa** SOAP Web Service.

Emit reverse-logistics authorizations, track postings, and cancel orders from any Node.js 20+ application — with full TypeScript types and no PHP dependency.

**Maintainer:** [Herbert Smith](https://github.com/hbtsmith) · **License:** MIT

---

## Documentation map

| Audience | Document |
|----------|----------|
| **Integrators (humans)** | This README → [docs/API.md](./docs/API.md) |
| **AI agents / Cursor** | [llms.txt](./llms.txt) → [docs/API.md](./docs/API.md) → [AGENTS.md](./AGENTS.md) |
| **Contributors** | [CONTRIBUTING.md](./CONTRIBUTING.md) · [CONSTITUTION.md](./CONSTITUTION.md) |

---

## Install

```bash
npm install correios-logistica-reversa
```

**Requirements:** Node.js ≥ 20. Works with ESM (`import`) and CommonJS (`require`). Types ship in `dist/index.d.ts`.

The library **does not** load `.env` files — your application must set `process.env` (or pass config programmatically).

---

## Configuration

### Required environment variables

Copy [`.env.example`](./.env.example) as a reference. In production, inject these via your platform (Docker, Kubernetes secrets, NestJS `ConfigModule`, etc.).

| Variable | Description |
|----------|-------------|
| `CORREIOS_ENV` | `production` or `homologation` |
| `CORREIOS_USUARIO` | SOAP contract username |
| `CORREIOS_SENHA` | SOAP contract password |
| `CORREIOS_COD_ADMINISTRATIVO` | Administrative code |
| `CORREIOS_CARTAO_POSTAGEM` | Postage card number |
| `CORREIOS_NUMERO_CONTRATO` | Contract number |
| `CORREIOS_CNPJ` | Company CNPJ (digits only) |
| `CORREIOS_CODIGO_SERVICO` | Reverse service code **for your contract** (e.g. `03301`, `04677`, `04170`) |

Optional: `CORREIOS_WSDL_URL`, `CORREIOS_TIMEOUT_MS`, `CORREIOS_REJECT_UNAUTHORIZED`.

See [docs/API.md § Configuration](./docs/API.md#2-configuration) for NestJS patterns, validation behaviour, and security rules.

---

## Quick start

### Emit authorization

```ts
import {
  CorreiosLogisticaReversaClient,
  loadConfigFromEnv,
} from 'correios-logistica-reversa';

const client = new CorreiosLogisticaReversaClient({
  config: loadConfigFromEnv(),
});

const result = await client.issueAuthorization({
  destinatario: {
    nome: 'Privato',
    logradouro: 'Rod. José Carlos Daux',
    numero: '5025B',
    complemento: 'LJ-21',
    bairro: 'Saco Grande',
    cidade: 'Florianopolis',
    uf: 'SC',
    cep: '88032005',
    email: 'contabilidade@privato.com.br',
    identificacao: '14826185000100',
  },
  coleta: {
    ag: 15,
    remetente: {
      nome: 'Herbert Vieira da Silva',
      logradouro: 'Av. Oscar Niemeyer',
      numero: '72',
      complemento: 'Casa',
      bairro: 'Floresta',
      cidade: 'Ampere',
      uf: 'PR',
      cep: '85640000',
      email: 'hbt.vieira@gmail.com',
      identificacao: '70832846287',
      sms: true,
    },
  },
});

if (result.numeroColeta) {
  console.log('Authorization:', result.numeroColeta);
  console.log('Deadline:', result.prazo);
} else if (result.codigoErro) {
  console.error('Correios error:', result.codigoErro, result.descricaoErro);
}
```

### Cancel authorization

```ts
const cancel = await client.cancelOrder({
  numeroPedido: result.numeroColeta!,
});

console.log(cancel.objetoPostal);
// { status_pedido: 'Desistência do Cliente ECT', datahora_cancelamento: '...' }
```

### Programmatic config (no env vars)

```ts
import { CorreiosLogisticaReversaClient, validateConfig } from 'correios-logistica-reversa';

const client = new CorreiosLogisticaReversaClient({
  config: validateConfig({
    environment: 'production',
    usuario: '...',
    senha: '...',
    codAdministrativo: '...',
    cartaoPostagem: '...',
    numeroContrato: '...',
    cnpjEmpresa: '...',
    codigoServico: '03301',
  }),
});
```

---

## API methods

| Method | SOAP operation | Returns |
|--------|----------------|---------|
| `issueAuthorization(input)` | `solicitarPostagemReversa` | `IssueAuthorizationResult` |
| `trackByOrderNumber(input)` | `acompanharPedido` | `TrackResult` |
| `trackByDate(input)` | `acompanharPedidoPorData` | `TrackResult` |
| `cancelOrder(input)` | `cancelarPedido` | `CancelOrderResult` |

### Response handling

| Situation | What happens |
|-----------|--------------|
| **Success** | `issueAuthorization` sets `numeroColeta`, `prazo`, `statusObjeto` |
| **Correios business error** | `codigoErro` + `descricaoErro` on result (usually **not thrown**) |
| **Network / SOAP fault** | Throws `CorreiosTransportError` |
| **Invalid config** | Throws `CorreiosConfigError` on `loadConfigFromEnv()` / constructor |

Full input/output shapes, examples, and field tables: **[docs/API.md](./docs/API.md)**.

### Domain roles

- **`destinatario`** — company receiving the return (your warehouse).
- **`coleta.remetente`** — customer who will post the package at Correios.
- **`sms: true`** — only valid on **remetente** (not destinatario).

---

## Examples

| File | Description |
|------|-------------|
| [`examples/issue-authorization.ts`](./examples/issue-authorization.ts) | Minimal emit |
| [`examples/live-privato-scenario.ts`](./examples/live-privato-scenario.ts) | Production scenario (validated) |
| [`examples/live-cancel-scenario.ts`](./examples/live-cancel-scenario.ts) | Cancel by order number |

```bash
npx tsx examples/live-privato-scenario.ts
npx tsx examples/live-cancel-scenario.ts <numeroPedido>
```

---

## Development

```bash
git clone https://github.com/hbtsmith/correios-logistica-reversa.git
cd correios-logistica-reversa
npm install
npm run test:coverage
npm run build
```

Live tests (opt-in, real credentials):

```bash
CORREIOS_LIVE_TEST=1 npm run test:live
```

Governance: [CONSTITUTION.md](./CONSTITUTION.md) · [PROCESS.md](./PROCESS.md) · [STACK.md](./STACK.md)

---

## Scope

**In scope:** Logística Reversa SOAP — authorize, track, cancel.

**Out of scope (v1):** SIGEP labels/PLP, freight calculator, CEP lookup, Correios REST pré-postagem.

---

## Contributing

Issues and PRs welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md).