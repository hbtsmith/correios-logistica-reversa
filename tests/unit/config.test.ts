import { describe, expect, it } from 'vitest';

import { loadConfigFromEnv, validateConfig } from '../../src/config.js';
import { CorreiosConfigError } from '../../src/errors.js';
import { WSDL_LOGISTICA_REVERSA_HOMOLOGATION } from '../../src/constants.js';

describe('loadConfigFromEnv', () => {
  it('loads valid homologation config from env', () => {
    const config = loadConfigFromEnv({
      CORREIOS_ENV: 'homologation',
      CORREIOS_USUARIO: 'empresacws',
      CORREIOS_SENHA: '123456',
      CORREIOS_COD_ADMINISTRATIVO: '17000190',
      CORREIOS_CARTAO_POSTAGEM: '0067599079',
      CORREIOS_NUMERO_CONTRATO: '9992157880',
      CORREIOS_CNPJ: '34028316000103',
      CORREIOS_CODIGO_SERVICO: '04677',
    });

    expect(config.environment).toBe('homologation');
    expect(config.usuario).toBe('empresacws');
    expect(config.wsdlUrl).toBe(WSDL_LOGISTICA_REVERSA_HOMOLOGATION);
    expect(config.timeoutMs).toBe(180_000);
  });

  it('throws when required env vars are missing', () => {
    expect(() => loadConfigFromEnv({ CORREIOS_ENV: 'production' })).toThrow(CorreiosConfigError);
  });

  it('rejects invalid environment', () => {
    expect(() =>
      loadConfigFromEnv({
        CORREIOS_ENV: 'staging',
        CORREIOS_USUARIO: 'u',
        CORREIOS_SENHA: 'p',
        CORREIOS_COD_ADMINISTRATIVO: '1',
        CORREIOS_CARTAO_POSTAGEM: '2',
        CORREIOS_NUMERO_CONTRATO: '3',
        CORREIOS_CNPJ: '34028316000103',
      }),
    ).toThrow(CorreiosConfigError);
  });
});

describe('validateConfig', () => {
  it('accepts programmatic config', () => {
    const config = validateConfig({
      environment: 'production',
      usuario: 'user',
      senha: 'pass',
      codAdministrativo: '17000190',
      cartaoPostagem: '0067599079',
      numeroContrato: '9992157880',
      cnpjEmpresa: '34028316000103',
      codigoServico: '04170',
    });

    expect(config.codigoServico).toBe('04170');
    expect(config.rejectUnauthorized).toBe(true);
  });
});