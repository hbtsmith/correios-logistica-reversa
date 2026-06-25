import type { CorreiosConfig } from '../types/index.js';
import {
  CorreiosTransportError,
  TRANSPORT_ERROR_CODES,
  classifySoapCallError,
} from '../errors.js';
import { getWsdlUrl } from '../config.js';
import { SOAP_OPERATIONS } from './operations.js';
import { createSoapClient } from './create-client.js';

export interface SoapTransport {
  call(method: string, args: Record<string, unknown>): Promise<unknown>;
  reset?(): void;
}

export class NodeSoapTransport implements SoapTransport {
  private clientPromise: Promise<SoapClientLike> | null = null;

  constructor(private readonly config: CorreiosConfig) {}

  async call(method: string, args: Record<string, unknown>): Promise<unknown> {
    const client = await this.getClient();
    const fn = client[method];

    if (typeof fn !== 'function') {
      throw new CorreiosTransportError(`SOAP method "${method}" is not available on WSDL client`, {
        code: TRANSPORT_ERROR_CODES.SOAP_METHOD_UNAVAILABLE,
      });
    }

    return new Promise((resolve, reject) => {
      fn(args, (error: Error | null, result: unknown) => {
        if (error) {
          reject(
            new CorreiosTransportError(`SOAP call "${method}" failed: ${error.message}`, {
              code: classifySoapCallError(error),
              cause: error,
              raw: result,
            }),
          );
          return;
        }
        resolve(result);
      });
    });
  }

  reset(): void {
    this.clientPromise = null;
  }

  private async getClient(): Promise<SoapClientLike> {
    if (!this.clientPromise) {
      this.clientPromise = createSoapClient(getWsdlUrl(this.config), this.config).catch((error) => {
        this.clientPromise = null;
        throw error;
      });
    }
    return this.clientPromise;
  }
}

export interface SoapClientLike {
  [method: string]: ((args: Record<string, unknown>, cb: (err: Error | null, res: unknown) => void) => void) | undefined;
}

export { SOAP_OPERATIONS };