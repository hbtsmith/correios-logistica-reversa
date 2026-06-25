# API Reference — correios-logistica-reversa

> **Canonical integration guide** for humans and AI agents.
> Package: `correios-logistica-reversa` · Runtime: Node.js ≥ 20 · Transport: SOAP (Logística Reversa WS)

## Metadata (machine-readable)

```yaml
package: correios-logistica-reversa
runtime: node>=20
module_system: esm+cjs
entry: correios-logistica-reversa
client_class: CorreiosLogisticaReversaClient
config_loader: loadConfigFromEnv
config_validator: validateConfig
operations:
  - name: issueAuthorization
    soap: solicitarPostagemReversa
  - name: trackByOrderNumber
    soap: acompanharPedido
  - name: trackByDate
    soap: acompanharPedidoPorData
  - name: cancelOrder
    soap: cancelarPedido
required_env:
  - CORREIOS_ENV
  - CORREIOS_USUARIO
  - CORREIOS_SENHA
  - CORREIOS_COD_ADMINISTRATIVO
  - CORREIOS_CARTAO_POSTAGEM
  - CORREIOS_NUMERO_CONTRATO
  - CORREIOS_CNPJ
  - CORREIOS_CODIGO_SERVICO
```

---

## 1. Installation

```bash
npm install correios-logistica-reversa
```

```bash
pnpm add correios-logistica-reversa
```

```bash
yarn add correios-logistica-reversa
```

**Requirements:** Node.js 20 or newer. TypeScript types ship with the package (`dist/index.d.ts`).

**Not included:** This library does not load `.env` files automatically. The host application must populate `process.env` (dotenv, NestJS `ConfigModule`, Docker secrets, etc.) before calling `loadConfigFromEnv()`.

---

## 2. Configuration

### 2.1 Environment variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `CORREIOS_ENV` | **Yes** | `production` or `homologation` (aliases: `prod`, `homolog`, `development`) | `production` |
| `CORREIOS_USUARIO` | **Yes** | Contract SOAP username | `mondelic` |
| `CORREIOS_SENHA` | **Yes** | Contract SOAP password | *(from Correios contract)* |
| `CORREIOS_COD_ADMINISTRATIVO` | **Yes** | Administrative code | `17035201` |
| `CORREIOS_CARTAO_POSTAGEM` | **Yes** | Postage card (digits only; leading zeros OK) | `0072974990` |
| `CORREIOS_NUMERO_CONTRATO` | **Yes** | Contract number | `9912409628` |
| `CORREIOS_CNPJ` | **Yes** | Company CNPJ (11–14 digits, no formatting) | `14826185000100` |
| `CORREIOS_CODIGO_SERVICO` | **Yes** | Reverse service code for your contract | `03301` (PAC reverso Privato) |
| `CORREIOS_WSDL_URL` | No | Override WSDL URL | *(default per environment)* |
| `CORREIOS_TIMEOUT_MS` | No | SOAP timeout (default `180000`) | `180000` |
| `CORREIOS_REJECT_UNAUTHORIZED` | No | TLS cert validation (`false` to disable) | `true` |

**Where values come from:** Correios contract / SIGEP credentials screen / your `correios_config` table. Service codes are **contract-specific** — do not assume `04677`/`04170` unless your contract uses them.

Common reverse service codes (reference only):

| Code | Typical service |
|------|-----------------|
| `04677` | PAC reverso (manual / legacy) |
| `04170` | SEDEX reverso (manual / legacy) |
| `03301` | PAC reverso (example production contract) |

### 2.2 Loading config in a host project

**From environment (recommended for servers):**

```ts
import { CorreiosLogisticaReversaClient, loadConfigFromEnv } from 'correios-logistica-reversa';

// Ensure process.env is populated by your app bootstrap first
const client = new CorreiosLogisticaReversaClient({
  config: loadConfigFromEnv(),
});
```

**Programmatic (recommended for tests or secret managers):**

```ts
import { CorreiosLogisticaReversaClient, validateConfig } from 'correios-logistica-reversa';

const client = new CorreiosLogisticaReversaClient({
  config: validateConfig({
    environment: 'production',
    usuario: process.env.CORREIOS_USUARIO!,
    senha: process.env.CORREIOS_SENHA!,
    codAdministrativo: '17035201',
    cartaoPostagem: '0072974990',
    numeroContrato: '9912409628',
    cnpjEmpresa: '14826185000100',
    codigoServico: '03301',
  }),
});
```

**NestJS pattern:**

```ts
// correios-lr.module.ts — inject config from ConfigService, never hardcode senha
{
  provide: CorreiosLogisticaReversaClient,
  useFactory: (config: ConfigService) =>
    new CorreiosLogisticaReversaClient({
      config: validateConfig({
        environment: config.get('CORREIOS_ENV'),
        usuario: config.get('CORREIOS_USUARIO'),
        senha: config.get('CORREIOS_SENHA'),
        codAdministrativo: config.get('CORREIOS_COD_ADMINISTRATIVO'),
        cartaoPostagem: config.get('CORREIOS_CARTAO_POSTAGEM'),
        numeroContrato: config.get('CORREIOS_NUMERO_CONTRATO'),
        cnpjEmpresa: config.get('CORREIOS_CNPJ'),
        codigoServico: config.get('CORREIOS_CODIGO_SERVICO'),
      }),
    }),
  inject: [ConfigService],
}
```

**Security rules:**

- Never commit `.env` or passwords to git.
- Production WSDL requires Basic Auth on WSDL fetch and on SOAP calls (handled by the library).
- `loadConfigFromEnv()` throws `CorreiosConfigError` if any required field is missing or invalid.

---

## 3. Client

### Constructor

```ts
new CorreiosLogisticaReversaClient(options: {
  config: CorreiosConfig;
  transport?: SoapTransport; // optional — for unit tests only
})
```

Create **one client instance per config** (or per request in serverless — client caches SOAP connection internally).

---

## 4. Domain model (Logística Reversa)

| Role | Portuguese (DTO fields) | Who |
|------|---------------------------|-----|
| Company receiving the return | `destinatario` | Your warehouse / Privato |
| Customer sending the package back | `coleta.remetente` | Revendedora / end customer |

**Field naming:** TypeScript **method names** are English. **DTO property names** mirror Correios SOAP (`destinatario`, `coleta`, `numeroPedido`, etc.).

**`sms`:** Only sent on `coleta.remetente` when `sms: true`. The WSDL rejects `sms` on `destinatario`.

**CEP / phones:** Digits are normalized automatically (`88032-005` → `88032005`).

---

## 5. Methods

### 5.1 `issueAuthorization`

**SOAP:** `solicitarPostagemReversa`  
**Purpose:** Create a prepaid reverse logistics authorization (customer posts at agency).

**Input:** `IssueAuthorizationInput`

```ts
{
  destinatario: Party;      // company receiving the return
  coleta: {
    tipo?: 'A';             // default 'A' (authorization at agency)
    ag: number | string;    // validity days for posting (e.g. 15)
    remetente: Party;       // customer sending the package
    valorDeclarado?: number;
    servicoAdicional?: string;
    ar?: number | string;
    objCol?: { item?, desc?, entrega?, num?, id? };
  };
  codigoServico?: string;   // override config.codigoServico per call
}
```

**Returns:** `IssueAuthorizationResult`

| Field | Type | When present |
|-------|------|--------------|
| `numeroColeta` | `string` | Success — authorization / order number (save to DB) |
| `prazo` | `string` | Success — posting deadline (e.g. `10/07/2026`) |
| `statusObjeto` | `string` | Success — e.g. `01` (awaiting object at agency) |
| `codigoErro` | `string \| number` | Business error from Correios |
| `descricaoErro` | `string` | Business error message |
| `dataSolicitacao` | `string` | Some error responses |
| `raw` | `unknown` | Full SOAP payload for debugging |

**Success handling:**

```ts
const result = await client.issueAuthorization(input);

if (result.numeroColeta) {
  // SUCCESS — persist result.numeroColeta, result.prazo, result.statusObjeto
} else if (result.codigoErro) {
  // BUSINESS ERROR — show result.descricaoErro to ops / log result.codigoErro
} else {
  // Unexpected shape — inspect result.raw
}
```

**Production success example (validated):**

```json
{
  "numeroColeta": "4638012880",
  "prazo": "10/07/2026",
  "statusObjeto": "01",
  "raw": { "numero_coleta": "4638012880", "codigo_erro": 0 }
}
```

**Business error example:**

```json
{
  "codigoErro": "109",
  "descricaoErro": "DADOS DO CONTRATO INVÁLIDOS (...)",
  "raw": { "cod_erro": "109", "msg_erro": "..." }
}
```

**Throws:** `CorreiosTransportError` — network, WSDL auth, SOAP fault (not business `codigo_erro` in body).

---

### 5.2 `trackByOrderNumber`

**SOAP:** `acompanharPedido`  
**Purpose:** Track a single authorization by order number.

**Input:** `TrackByOrderNumberInput`

```ts
{
  numeroPedido: string | number;  // e.g. '4638012880'
  tipoBusca?: 'H';                // default 'H' (history)
  tipoSolicitacao?: 'A';          // default 'A'
}
```

**Returns:** `TrackResult`

| Field | Type | Description |
|-------|------|-------------|
| `coleta` | `unknown` | Parsed collection object(s) from Correios |
| `raw` | `unknown` | Full SOAP response |

Use `raw` for fields not yet mapped to typed interfaces.

---

### 5.3 `trackByDate`

**SOAP:** `acompanharPedidoPorData`  
**Purpose:** Bulk sync — all authorizations for a date.

**Input:** `TrackByDateInput`

```ts
{
  data: string;              // 'YYYY-MM-DD'
  tipoSolicitacao?: 'A';     // default 'A'
}
```

**Returns:** `TrackResult` (same shape as `trackByOrderNumber`).

---

### 5.4 `cancelOrder`

**SOAP:** `cancelarPedido`  
**Purpose:** Cancel an open authorization before the customer posts.

**Input:** `CancelOrderInput`

```ts
{
  numeroPedido: string | number;  // numeroColeta from issueAuthorization
  tipo?: 'A';                     // default 'A'
}
```

**Returns:** `CancelOrderResult`

| Field | Type | Description |
|-------|------|-------------|
| `objetoPostal` | `CancelOrderPayload` | Parsed cancel envelope (`codigo_administrativo`, nested `objeto_postal`) |
| `numeroPedido` | `string?` | Convenience — from `objeto_postal.numero_pedido` |
| `statusPedido` | `string?` | Convenience — from `objeto_postal.status_pedido` |
| `datahoraCancelamento` | `string?` | Convenience — from `objeto_postal.datahora_cancelamento` |
| `raw` | `unknown` | Full SOAP response |

**Production success example (validated):**

```json
{
  "objetoPostal": {
    "codigo_administrativo": "17035201",
    "objeto_postal": {
      "numero_pedido": "4638012880",
      "status_pedido": "Desistência do Cliente ECT",
      "datahora_cancelamento": "25/06/2026 15:22"
    }
  }
}
```

---

## 6. Input validation

All client methods validate inputs with **Zod** before SOAP calls. Invalid input throws `CorreiosValidationError` with `code: VALIDATION_FAILED` and a human-readable message.

```ts
import { CorreiosValidationError, VALIDATION_ERROR_CODES } from 'correios-logistica-reversa';

try {
  await client.issueAuthorization({ destinatario: { /* missing fields */ }, coleta: { ag: 5, remetente } });
} catch (error) {
  if (error instanceof CorreiosValidationError) {
    console.log(error.code); // 'VALIDATION_FAILED'
  }
}
```

---

## 7. Errors

| Class | When |
|-------|------|
| `CorreiosConfigError` | Missing/invalid config or env vars |
| `CorreiosValidationError` | Zod input validation failed (`VALIDATION_FAILED`) |
| `CorreiosResponseError` | Unparseable SOAP response shape |
| `CorreiosTransportError` | WSDL/SOAP network failure (see `TRANSPORT_ERROR_CODES`) |
| `CorreiosError` | Base class — `code?`, `raw?`, `cause?` |

### Transport error codes (`TRANSPORT_ERROR_CODES`)

| Code | When |
|------|------|
| `WSDL_UNAUTHORIZED` | WSDL fetch returned 401 |
| `WSDL_CREATE_FAILED` | WSDL client creation failed (other) |
| `SOAP_METHOD_UNAVAILABLE` | Method missing on WSDL client |
| `SOAP_FAULT` | SOAP fault / unmarshalling error |
| `SOAP_CALL_FAILED` | Other SOAP callback error |

### Result helpers

```ts
import { isIssueSuccess, isCorreiosBusinessError } from 'correios-logistica-reversa';

const result = await client.issueAuthorization(input);
if (isIssueSuccess(result)) {
  console.log(result.numeroColeta); // narrowed to string
}
if (isCorreiosBusinessError(result)) {
  console.log(result.codigoErro, result.descricaoErro);
}
```

**Important:** Correios **business errors** (e.g. code `109`) are usually returned **inside** `IssueAuthorizationResult.codigoErro` — not thrown. Only transport/parsing/validation failures throw.

---

## 8. `Party` fields (remetente / destinatario)

| Field | Required | Notes |
|-------|----------|-------|
| `nome` | Yes | |
| `logradouro` | Yes | |
| `numero` | Yes | |
| `bairro` | Yes | |
| `cidade` | Yes | |
| `uf` | Yes | 2-letter state |
| `cep` | Yes | With or without hyphen |
| `complemento` | No | |
| `referencia` | No | |
| `email` | No | |
| `ddd` / `telefone` | No | |
| `dddCelular` / `celular` | No | |
| `identificacao` | No | CPF/CNPJ digits |
| `sms` | No | **Remetente only** — notifies customer via SMS |

---

## 9. Runnable examples

| Script | Purpose |
|--------|---------|
| `examples/issue-authorization.ts` | Minimal emit |
| `examples/live-privato-scenario.ts` | Full production scenario |
| `examples/live-cancel-scenario.ts` | Cancel by `numeroPedido` |

```bash
# Host app must set env vars or use a local .env + loader in the script
npx tsx examples/live-privato-scenario.ts
npx tsx examples/live-cancel-scenario.ts 4638012880
```

---

## 10. Typical integration flow

```
1. Load config (env or secret manager)
2. new CorreiosLogisticaReversaClient({ config })
3. issueAuthorization({ destinatario, coleta }) → save numeroColeta
4. trackByOrderNumber({ numeroPedido }) → sync status (cron/webhook)
5. cancelOrder({ numeroPedido }) → if order cancelled before posting
```

---

## 11. Exports reference

```ts
// Client
CorreiosLogisticaReversaClient
CorreiosLogisticaReversaClientOptions

// Config
loadConfigFromEnv(env?: NodeJS.ProcessEnv)
validateConfig(input: CorreiosConfig)
getWsdlUrl(config: CorreiosConfig)

// Errors
CorreiosError, CorreiosConfigError, CorreiosValidationError,
CorreiosResponseError, CorreiosTransportError
TRANSPORT_ERROR_CODES, VALIDATION_ERROR_CODES

// Helpers
isIssueSuccess(result)
isCorreiosBusinessError(result)

// SOAP
SOAP_OPERATIONS   // { ISSUE_AUTHORIZATION, TRACK_BY_ORDER, ... }
SoapTransport       // injectable transport interface

// Constants
WSDL_LOGISTICA_REVERSA_PRODUCTION
WSDL_LOGISTICA_REVERSA_HOMOLOGATION
SERVICE_CODE_PAC_REVERSO   // '04677'
SERVICE_CODE_SEDEX_REVERSO // '04170'
DEFAULT_TIMEOUT_MS         // 180000

// Types (all interfaces in sections 5–8)
```

---

*Last updated: 2026-06-25 — v1.0.0 P0: validation, typed cancel, transport codes, result helpers.*