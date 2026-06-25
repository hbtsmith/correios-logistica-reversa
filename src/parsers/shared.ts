/** Shared SOAP response parsing utilities. */

export function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

/** Unwrap first element when Correios returns an array (common in production). */
export function normalizeSoapResult(value: unknown): Record<string, unknown> | null {
  if (Array.isArray(value) && value.length > 0) {
    return asRecord(value[0]);
  }
  return asRecord(value);
}

export function pickString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  if (value === undefined || value === null) {
    return undefined;
  }
  return String(value);
}