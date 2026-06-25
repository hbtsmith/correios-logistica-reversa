import soap from 'soap';

import type { CorreiosConfig } from '../types/index.js';
import { CorreiosTransportError } from '../errors.js';
import type { SoapClientLike } from './transport.js';

export async function createSoapClient(
  wsdlUrl: string,
  config: CorreiosConfig,
): Promise<SoapClientLike> {
  try {
    const client = await soap.createClientAsync(wsdlUrl, {
      wsdl_options: {
        timeout: config.timeoutMs,
        rejectUnauthorized: config.rejectUnauthorized ?? true,
      },
    });

    client.setSecurity(new soap.BasicAuthSecurity(config.usuario, config.senha));

    return client as SoapClientLike;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new CorreiosTransportError(`Failed to create SOAP client for ${wsdlUrl}: ${message}`, {
      cause: error,
    });
  }
}