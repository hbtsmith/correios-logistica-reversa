import { describe, expect, it, vi } from 'vitest';

import { CorreiosLogisticaReversaClient } from '../../src/client.js';
import type { SoapTransport } from '../../src/soap/transport.js';
import type { CorreiosConfig } from '../../src/types/index.js';

const config: CorreiosConfig = {
  environment: 'homologation',
  usuario: 'empresacws',
  senha: '123456',
  codAdministrativo: '17000190',
  cartaoPostagem: '0067599079',
  numeroContrato: '9992157880',
  cnpjEmpresa: '34028316000103',
  codigoServico: '04677',
};

const party = {
  nome: 'Maria Silva',
  logradouro: 'Rua A',
  numero: '10',
  bairro: 'Centro',
  cidade: 'Curitiba',
  uf: 'PR',
  cep: '80420010',
};

function createMockTransport(): SoapTransport & { calls: Array<{ method: string; args: Record<string, unknown> }> } {
  const calls: Array<{ method: string; args: Record<string, unknown> }> = [];
  return {
    calls,
    call: vi.fn(async (method: string, args: Record<string, unknown>) => {
      calls.push({ method, args });
      if (method === 'solicitarPostagemReversa') {
        return {
          solicitarPostagemReversa: {
            resultado_solicitacao: { numero_coleta: '9999999999', prazo: '2026-07-01' },
          },
        };
      }
      if (method === 'acompanharPedido') {
        return { acompanharPedido: { numero_pedido: '9999999999' } };
      }
      if (method === 'acompanharPedidoPorData') {
        return { acompanharPedidoPorData: { coleta: [] } };
      }
      if (method === 'cancelarPedido') {
        return { cancelarPedido: { datahora_cancelamento: '2026-06-25' } };
      }
      throw new Error(`Unexpected method ${method}`);
    }),
  };
}

describe('CorreiosLogisticaReversaClient', () => {
  it('issues authorization via SOAP transport', async () => {
    const transport = createMockTransport();
    const client = new CorreiosLogisticaReversaClient({ config, transport });

    const result = await client.issueAuthorization({
      destinatario: { ...party, nome: 'Destino' },
      coleta: { ag: 5, remetente: party },
    });

    expect(result.numeroColeta).toBe('9999999999');
    expect(transport.calls[0]?.method).toBe('solicitarPostagemReversa');
  });

  it('propagates transport errors from SOAP layer', async () => {
    const transport: SoapTransport = {
      call: vi.fn(async () => {
        throw new Error('SOAP down');
      }),
    };
    const client = new CorreiosLogisticaReversaClient({ config, transport });

    await expect(client.issueAuthorization({
      destinatario: party,
      coleta: { ag: 5, remetente: party },
    })).rejects.toThrow('SOAP down');
  });

  it('tracks and cancels via SOAP transport', async () => {
    const transport = createMockTransport();
    const client = new CorreiosLogisticaReversaClient({ config, transport });

    const track = await client.trackByOrderNumber({ numeroPedido: '9999999999' });
    expect(track.coleta).toEqual({ numero_pedido: '9999999999' });

    const byDate = await client.trackByDate({ data: '2026-06-01' });
    expect(byDate.coleta).toEqual({ coleta: [] });

    const cancel = await client.cancelOrder({ numeroPedido: '9999999999' });
    expect(cancel.objetoPostal).toEqual({ datahora_cancelamento: '2026-06-25' });
  });
});