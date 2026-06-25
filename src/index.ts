export { CorreiosLogisticaReversaClient } from './client.js';
export type { CorreiosLogisticaReversaClientOptions } from './client.js';

export { loadConfigFromEnv, validateConfig, getWsdlUrl } from './config.js';

export {
  CorreiosError,
  CorreiosConfigError,
  CorreiosValidationError,
  CorreiosResponseError,
  CorreiosTransportError,
  TRANSPORT_ERROR_CODES,
  VALIDATION_ERROR_CODES,
} from './errors.js';
export type { TransportErrorCode } from './errors.js';

export { isIssueSuccess, isCorreiosBusinessError } from './result-helpers.js';

export { SOAP_OPERATIONS } from './soap/operations.js';
export type { SoapOperation } from './soap/operations.js';
export type { SoapTransport } from './soap/transport.js';

export {
  WSDL_LOGISTICA_REVERSA_PRODUCTION,
  WSDL_LOGISTICA_REVERSA_HOMOLOGATION,
  SERVICE_CODE_PAC_REVERSO,
  SERVICE_CODE_SEDEX_REVERSO,
  DEFAULT_TIMEOUT_MS,
} from './constants.js';

export type {
  CorreiosConfig,
  CorreiosEnvironment,
  Party,
  CollectionRequest,
  CollectionItem,
  IssueAuthorizationInput,
  IssueAuthorizationResult,
  TrackByOrderNumberInput,
  TrackByDateInput,
  CancelOrderInput,
  TrackResult,
  TrackColetaEntry,
  CancelOrderResult,
  CancelOrderPayload,
  CancelPostalObject,
} from './types/index.js';