# correios-logistica-reversa

TypeScript client for the **Correios Logística Reversa** SOAP Web Service.

Issue prepaid return authorizations, track postings, and cancel orders — from any Node.js 20+ project.

**Maintainer:** [Herbert Smith](https://github.com/hbtsmith)

## Install

```bash
npm install correios-logistica-reversa
```

## Quick start

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
    nome: 'Your Company',
    logradouro: 'Rua Example',
    numero: '100',
    bairro: 'Centro',
    cidade: 'Blumenau',
    uf: 'SC',
    cep: '89010000',
    email: 'logistica@company.com',
  },
  coleta: {
    ag: 5,
    remetente: {
      nome: 'Customer Name',
      logradouro: 'Rua Customer',
      numero: '1',
      bairro: 'Bairro',
      cidade: 'Curitiba',
      uf: 'PR',
      cep: '80010000',
      email: 'customer@example.com',
      identificacao: '12345678901',
    },
  },
});

if (result.numeroColeta) {
  console.log('Authorization code:', result.numeroColeta);
} else {
  console.error('Correios error:', result.codigoErro, result.descricaoErro);
}
```

## Configuration

Copy `.env.example` to `.env` and fill in your **Correios contract** credentials. Never commit `.env`.

| Variable | Description |
|----------|-------------|
| `CORREIOS_ENV` | `production` or `homologation` |
| `CORREIOS_USUARIO` | Contract username |
| `CORREIOS_SENHA` | Contract password |
| `CORREIOS_COD_ADMINISTRATIVO` | Administrative code |
| `CORREIOS_CARTAO_POSTAGEM` | Postage card number |
| `CORREIOS_NUMERO_CONTRATO` | Contract number |
| `CORREIOS_CNPJ` | Company CNPJ |
| `CORREIOS_CODIGO_SERVICO` | `04677` (PAC reverso) or `04170` (SEDEX reverso) |

Or pass config programmatically:

```ts
const client = new CorreiosLogisticaReversaClient({
  config: {
    environment: 'homologation',
    usuario: '...',
    senha: '...',
    codAdministrativo: '...',
    cartaoPostagem: '...',
    numeroContrato: '...',
    cnpjEmpresa: '...',
    codigoServico: '04677',
  },
});
```

## API (v1)

| Method | SOAP operation |
|--------|----------------|
| `issueAuthorization()` | `solicitarPostagemReversa` |
| `trackByOrderNumber()` | `acompanharPedido` |
| `trackByDate()` | `acompanharPedidoPorData` |
| `cancelOrder()` | `cancelarPedido` |

## Development

Governance: [CONSTITUTION.md](./CONSTITUTION.md) · [PROCESS.md](./PROCESS.md) · [STACK.md](./STACK.md)

```bash
npm install
npm test
npm run typecheck
npm run lint
npm run build
```

### Live integration tests (opt-in)

Requires real credentials in `.env`:

```bash
CORREIOS_LIVE_TEST=1 npm run test:live
```

## Scope

**In scope:** Logística Reversa SOAP WS (authorization, tracking, cancel).

**Out of scope (v1):** SIGEP labels/PLP, freight calculator, CEP lookup, Correios REST pré-postagem API.

## License

MIT — see [LICENSE](./LICENSE).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Issues and PRs welcome.