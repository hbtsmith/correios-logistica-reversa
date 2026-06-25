import { describe, expect, it } from 'vitest';

import { CorreiosValidationError, VALIDATION_ERROR_CODES } from '../../src/errors.js';
import {
  validateCancelOrderInput,
  validateIssueAuthorizationInput,
  validateTrackByDateInput,
  validateTrackByOrderNumberInput,
} from '../../src/validation/validate-input.js';

const party = {
  nome: 'Maria Silva',
  logradouro: 'Rua A',
  numero: '10',
  bairro: 'Centro',
  cidade: 'Curitiba',
  uf: 'PR',
  cep: '80420010',
};

describe('validateIssueAuthorizationInput', () => {
  it('accepts valid input', () => {
    const input = {
      destinatario: party,
      coleta: { ag: 15, remetente: party },
    };
    expect(validateIssueAuthorizationInput(input)).toEqual(input);
  });

  it('rejects missing remetente CEP digits', () => {
    expect(() =>
      validateIssueAuthorizationInput({
        destinatario: party,
        coleta: { ag: 15, remetente: { ...party, cep: '---' } },
      }),
    ).toThrow(CorreiosValidationError);
  });

  it('throws VALIDATION_FAILED code', () => {
    try {
      validateIssueAuthorizationInput({
        destinatario: party,
        coleta: { ag: 0, remetente: party },
      });
    } catch (error) {
      expect(error).toBeInstanceOf(CorreiosValidationError);
      expect((error as CorreiosValidationError).code).toBe(VALIDATION_ERROR_CODES.VALIDATION_FAILED);
    }
  });
});

describe('validateTrackByOrderNumberInput', () => {
  it('rejects empty numeroPedido', () => {
    expect(() => validateTrackByOrderNumberInput({ numeroPedido: '' })).toThrow(CorreiosValidationError);
  });
});

describe('validateTrackByDateInput', () => {
  it('rejects invalid date format', () => {
    expect(() => validateTrackByDateInput({ data: '25/06/2026' })).toThrow(CorreiosValidationError);
  });

  it('accepts ISO date', () => {
    expect(validateTrackByDateInput({ data: '2026-06-25' })).toEqual({ data: '2026-06-25' });
  });
});

describe('validateCancelOrderInput', () => {
  it('accepts numeric numeroPedido', () => {
    expect(validateCancelOrderInput({ numeroPedido: 4638012880 })).toEqual({ numeroPedido: 4638012880 });
  });
});