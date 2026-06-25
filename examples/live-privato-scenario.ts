/**
 * Live spike: emitir logística reversa com cenário Privato/Herbert.
 *
 * Usage (from repo root):
 *   npx tsx examples/live-privato-scenario.ts
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { CorreiosLogisticaReversaClient, loadConfigFromEnv } from '../src/index.js';

function loadDotEnv(filePath: string): void {
  const content = readFileSync(filePath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

async function main(): Promise<void> {
  loadDotEnv(resolve(import.meta.dirname, '../.env'));

  const config = loadConfigFromEnv();
  const client = new CorreiosLogisticaReversaClient({ config });

  console.log('Ambiente:', config.environment);
  console.log('Serviço:', config.codigoServico);
  console.log('Enviando solicitarPostagemReversa...\n');

  const result = await client.issueAuthorization({
    destinatario: {
      nome: 'Privato',
      logradouro: 'Rod. José Carlos Daux',
      numero: '5025B',
      complemento: 'LJ-21',
      referencia: 'Business-Decor',
      cidade: 'Florianopolis',
      uf: 'SC',
      cep: '88032005',
      bairro: 'Saco Grande',
      dddCelular: '48',
      celular: '996146030',
      email: 'contabilidade@privato.com.br',
      identificacao: '14826185000100',
      sms: true,
    },
    coleta: {
      tipo: 'A',
      ag: 15,
      servicoAdicional: '',
      ar: 0,
      remetente: {
        nome: 'Herbert Vieira da Silva',
        logradouro: 'Av. Oscar Niemeyer',
        numero: '72',
        complemento: 'Casa',
        referencia: '',
        cidade: 'Ampere',
        uf: 'PR',
        cep: '85640000',
        bairro: 'Floresta',
        dddCelular: '48',
        celular: '996662015',
        email: 'hbt.vieira@gmail.com',
        identificacao: '70832846287',
        sms: true,
      },
      objCol: {
        id: '',
        num: '',
        entrega: '',
        item: 1,
        desc: '',
      },
    },
  });

  console.log('--- Resposta parseada ---');
  console.log(JSON.stringify(result, null, 2));

  if (result.numeroColeta) {
    console.log('\n✓ Autorização emitida. Número do pedido:', result.numeroColeta);
  } else if (result.codigoErro) {
    console.log('\n✗ Correios retornou erro de negócio:', result.codigoErro, result.descricaoErro);
    process.exitCode = 2;
  }
}

main().catch((error: unknown) => {
  console.error('\n--- Falha de transporte / exceção ---');
  console.error(error);
  process.exit(1);
});