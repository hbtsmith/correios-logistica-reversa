import type { IssueAuthorizationResult } from './types/index.js';

export function isIssueSuccess(
  result: IssueAuthorizationResult,
): result is IssueAuthorizationResult & { numeroColeta: string } {
  return Boolean(result.numeroColeta);
}

export function isCorreiosBusinessError(result: IssueAuthorizationResult): boolean {
  if (result.codigoErro === undefined || result.codigoErro === null) {
    return false;
  }
  return String(result.codigoErro) !== '0';
}