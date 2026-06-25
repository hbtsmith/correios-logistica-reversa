import { REQUEST_TYPE_AUTHORIZATION, SEARCH_TYPE_HISTORY } from '../constants.js';
import { CorreiosResponseError } from '../errors.js';
import type {
  CorreiosConfig,
  CancelOrderInput,
  CancelOrderResult,
  TrackByDateInput,
  TrackByOrderNumberInput,
  TrackResult,
} from '../types/index.js';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object') {
    return value as Record<string, unknown>;
  }
  return null;
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
  const coleta = root?.acompanharPedido ?? root?.coleta ?? root;

  if (!coleta) {
    throw new CorreiosResponseError('Unexpected Correios response for acompanharPedido', { raw });
  }

  return { coleta, raw };
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
  const coleta = root?.acompanharPedidoPorData ?? root?.coleta ?? root;

  if (!coleta) {
    throw new CorreiosResponseError('Unexpected Correios response for acompanharPedidoPorData', {
      raw,
    });
  }

  return { coleta, raw };
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
  const objetoPostal = root?.cancelarPedido ?? root?.objeto_postal ?? root;

  if (!objetoPostal) {
    throw new CorreiosResponseError('Unexpected Correios response for cancelarPedido', { raw });
  }

  return { objetoPostal, raw };
}