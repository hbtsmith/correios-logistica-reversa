import { REQUEST_TYPE_AUTHORIZATION } from '../constants.js';
import { CorreiosResponseError } from '../errors.js';
import type {
  CorreiosConfig,
  IssueAuthorizationInput,
  IssueAuthorizationResult,
} from '../types/index.js';
import { partyToSoap } from './party.js';

export function buildIssueAuthorizationPayload(
  config: CorreiosConfig,
  input: IssueAuthorizationInput,
): Record<string, unknown> {
  const coletas: Record<string, unknown> = {
    tipo: input.coleta.tipo ?? REQUEST_TYPE_AUTHORIZATION,
    numero: '',
    id_cliente: null,
    ag: String(input.coleta.ag),
    servico_adicional: input.coleta.servicoAdicional ?? '',
    ar: input.coleta.ar ?? 0,
    remetente: partyToSoap(input.coleta.remetente),
  };

  if (input.coleta.valorDeclarado !== undefined && input.coleta.valorDeclarado > 0) {
    coletas.valor_declarado = input.coleta.valorDeclarado;
  }

  if (input.coleta.objCol) {
    coletas.obj_col = {
      item: input.coleta.objCol.item ?? 1,
      desc: input.coleta.objCol.desc ?? '',
      entrega: input.coleta.objCol.entrega ?? '',
      num: input.coleta.objCol.num ?? '',
      id: input.coleta.objCol.id ?? '',
    };
  }

  return {
    codAdministrativo: config.codAdministrativo,
    codigo_servico: input.codigoServico ?? config.codigoServico,
    cartao: config.cartaoPostagem,
    destinatario: partyToSoap(input.destinatario),
    coletas_solicitadas: coletas,
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object') {
    return value as Record<string, unknown>;
  }
  return null;
}

export function parseIssueAuthorizationResponse(raw: unknown): IssueAuthorizationResult {
  const root = asRecord(raw);
  const envelope = asRecord(root?.solicitarPostagemReversa) ?? root;
  const result = asRecord(envelope?.resultado_solicitacao) ?? envelope;

  if (!result) {
    throw new CorreiosResponseError('Unexpected Correios response for solicitarPostagemReversa', {
      raw,
    });
  }

  const codigoErro = result.codigo_erro ?? result.cod_erro;
  const descricaoErro = result.descricao_erro ?? result.msg_erro;

  if (codigoErro !== undefined && codigoErro !== null && String(codigoErro) !== '0') {
    const errorResult: IssueAuthorizationResult = { raw: result };
    errorResult.codigoErro =
      typeof codigoErro === 'string' || typeof codigoErro === 'number' ? codigoErro : String(codigoErro);
    if (descricaoErro) {
      errorResult.descricaoErro = String(descricaoErro);
    }
    if (result.status_objeto) {
      errorResult.statusObjeto = String(result.status_objeto);
    }
    if (result.data_solicitacao) {
      errorResult.dataSolicitacao = String(result.data_solicitacao);
    }
    return errorResult;
  }

  const successResult: IssueAuthorizationResult = { raw: result };
  if (result.numero_coleta) {
    successResult.numeroColeta = String(result.numero_coleta);
  }
  if (result.prazo) {
    successResult.prazo = String(result.prazo);
  }
  if (result.status_objeto) {
    successResult.statusObjeto = String(result.status_objeto);
  }
  return successResult;
}