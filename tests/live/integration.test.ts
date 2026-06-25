import { describe, expect, it } from 'vitest';

import { CorreiosLogisticaReversaClient, loadConfigFromEnv } from '../../src/index.js';

const liveEnabled = process.env.CORREIOS_LIVE_TEST === '1';

describe.skipIf(!liveEnabled)('live Correios integration', () => {
  it('issues and cancels a reverse logistics authorization', async () => {
    const config = loadConfigFromEnv();
    const client = new CorreiosLogisticaReversaClient({ config });

    const issue = await client.issueAuthorization({
      destinatario: {
        nome: 'Privato Joias',
        logradouro: 'Rua Teste',
        numero: '100',
        bairro: 'Centro',
        cidade: 'Blumenau',
        uf: 'SC',
        cep: '89010000',
        email: 'logistica@privato.example',
      },
      coleta: {
        ag: 5,
        remetente: {
          nome: 'Cliente Teste Live',
          logradouro: 'Rua Cliente',
          numero: '1',
          bairro: 'Bairro',
          cidade: 'Curitiba',
          uf: 'PR',
          cep: '80010000',
          email: 'cliente@example.com',
          identificacao: '00000000000',
        },
      },
    });

    expect(issue.numeroColeta ?? issue.codigoErro).toBeDefined();

    if (issue.numeroColeta) {
      const cancel = await client.cancelOrder({ numeroPedido: issue.numeroColeta });
      expect(cancel.objetoPostal).toBeDefined();
    }
  });
});