import { describe, expect, it } from 'vitest';

import { buildIssueAuthorizationPayload, parseIssueAuthorizationResponse } from '../../src/parsers/issue-authorization.js';
import {
  buildCancelOrderPayload,
  buildTrackByDatePayload,
  buildTrackByOrderNumberPayload,
  parseCancelOrderResponse,
  parseTrackByDateResponse,
  parseTrackByOrderNumberResponse,
} from '../../src/parsers/track.js';
import type { CorreiosConfig } from '../../src/types/index.js';

const baseConfig: CorreiosConfig = {
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
  cep: '80420-010',
  email: 'maria@example.com',
  identificacao: '12345678901',
};

describe('payload builders', () => {
  it('builds issue authorization payload', () => {
    const payload = buildIssueAuthorizationPayload(baseConfig, {
      destinatario: { ...party, nome: 'Privato' },
      coleta: {
        ag: 5,
        remetente: party,
        valorDeclarado: 250,
      },
    });

    expect(payload.codAdministrativo).toBe('17000190');
    expect(payload.codigo_servico).toBe('04677');
    expect(payload.coletas_solicitadas).toMatchObject({
      tipo: 'A',
      ag: '5',
      valor_declarado: 250,
    });
    expect(payload.coletas_solicitadas).toHaveProperty('remetente');
    expect((payload.coletas_solicitadas as Record<string, unknown>).remetente).toMatchObject({
      cep: '80420010',
    });
  });

  it('builds track and cancel payloads', () => {
    expect(buildTrackByOrderNumberPayload(baseConfig, { numeroPedido: '1134135328' })).toEqual({
      codAdministrativo: '17000190',
      numeroPedido: '1134135328',
      tipoBusca: 'H',
      tipoSolicitacao: 'A',
    });

    expect(buildTrackByDatePayload(baseConfig, { data: '2026-06-01' })).toEqual({
      codAdministrativo: '17000190',
      tipoSolicitacao: 'A',
      data: '2026-06-01',
    });

    expect(buildCancelOrderPayload(baseConfig, { numeroPedido: 1134135328 })).toEqual({
      codAdministrativo: '17000190',
      numeroPedido: '1134135328',
      tipo: 'A',
    });
  });
});

describe('response parsers', () => {
  it('parses successful issue authorization', () => {
    const result = parseIssueAuthorizationResponse({
      solicitarPostagemReversa: {
        resultado_solicitacao: {
          numero_coleta: '1134135328',
          prazo: '2026-07-01',
          status_objeto: 'OK',
        },
      },
    });

    expect(result.numeroColeta).toBe('1134135328');
    expect(result.prazo).toBe('2026-07-01');
  });

  it('parses business error 121 on issue authorization', () => {
    const result = parseIssueAuthorizationResponse({
      codigo_erro: 121,
      descricao_erro: 'Ja existe um pedido 1134135328',
      status_objeto: 'PENDENTE',
    });

    expect(result.codigoErro).toBe(121);
    expect(result.descricaoErro).toContain('1134135328');
  });

  it('parses track and cancel responses', () => {
    const track = parseTrackByOrderNumberResponse({ acompanharPedido: { coleta: [{ numero_pedido: '1' }] } });
    expect(track.coleta).toEqual({ coleta: [{ numero_pedido: '1' }] });

    const byDate = parseTrackByDateResponse({ acompanharPedidoPorData: { coleta: [] } });
    expect(byDate.coleta).toEqual({ coleta: [] });

    const cancel = parseCancelOrderResponse({
      cancelarPedido: { datahora_cancelamento: '2026-06-25T10:00:00' },
    });
    expect(cancel.objetoPostal).toEqual({ datahora_cancelamento: '2026-06-25T10:00:00' });
  });
});