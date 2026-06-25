import { describe, expect, it } from 'vitest';

import { partyToSoap } from '../../src/parsers/party.js';

const baseParty = {
  nome: 'Maria Silva',
  logradouro: 'Rua A',
  numero: '10',
  bairro: 'Centro',
  cidade: 'Curitiba',
  uf: 'PR',
  cep: '80420-010',
};

describe('partyToSoap', () => {
  it('normalizes CEP and optional contact fields', () => {
    const payload = partyToSoap({
      ...baseParty,
      complemento: 'Apto 2',
      referencia: 'Portão azul',
      email: 'maria@example.com',
      ddd: '(41)',
      telefone: '9999-9999',
      dddCelular: '41',
      celular: '98888-7777',
      identificacao: '123.456.789-01',
      sms: true,
    });

    expect(payload).toMatchObject({
      cep: '80420010',
      complemento: 'Apto 2',
      referencia: 'Portão azul',
      ddd: '41',
      telefone: '99999999',
      ddd_celular: '41',
      celular: '988887777',
      identificacao: '12345678901',
      sms: 'S',
    });
  });

  it('defaults empty optional strings and skips blank digit fields', () => {
    const payload = partyToSoap({
      ...baseParty,
      cep: '---',
    });

    expect(payload.complemento).toBe('');
    expect(payload.referencia).toBe('');
    expect(payload.email).toBe('');
    expect(payload.cep).toBeUndefined();
    expect(payload).not.toHaveProperty('telefone');
    expect(payload).not.toHaveProperty('sms');
  });
});