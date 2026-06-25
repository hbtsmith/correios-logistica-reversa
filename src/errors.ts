export const TRANSPORT_ERROR_CODES = {
  WSDL_UNAUTHORIZED: 'WSDL_UNAUTHORIZED',
  WSDL_CREATE_FAILED: 'WSDL_CREATE_FAILED',
  SOAP_METHOD_UNAVAILABLE: 'SOAP_METHOD_UNAVAILABLE',
  SOAP_FAULT: 'SOAP_FAULT',
  SOAP_CALL_FAILED: 'SOAP_CALL_FAILED',
} as const;

export type TransportErrorCode = (typeof TRANSPORT_ERROR_CODES)[keyof typeof TRANSPORT_ERROR_CODES];

export const VALIDATION_ERROR_CODES = {
  VALIDATION_FAILED: 'VALIDATION_FAILED',
} as const;

export class CorreiosError extends Error {
  readonly code?: string | number | undefined;
  readonly raw?: unknown;

  constructor(message: string, options?: { code?: string | number; raw?: unknown; cause?: unknown }) {
    super(message, options?.cause ? { cause: options.cause } : undefined);
    this.name = this.constructor.name;
    if (options?.code !== undefined) {
      this.code = options.code;
    }
    if (options?.raw !== undefined) {
      this.raw = options.raw;
    }
  }
}

export class CorreiosConfigError extends CorreiosError {}

export class CorreiosValidationError extends CorreiosError {}

export class CorreiosResponseError extends CorreiosError {}

export class CorreiosTransportError extends CorreiosError {}

export function classifyWsdlError(error: unknown): TransportErrorCode {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('401') || message.includes('Unauthorized')) {
    return TRANSPORT_ERROR_CODES.WSDL_UNAUTHORIZED;
  }
  return TRANSPORT_ERROR_CODES.WSDL_CREATE_FAILED;
}

export function classifySoapCallError(error: Error): TransportErrorCode {
  const message = error.message;
  if (message.includes('soap:Client') || message.includes('soap:Server') || message.includes('Unmarshalling')) {
    return TRANSPORT_ERROR_CODES.SOAP_FAULT;
  }
  return TRANSPORT_ERROR_CODES.SOAP_CALL_FAILED;
}