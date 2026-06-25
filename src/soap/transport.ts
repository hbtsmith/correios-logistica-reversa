import type { CorreiosConfig } from '../types/index.js';
import { CorreiosTransportError } from '../errors.js';
import { getWsdlUrl } from '../config.js';
import { createSoapClient } from './create-client.js';

export interface SoapTransport {
  call(method: string, args: Record<string, unknown>): Promise<unknown>;
}

export class NodeSoapTransport implements SoapTransport {
  private clientPromise: Promise<SoapClientLike> | null = null;

  constructor(private readonly config: CorreiosConfig) {}

  async call(method: string, args: Record<string, unknown>): Promise<unknown> {
    const client = await this.getClient();
    const fn = client[method];

    if (typeof fn !== 'function') {
      throw new CorreiosTransportError(`SOAP method "${method}" is not available on WSDL client`);
    }

    return new Promise((resolve, reject) => {
      fn(args, (error: Error | null, result: unknown) => {
        if (error) {
          reject(
            new CorreiosTransportError(`SOAP call "${method}" failed: ${error.message}`, {
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

  private async getClient(): Promise<SoapClientLike> {
    if (!this.clientPromise) {
      this.clientPromise = createSoapClient(getWsdlUrl(this.config), this.config);
    }
    return this.clientPromise;
  }
}

export interface SoapClientLike {
  [method: string]: ((args: Record<string, unknown>, cb: (err: Error | null, res: unknown) => void) => void) | undefined;
}