import { z } from 'zod';

import {
  SERVICE_CODE_PAC_REVERSO,
  WSDL_LOGISTICA_REVERSA_HOMOLOGATION,
  WSDL_LOGISTICA_REVERSA_PRODUCTION,
  DEFAULT_TIMEOUT_MS,
} from './constants.js';
import { CorreiosConfigError } from './errors.js';
import type { CorreiosConfig, CorreiosEnvironment } from './types/index.js';

const environmentSchema = z.enum(['production', 'homologation']);

const configSchema = z.object({
  environment: environmentSchema,
  usuario: z.string().min(1),
  senha: z.string().min(1),
  codAdministrativo: z.string().min(1),
  cartaoPostagem: z.string().min(1),
  numeroContrato: z.string().min(1),
  cnpjEmpresa: z.string().min(11),
  codigoServico: z.string().min(1),
  wsdlUrl: z.string().url().optional(),
  timeoutMs: z.number().int().positive().optional(),
  rejectUnauthorized: z.boolean().optional(),
});

function parseEnvironment(value: string | undefined): CorreiosEnvironment {
  const normalized = (value ?? 'homologation').trim().toLowerCase();
  if (normalized === 'production' || normalized === 'prod') {
    return 'production';
  }
  if (normalized === 'homologation' || normalized === 'homolog' || normalized === 'development') {
    return 'homologation';
  }
  throw new CorreiosConfigError(
    `Invalid CORREIOS_ENV "${value}". Use "production" or "homologation".`,
  );
}

function resolveWsdlUrl(environment: CorreiosEnvironment, override?: string): string {
  if (override) {
    return override;
  }
  return environment === 'production'
    ? WSDL_LOGISTICA_REVERSA_PRODUCTION
    : WSDL_LOGISTICA_REVERSA_HOMOLOGATION;
}

export function validateConfig(input: CorreiosConfig): CorreiosConfig {
  const parsed = configSchema.safeParse(input);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new CorreiosConfigError(`Invalid Correios configuration: ${details}`);
  }

  return {
    ...parsed.data,
    wsdlUrl: resolveWsdlUrl(parsed.data.environment, parsed.data.wsdlUrl),
    timeoutMs: parsed.data.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    rejectUnauthorized: parsed.data.rejectUnauthorized ?? true,
  };
}

/**
 * Build {@link CorreiosConfig} from environment variables.
 *
 * Required: `CORREIOS_ENV`, `CORREIOS_USUARIO`, `CORREIOS_SENHA`,
 * `CORREIOS_COD_ADMINISTRATIVO`, `CORREIOS_CARTAO_POSTAGEM`,
 * `CORREIOS_NUMERO_CONTRATO`, `CORREIOS_CNPJ`, `CORREIOS_CODIGO_SERVICO`.
 *
 * Does not load `.env` files — populate `process.env` in the host app first.
 *
 * @throws {CorreiosConfigError} when required vars are missing or invalid
 * @see docs/API.md
 */
export function loadConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): CorreiosConfig {
  const environment = parseEnvironment(env.CORREIOS_ENV);

  const draft: CorreiosConfig = {
    environment,
    usuario: env.CORREIOS_USUARIO ?? '',
    senha: env.CORREIOS_SENHA ?? '',
    codAdministrativo: env.CORREIOS_COD_ADMINISTRATIVO ?? '',
    cartaoPostagem: env.CORREIOS_CARTAO_POSTAGEM ?? '',
    numeroContrato: env.CORREIOS_NUMERO_CONTRATO ?? '',
    cnpjEmpresa: env.CORREIOS_CNPJ ?? '',
    codigoServico: env.CORREIOS_CODIGO_SERVICO ?? SERVICE_CODE_PAC_REVERSO,
    ...(env.CORREIOS_WSDL_URL ? { wsdlUrl: env.CORREIOS_WSDL_URL } : {}),
    ...(env.CORREIOS_TIMEOUT_MS
      ? { timeoutMs: Number.parseInt(env.CORREIOS_TIMEOUT_MS, 10) }
      : {}),
    ...(env.CORREIOS_REJECT_UNAUTHORIZED
      ? { rejectUnauthorized: env.CORREIOS_REJECT_UNAUTHORIZED !== 'false' }
      : {}),
  };

  return validateConfig(draft);
}

export function getWsdlUrl(config: CorreiosConfig): string {
  return resolveWsdlUrl(config.environment, config.wsdlUrl);
}