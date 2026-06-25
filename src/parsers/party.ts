import type { Party } from '../types/index.js';

function digitsOnly(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  const digits = value.replace(/\D/g, '');
  return digits.length > 0 ? digits : undefined;
}

export interface PartyToSoapOptions {
  /** Correios accepts `sms` only on remetente, not destinatario. */
  includeSms?: boolean;
}

export function partyToSoap(party: Party, options?: PartyToSoapOptions): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    nome: party.nome,
    logradouro: party.logradouro,
    numero: party.numero,
    complemento: party.complemento ?? '',
    bairro: party.bairro,
    cidade: party.cidade,
    uf: party.uf,
    cep: digitsOnly(party.cep),
    referencia: party.referencia ?? '',
    email: party.email ?? '',
  };

  const ddd = digitsOnly(party.ddd);
  const telefone = digitsOnly(party.telefone);
  const dddCelular = digitsOnly(party.dddCelular);
  const celular = digitsOnly(party.celular);
  const identificacao = digitsOnly(party.identificacao);

  if (ddd) payload.ddd = ddd;
  if (telefone) payload.telefone = telefone;
  if (dddCelular) payload.ddd_celular = dddCelular;
  if (celular) payload.celular = celular;
  if (identificacao) payload.identificacao = identificacao;
  if (options?.includeSms && party.sms) {
    payload.sms = 'S';
  }

  return payload;
}