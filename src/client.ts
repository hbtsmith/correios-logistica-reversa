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
import { NodeSoapTransport, SOAP_OPERATIONS, type SoapTransport } from './soap/transport.js';
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
import {
  validateCancelOrderInput,
  validateIssueAuthorizationInput,
  validateTrackByDateInput,
  validateTrackByOrderNumberInput,
} from './validation/validate-input.js';

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
   * @throws {CorreiosValidationError} when input fails Zod validation
   */
  async issueAuthorization(input: IssueAuthorizationInput): Promise<IssueAuthorizationResult> {
    const validated = validateIssueAuthorizationInput(input);
    const payload = buildIssueAuthorizationPayload(this.config, validated);
    const raw = await this.transport.call(SOAP_OPERATIONS.issueAuthorization, payload);
    return parseIssueAuthorizationResponse(raw);
  }

  /**
   * Track one authorization by order number (SOAP: acompanharPedido).
   *
   * @throws {CorreiosValidationError} when input fails Zod validation
   */
  async trackByOrderNumber(input: TrackByOrderNumberInput): Promise<TrackResult> {
    const validated = validateTrackByOrderNumberInput(input);
    const payload = buildTrackByOrderNumberPayload(this.config, validated);
    const raw = await this.transport.call(SOAP_OPERATIONS.trackByOrderNumber, payload);
    return parseTrackByOrderNumberResponse(raw);
  }

  /**
   * List authorizations for a date (SOAP: acompanharPedidoPorData).
   *
   * @throws {CorreiosValidationError} when input fails Zod validation
   */
  async trackByDate(input: TrackByDateInput): Promise<TrackResult> {
    const validated = validateTrackByDateInput(input);
    const payload = buildTrackByDatePayload(this.config, validated);
    const raw = await this.transport.call(SOAP_OPERATIONS.trackByDate, payload);
    return parseTrackByDateResponse(raw);
  }

  /**
   * Cancel an open authorization (SOAP: cancelarPedido).
   *
   * @throws {CorreiosValidationError} when input fails Zod validation
   */
  async cancelOrder(input: CancelOrderInput): Promise<CancelOrderResult> {
    const validated = validateCancelOrderInput(input);
    const payload = buildCancelOrderPayload(this.config, validated);
    const raw = await this.transport.call(SOAP_OPERATIONS.cancelOrder, payload);
    return parseCancelOrderResponse(raw);
  }
}