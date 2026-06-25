import { describe, expect, it } from 'vitest';

import * as pkg from '../../src/index.js';

describe('public package exports', () => {
  it('re-exports client, config helpers, errors, and constants', () => {
    expect(pkg.CorreiosLogisticaReversaClient).toBeTypeOf('function');
    expect(pkg.loadConfigFromEnv).toBeTypeOf('function');
    expect(pkg.validateConfig).toBeTypeOf('function');
    expect(pkg.getWsdlUrl).toBeTypeOf('function');
    expect(pkg.CorreiosError).toBeTypeOf('function');
    expect(pkg.CorreiosConfigError).toBeTypeOf('function');
    expect(pkg.WSDL_LOGISTICA_REVERSA_HOMOLOGATION).toContain('https://');
    expect(pkg.SERVICE_CODE_PAC_REVERSO).toBe('04677');
    expect(pkg.DEFAULT_TIMEOUT_MS).toBeGreaterThan(0);
  });
});