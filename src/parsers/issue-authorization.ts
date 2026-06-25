import { REQUEST_TYPE_AUTHORIZATION } from '../constants.js';
import { CorreiosResponseError } from '../errors.js';
import type {
  CorreiosConfig,
  IssueAuthorizationInput,
  IssueAuthorizationResult,
} from '../types/index.js';
import { asRecord, normalizeSoapResult, pickString } from './shared.js';
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
    remetente: partyToSoap(input.coleta.remetente, { includeSms: true }),
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

export function parseIssueAuthorizationResponse(raw: unknown): IssueAuthorizationResult {
  const root = asRecord(raw);
  const envelope = asRecord(root?.solicitarPostagemReversa) ?? root;
  const result = normalizeSoapResult(envelope?.resultado_solicitacao) ?? envelope;

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
    const statusObjeto = pickString(result, 'status_objeto');
    if (statusObjeto) {
      errorResult.statusObjeto = statusObjeto;
    }
    const dataSolicitacao = pickString(result, 'data_solicitacao');
    if (dataSolicitacao) {
      errorResult.dataSolicitacao = dataSolicitacao;
    }
    return errorResult;
  }

  const successResult: IssueAuthorizationResult = { raw: result };
  const numeroColeta = pickString(result, 'numero_coleta');
  if (numeroColeta) {
    successResult.numeroColeta = numeroColeta;
  }
  const prazo = pickString(result, 'prazo');
  if (prazo) {
    successResult.prazo = prazo;
  }
  const statusObjeto = pickString(result, 'status_objeto');
  if (statusObjeto) {
    successResult.statusObjeto = statusObjeto;
  }
  return successResult;
}