/**
 * Cancela autorização de logística reversa emitida em produção.
 *
 * Usage:
 *   npx tsx examples/live-cancel-scenario.ts [numeroPedido]
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

  const numeroPedido = process.argv[2] ?? '4638012880';
  const config = loadConfigFromEnv();
  const client = new CorreiosLogisticaReversaClient({ config });

  console.log('Ambiente:', config.environment);
  console.log('Cancelando pedido:', numeroPedido, '\n');

  const result = await client.cancelOrder({ numeroPedido });

  console.log('--- Resposta parseada ---');
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error: unknown) => {
  console.error('\n--- Falha ---');
  console.error(error);
  process.exit(1);
});