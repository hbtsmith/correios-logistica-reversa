/**
 * Example: issue a reverse logistics authorization.
 *
 * Usage:
 *   cp .env.example .env   # fill credentials
 *   npx tsx examples/issue-authorization.ts
 */
import { CorreiosLogisticaReversaClient, loadConfigFromEnv } from '../src/index.js';

async function main(): Promise<void> {
  const client = new CorreiosLogisticaReversaClient({ config: loadConfigFromEnv() });

  const result = await client.issueAuthorization({
    destinatario: {
      nome: 'Destinatário Exemplo',
      logradouro: 'Rua Destino',
      numero: '100',
      bairro: 'Centro',
      cidade: 'Blumenau',
      uf: 'SC',
      cep: '89010000',
      email: 'destino@example.com',
    },
    coleta: {
      ag: 5,
      remetente: {
        nome: 'Remetente Exemplo',
        logradouro: 'Rua Origem',
        numero: '1',
        bairro: 'Bairro',
        cidade: 'Curitiba',
        uf: 'PR',
        cep: '80010000',
        email: 'origem@example.com',
        identificacao: '12345678901',
      },
    },
  });

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});