export { CorreiosLogisticaReversaClient } from './client.js';
export type { CorreiosLogisticaReversaClientOptions } from './client.js';

export { loadConfigFromEnv, validateConfig, getWsdlUrl } from './config.js';

export {
  CorreiosError,
  CorreiosConfigError,
  CorreiosValidationError,
  CorreiosResponseError,
  CorreiosTransportError,
} from './errors.js';

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
  CancelOrderResult,
} from './types/index.js';