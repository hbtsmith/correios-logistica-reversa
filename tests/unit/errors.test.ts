import { describe, expect, it } from 'vitest';

import {
  CorreiosConfigError,
  CorreiosError,
  CorreiosResponseError,
  CorreiosTransportError,
  CorreiosValidationError,
} from '../../src/errors.js';

describe('CorreiosError hierarchy', () => {
  it('stores code, raw, and cause on base error', () => {
    const cause = new Error('network');
    const error = new CorreiosError('failed', { code: 'E1', raw: { x: 1 }, cause });

    expect(error.name).toBe('CorreiosError');
    expect(error.message).toBe('failed');
    expect(error.code).toBe('E1');
    expect(error.raw).toEqual({ x: 1 });
    expect(error.cause).toBe(cause);
  });

  it('omits optional fields when not provided', () => {
    const error = new CorreiosError('minimal');

    expect(error.code).toBeUndefined();
    expect(error.raw).toBeUndefined();
  });

  it('exposes typed subclasses', () => {
    expect(new CorreiosConfigError('cfg')).toBeInstanceOf(CorreiosError);
    expect(new CorreiosValidationError('val')).toBeInstanceOf(CorreiosError);
    expect(new CorreiosResponseError('res')).toBeInstanceOf(CorreiosError);
    expect(new CorreiosTransportError('tr')).toBeInstanceOf(CorreiosError);
  });
});