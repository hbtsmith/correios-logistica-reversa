export const WSDL_LOGISTICA_REVERSA_PRODUCTION =
  'https://cws.correios.com.br/logisticaReversaWS/logisticaReversaService/logisticaReversaWS?wsdl';

export const WSDL_LOGISTICA_REVERSA_HOMOLOGATION =
  'https://apphom.correios.com.br/logisticaReversaWS/logisticaReversaService/logisticaReversaWS?wsdl';

export const DEFAULT_TIMEOUT_MS = 180_000;

export const SERVICE_CODE_PAC_REVERSO = '04677';
export const SERVICE_CODE_SEDEX_REVERSO = '04170';

export const REQUEST_TYPE_AUTHORIZATION = 'A' as const;
export const SEARCH_TYPE_HISTORY = 'H' as const;