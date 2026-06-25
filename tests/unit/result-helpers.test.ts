import { describe, expect, it } from 'vitest';

import { isCorreiosBusinessError, isIssueSuccess } from '../../src/result-helpers.js';

describe('result helpers', () => {
  it('detects issue success', () => {
    expect(isIssueSuccess({ numeroColeta: '1', raw: {} })).toBe(true);
    expect(isIssueSuccess({ codigoErro: 109, raw: {} })).toBe(false);
  });

  it('detects Correios business error', () => {
    expect(isCorreiosBusinessError({ codigoErro: 109, raw: {} })).toBe(true);
    expect(isCorreiosBusinessError({ codigoErro: '0', raw: {} })).toBe(false);
    expect(isCorreiosBusinessError({ numeroColeta: '1', raw: {} })).toBe(false);
  });
});