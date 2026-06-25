import { validateConfig } from './config.js';
import {
  buildCancelOrderPayload,
  buildTrackByDatePayload,
  buildTrackByOrderNumberPayload,
  parseCancelOrderResponse,
  parseTrackByDateResponse,
  parseTrackByOrderNumberResponse,
} from './parsers/track.js';
import {
  buildIssueAuthorizationPayload,
  parseIssueAuthorizationResponse,
} from './parsers/issue-authorization.js';
import { NodeSoapTransport, type SoapTransport } from './soap/transport.js';
import type {
  CancelOrderInput,
  CancelOrderResult,
  CorreiosConfig,
  IssueAuthorizationInput,
  IssueAuthorizationResult,
  TrackByDateInput,
  TrackByOrderNumberInput,
  TrackResult,
} from './types/index.js';

export interface CorreiosLogisticaReversaClientOptions {
  config: CorreiosConfig;
  transport?: SoapTransport;
}

/**
 * Correios Logística Reversa SOAP client.
 *
 * @example
 * ```ts
 * const client = new CorreiosLogisticaReversaClient({ config: loadConfigFromEnv() });
 * const result = await client.issueAuthorization({ destinatario, coleta });
 * ```
 *
 * @see docs/API.md — full integration reference
 */
export class CorreiosLogisticaReversaClient {
  private readonly config: CorreiosConfig;
  private readonly transport: SoapTransport;

  constructor(options: CorreiosLogisticaReversaClientOptions) {
    this.config = validateConfig(options.config);
    this.transport = options.transport ?? new NodeSoapTransport(this.config);
  }

  /**
   * Create a reverse logistics authorization (SOAP: solicitarPostagemReversa).
   *
   * Success: `result.numeroColeta` is set. Business errors: `result.codigoErro` (not thrown).
   *
   * @param input.destinatario — company receiving the return
   * @param input.coleta.remetente — customer posting at Correios
   * @param input.coleta.ag — validity days for posting (e.g. 15)
   */
  async issueAuthorization(input: IssueAuthorizationInput): Promise<IssueAuthorizationResult> {
    const payload = buildIssueAuthorizationPayload(this.config, input);
    const raw = await this.transport.call('solicitarPostagemReversa', payload);
    return parseIssueAuthorizationResponse(raw);
  }

  /**
   * Track one authorization by order number (SOAP: acompanharPedido).
   *
   * @param input.numeroPedido — value from `issueAuthorization().numeroColeta`
   */
  async trackByOrderNumber(input: TrackByOrderNumberInput): Promise<TrackResult> {
    const payload = buildTrackByOrderNumberPayload(this.config, input);
    const raw = await this.transport.call('acompanharPedido', payload);
    return parseTrackByOrderNumberResponse(raw);
  }

  /**
   * List authorizations for a date (SOAP: acompanharPedidoPorData).
   *
   * @param input.data — `YYYY-MM-DD`
   */
  async trackByDate(input: TrackByDateInput): Promise<TrackResult> {
    const payload = buildTrackByDatePayload(this.config, input);
    const raw = await this.transport.call('acompanharPedidoPorData', payload);
    return parseTrackByDateResponse(raw);
  }

  /**
   * Cancel an open authorization (SOAP: cancelarPedido).
   *
   * @param input.numeroPedido — `numeroColeta` from issueAuthorization
   */
  async cancelOrder(input: CancelOrderInput): Promise<CancelOrderResult> {
    const payload = buildCancelOrderPayload(this.config, input);
    const raw = await this.transport.call('cancelarPedido', payload);
    return parseCancelOrderResponse(raw);
  }
}