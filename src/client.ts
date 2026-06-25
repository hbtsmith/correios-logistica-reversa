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

export class CorreiosLogisticaReversaClient {
  private readonly config: CorreiosConfig;
  private readonly transport: SoapTransport;

  constructor(options: CorreiosLogisticaReversaClientOptions) {
    this.config = validateConfig(options.config);
    this.transport = options.transport ?? new NodeSoapTransport(this.config);
  }

  async issueAuthorization(input: IssueAuthorizationInput): Promise<IssueAuthorizationResult> {
    const payload = buildIssueAuthorizationPayload(this.config, input);
    const raw = await this.transport.call('solicitarPostagemReversa', payload);
    return parseIssueAuthorizationResponse(raw);
  }

  async trackByOrderNumber(input: TrackByOrderNumberInput): Promise<TrackResult> {
    const payload = buildTrackByOrderNumberPayload(this.config, input);
    const raw = await this.transport.call('acompanharPedido', payload);
    return parseTrackByOrderNumberResponse(raw);
  }

  async trackByDate(input: TrackByDateInput): Promise<TrackResult> {
    const payload = buildTrackByDatePayload(this.config, input);
    const raw = await this.transport.call('acompanharPedidoPorData', payload);
    return parseTrackByDateResponse(raw);
  }

  async cancelOrder(input: CancelOrderInput): Promise<CancelOrderResult> {
    const payload = buildCancelOrderPayload(this.config, input);
    const raw = await this.transport.call('cancelarPedido', payload);
    return parseCancelOrderResponse(raw);
  }
}