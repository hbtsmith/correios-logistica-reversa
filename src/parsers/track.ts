import { REQUEST_TYPE_AUTHORIZATION, SEARCH_TYPE_HISTORY } from '../constants.js';
import { CorreiosResponseError } from '../errors.js';
import type {
  CancelOrderInput,
  CancelOrderPayload,
  CancelOrderResult,
  CancelPostalObject,
  CorreiosConfig,
  TrackByDateInput,
  TrackByOrderNumberInput,
  TrackColetaEntry,
  TrackResult,
} from '../types/index.js';
import { asRecord, normalizeSoapResult, pickString } from './shared.js';

function parseTrackColeta(value: unknown): TrackColetaEntry | TrackColetaEntry[] {
  const record = asRecord(value);
  if (record && record.coleta !== undefined) {
    return parseTrackColeta(record.coleta);
  }
  if (Array.isArray(value)) {
    return value
      .map((entry) => asRecord(entry))
      .filter((entry): entry is TrackColetaEntry => entry !== null && Object.keys(entry).length > 0);
  }
  return record ?? {};
}

function extractTrackEnvelope(
  root: Record<string, unknown> | null,
  operationKey: string,
): unknown {
  if (!root) {
    return null;
  }
  return normalizeSoapResult(root[operationKey]) ?? root.coleta ?? root;
}

function parseCancelPostalObject(value: unknown): CancelPostalObject {
  const record = asRecord(value);
  if (!record) {
    return {};
  }

  const result: CancelPostalObject = {};
  const numeroPedido = pickString(record, 'numero_pedido');
  if (numeroPedido) {
    result.numero_pedido = numeroPedido;
  }
  const statusPedido = pickString(record, 'status_pedido');
  if (statusPedido) {
    result.status_pedido = statusPedido;
  }
  const datahoraCancelamento = pickString(record, 'datahora_cancelamento');
  if (datahoraCancelamento) {
    result.datahora_cancelamento = datahoraCancelamento;
  }
  return result;
}

function parseCancelEnvelope(value: unknown): CancelOrderPayload | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  const payload: CancelOrderPayload = { ...record };
  const codigoAdministrativo = pickString(record, 'codigo_administrativo');
  if (codigoAdministrativo) {
    payload.codigo_administrativo = codigoAdministrativo;
  }

  const nestedPostal = record.objeto_postal ?? record;
  const objetoPostal = parseCancelPostalObject(nestedPostal);
  if (Object.keys(objetoPostal).length > 0) {
    payload.objeto_postal = objetoPostal;
  }

  return payload;
}

export function buildTrackByOrderNumberPayload(
  config: CorreiosConfig,
  input: TrackByOrderNumberInput,
): Record<string, unknown> {
  return {
    codAdministrativo: config.codAdministrativo,
    numeroPedido: String(input.numeroPedido),
    tipoBusca: input.tipoBusca ?? SEARCH_TYPE_HISTORY,
    tipoSolicitacao: input.tipoSolicitacao ?? REQUEST_TYPE_AUTHORIZATION,
  };
}

export function parseTrackByOrderNumberResponse(raw: unknown): TrackResult {
  const root = asRecord(raw);
  const envelope = extractTrackEnvelope(root, 'acompanharPedido');

  if (!envelope) {
    throw new CorreiosResponseError('Unexpected Correios response for acompanharPedido', { raw });
  }

  return { coleta: parseTrackColeta(envelope), raw };
}

export function buildTrackByDatePayload(
  config: CorreiosConfig,
  input: TrackByDateInput,
): Record<string, unknown> {
  return {
    codAdministrativo: config.codAdministrativo,
    tipoSolicitacao: input.tipoSolicitacao ?? REQUEST_TYPE_AUTHORIZATION,
    data: input.data,
  };
}

export function parseTrackByDateResponse(raw: unknown): TrackResult {
  const root = asRecord(raw);
  const envelope = extractTrackEnvelope(root, 'acompanharPedidoPorData');

  if (!envelope) {
    throw new CorreiosResponseError('Unexpected Correios response for acompanharPedidoPorData', {
      raw,
    });
  }

  return { coleta: parseTrackColeta(envelope), raw };
}

export function buildCancelOrderPayload(
  config: CorreiosConfig,
  input: CancelOrderInput,
): Record<string, unknown> {
  return {
    codAdministrativo: config.codAdministrativo,
    numeroPedido: String(input.numeroPedido),
    tipo: input.tipo ?? REQUEST_TYPE_AUTHORIZATION,
  };
}

export function parseCancelOrderResponse(raw: unknown): CancelOrderResult {
  const root = asRecord(raw);
  const envelope =
    parseCancelEnvelope(root?.cancelarPedido) ??
    parseCancelEnvelope(root?.objeto_postal) ??
    parseCancelEnvelope(root);

  if (!envelope) {
    throw new CorreiosResponseError('Unexpected Correios response for cancelarPedido', { raw });
  }

  const postal = envelope.objeto_postal ?? {};
  const result: CancelOrderResult = {
    objetoPostal: envelope,
    raw: root ?? raw,
  };

  if (postal.numero_pedido) {
    result.numeroPedido = postal.numero_pedido;
  }
  if (postal.status_pedido) {
    result.statusPedido = postal.status_pedido;
  }
  if (postal.datahora_cancelamento) {
    result.datahoraCancelamento = postal.datahora_cancelamento;
  }

  return result;
}