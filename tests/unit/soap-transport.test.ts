import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/soap/create-client.js', () => ({
  createSoapClient: vi.fn(),
}));

import { createSoapClient } from '../../src/soap/create-client.js';
import { CorreiosTransportError } from '../../src/errors.js';
import { NodeSoapTransport } from '../../src/soap/transport.js';
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
};

describe('NodeSoapTransport', () => {
  beforeEach(() => {
    vi.mocked(createSoapClient).mockReset();
  });

  it('invokes SOAP method and resolves callback result', async () => {
    const soapMethod = vi.fn((_args: Record<string, unknown>, cb: (err: Error | null, res: unknown) => void) => {
      cb(null, { ok: true });
    });
    vi.mocked(createSoapClient).mockResolvedValue({ solicitarPostagemReversa: soapMethod });

    const transport = new NodeSoapTransport(config);
    const result = await transport.call('solicitarPostagemReversa', { cartao: '1' });

    expect(result).toEqual({ ok: true });
    expect(soapMethod).toHaveBeenCalledWith({ cartao: '1' }, expect.any(Function));
  });

  it('rejects when SOAP method is missing on client', async () => {
    vi.mocked(createSoapClient).mockResolvedValue({});

    const transport = new NodeSoapTransport(config);

    await expect(transport.call('unknownMethod', {})).rejects.toMatchObject({
      name: 'CorreiosTransportError',
      message: expect.stringContaining('unknownMethod'),
    });
  });

  it('wraps SOAP callback errors as CorreiosTransportError', async () => {
    const soapMethod = vi.fn((_args: Record<string, unknown>, cb: (err: Error | null, res: unknown) => void) => {
      cb(new Error('timeout'), null);
    });
    vi.mocked(createSoapClient).mockResolvedValue({ acompanharPedido: soapMethod });

    const transport = new NodeSoapTransport(config);

    await expect(transport.call('acompanharPedido', {})).rejects.toBeInstanceOf(CorreiosTransportError);
    await expect(transport.call('acompanharPedido', {})).rejects.toThrow(/timeout/);
  });

  it('reuses the same SOAP client across calls', async () => {
    const soapMethod = vi.fn((_args: Record<string, unknown>, cb: (err: Error | null, res: unknown) => void) => {
      cb(null, {});
    });
    vi.mocked(createSoapClient).mockResolvedValue({ cancelarPedido: soapMethod });

    const transport = new NodeSoapTransport(config);
    await transport.call('cancelarPedido', { numeroPedido: '1' });
    await transport.call('cancelarPedido', { numeroPedido: '2' });

    expect(createSoapClient).toHaveBeenCalledTimes(1);
    expect(soapMethod).toHaveBeenCalledTimes(2);
  });
});