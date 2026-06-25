import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClientAsync, BasicAuthSecurity } = vi.hoisted(() => ({
  createClientAsync: vi.fn(),
  BasicAuthSecurity: vi.fn(),
}));

vi.mock('soap', () => ({
  default: {
    createClientAsync,
    BasicAuthSecurity,
  },
}));

import { createSoapClient } from '../../src/soap/create-client.js';
import { CorreiosTransportError } from '../../src/errors.js';
import type { CorreiosConfig } from '../../src/types/index.js';

const config: CorreiosConfig = {
  environment: 'homologation',
  usuario: 'empresacws',
  senha: '123456',
  codAdministrativo: '17000190',
  cartaoPostagem: '0067599079',
  numeroContrato: '9992157880',
  cnpjEmpresa: '34028316000103',
  codigoServico: '04677',
  timeoutMs: 30_000,
  rejectUnauthorized: false,
};

describe('createSoapClient', () => {
  beforeEach(() => {
    createClientAsync.mockReset();
    BasicAuthSecurity.mockReset();
  });

  it('creates client with auth and returns SOAP client', async () => {
    const mockClient = { setSecurity: vi.fn() };
    createClientAsync.mockResolvedValue(mockClient);

    const client = await createSoapClient('https://example.test/wsdl', config);

    expect(createClientAsync).toHaveBeenCalledWith('https://example.test/wsdl', {
      wsdl_options: {
        timeout: 30_000,
        rejectUnauthorized: false,
      },
    });
    expect(BasicAuthSecurity).toHaveBeenCalledWith('empresacws', '123456');
    expect(mockClient.setSecurity).toHaveBeenCalled();
    expect(client).toBe(mockClient);
  });

  it('wraps WSDL creation failures as CorreiosTransportError', async () => {
    createClientAsync.mockRejectedValue(new Error('ENOTFOUND'));

    await expect(createSoapClient('https://bad.test/wsdl', config)).rejects.toMatchObject({
      name: 'CorreiosTransportError',
      message: expect.stringContaining('Failed to create SOAP client'),
    });
    await expect(createSoapClient('https://bad.test/wsdl', config)).rejects.toBeInstanceOf(
      CorreiosTransportError,
    );
  });
});