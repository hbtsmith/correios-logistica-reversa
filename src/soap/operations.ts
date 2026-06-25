/** SOAP method names on Logística Reversa WSDL (no Async suffix). */
export const SOAP_OPERATIONS = {
  issueAuthorization: 'solicitarPostagemReversa',
  trackByOrderNumber: 'acompanharPedido',
  trackByDate: 'acompanharPedidoPorData',
  cancelOrder: 'cancelarPedido',
} as const;

export type SoapOperation = (typeof SOAP_OPERATIONS)[keyof typeof SOAP_OPERATIONS];