export class CorreiosError extends Error {
  readonly code?: string | number | undefined;
  readonly raw?: unknown;

  constructor(message: string, options?: { code?: string | number; raw?: unknown; cause?: unknown }) {
    super(message, options?.cause ? { cause: options.cause } : undefined);
    this.name = this.constructor.name;
    if (options?.code !== undefined) {
      this.code = options.code;
    }
    if (options?.raw !== undefined) {
      this.raw = options.raw;
    }
  }
}

export class CorreiosConfigError extends CorreiosError {}

export class CorreiosValidationError extends CorreiosError {}

export class CorreiosResponseError extends CorreiosError {}

export class CorreiosTransportError extends CorreiosError {}