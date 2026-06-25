import { describe, expect, it } from 'vitest';

import { CorreiosResponseError } from '../../src/errors.js';
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
      codigoServico: '04170',
      coleta: {
        ag: 5,
        remetente: party,
        valorDeclarado: 250,
        objCol: { desc: 'Anel', num: 'SKU-1' },
      },
    });

    expect(payload.codAdministrativo).toBe('17000190');
    expect(payload.codigo_servico).toBe('04170');
    expect(payload.coletas_solicitadas).toMatchObject({
      tipo: 'A',
      ag: '5',
      valor_declarado: 250,
      obj_col: {
        item: 1,
        desc: 'Anel',
        entrega: '',
        num: 'SKU-1',
        id: '',
      },
    });
    expect(payload.coletas_solicitadas).toHaveProperty('remetente');
    expect((payload.coletas_solicitadas as Record<string, unknown>).remetente).toMatchObject({
      cep: '80420010',
    });
  });

  it('omits zero valorDeclarado from issue payload', () => {
    const payload = buildIssueAuthorizationPayload(baseConfig, {
      destinatario: party,
      coleta: { ag: 3, remetente: party, valorDeclarado: 0 },
    });

    expect(payload.coletas_solicitadas).not.toHaveProperty('valor_declarado');
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

  it('parses production array resultado_solicitacao', () => {
    const result = parseIssueAuthorizationResponse({
      solicitarPostagemReversa: {
        resultado_solicitacao: [
          {
            numero_coleta: '4638012880',
            prazo: '10/07/2026',
            status_objeto: '01',
            codigo_erro: 0,
          },
        ],
      },
    });

    expect(result.numeroColeta).toBe('4638012880');
    expect(result.prazo).toBe('10/07/2026');
    expect(result.statusObjeto).toBe('01');
  });

  it('parses business error 121 on issue authorization', () => {
    const result = parseIssueAuthorizationResponse({
      codigo_erro: 121,
      descricao_erro: 'Ja existe um pedido 1134135328',
      status_objeto: 'PENDENTE',
      data_solicitacao: '2026-06-25',
    });

    expect(result.codigoErro).toBe(121);
    expect(result.descricaoErro).toContain('1134135328');
    expect(result.statusObjeto).toBe('PENDENTE');
    expect(result.dataSolicitacao).toBe('2026-06-25');
  });

  it('parses cod_erro and msg_erro aliases', () => {
    const result = parseIssueAuthorizationResponse({
      solicitarPostagemReversa: {
        resultado_solicitacao: {
          cod_erro: '99',
          msg_erro: 'Erro generico',
        },
      },
    });

    expect(result.codigoErro).toBe('99');
    expect(result.descricaoErro).toBe('Erro generico');
  });

  it('treats codigo_erro 0 as success', () => {
    const result = parseIssueAuthorizationResponse({
      resultado_solicitacao: {
        codigo_erro: '0',
        numero_coleta: '555',
      },
    });

    expect(result.numeroColeta).toBe('555');
    expect(result.codigoErro).toBeUndefined();
  });

  it('throws on unexpected issue authorization response', () => {
    expect(() => parseIssueAuthorizationResponse(null)).toThrow(CorreiosResponseError);
  });

  it('parses track and cancel responses', () => {
    const track = parseTrackByOrderNumberResponse({ acompanharPedido: { coleta: [{ numero_pedido: '1' }] } });
    expect(track.coleta).toEqual({ coleta: [{ numero_pedido: '1' }] });

    const trackFallback = parseTrackByOrderNumberResponse({ coleta: { numero_pedido: '2' } });
    expect(trackFallback.coleta).toEqual({ numero_pedido: '2' });

    const byDate = parseTrackByDateResponse({ acompanharPedidoPorData: { coleta: [] } });
    expect(byDate.coleta).toEqual({ coleta: [] });

    const byDateFallback = parseTrackByDateResponse({ coleta: [] });
    expect(byDateFallback.coleta).toEqual([]);

    const cancel = parseCancelOrderResponse({
      cancelarPedido: { datahora_cancelamento: '2026-06-25T10:00:00' },
    });
    expect(cancel.objetoPostal).toEqual({ datahora_cancelamento: '2026-06-25T10:00:00' });

    const cancelFallback = parseCancelOrderResponse({
      objeto_postal: { datahora_cancelamento: '2026-06-26' },
    });
    expect(cancelFallback.objetoPostal).toEqual({ datahora_cancelamento: '2026-06-26' });
  });

  it('throws on unexpected track and cancel responses', () => {
    expect(() => parseTrackByOrderNumberResponse(undefined)).toThrow(CorreiosResponseError);
    expect(() => parseTrackByDateResponse(undefined)).toThrow(CorreiosResponseError);
    expect(() => parseCancelOrderResponse(undefined)).toThrow(CorreiosResponseError);
  });
});