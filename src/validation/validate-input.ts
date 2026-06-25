import type { ZodError } from 'zod';

import { CorreiosValidationError, VALIDATION_ERROR_CODES } from '../errors.js';
import type {
  CancelOrderInput,
  IssueAuthorizationInput,
  TrackByDateInput,
  TrackByOrderNumberInput,
} from '../types/index.js';
import {
  cancelOrderInputSchema,
  issueAuthorizationInputSchema,
  trackByDateInputSchema,
  trackByOrderNumberInputSchema,
} from './schemas.js';

function formatZodError(error: ZodError): string {
  return error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
}

function assertValid<T>(label: string, result: { success: true; data: T } | { success: false; error: ZodError }): T {
  if (!result.success) {
    throw new CorreiosValidationError(`Invalid ${label}: ${formatZodError(result.error)}`, {
      code: VALIDATION_ERROR_CODES.VALIDATION_FAILED,
      raw: result.error.issues,
    });
  }
  return result.data;
}

export function validateIssueAuthorizationInput(input: IssueAuthorizationInput): IssueAuthorizationInput {
  return assertValid(
    'issue authorization input',
    issueAuthorizationInputSchema.safeParse(input),
  ) as IssueAuthorizationInput;
}

export function validateTrackByOrderNumberInput(input: TrackByOrderNumberInput): TrackByOrderNumberInput {
  return assertValid(
    'track by order number input',
    trackByOrderNumberInputSchema.safeParse(input),
  ) as TrackByOrderNumberInput;
}

export function validateTrackByDateInput(input: TrackByDateInput): TrackByDateInput {
  return assertValid('track by date input', trackByDateInputSchema.safeParse(input)) as TrackByDateInput;
}

export function validateCancelOrderInput(input: CancelOrderInput): CancelOrderInput {
  return assertValid('cancel order input', cancelOrderInputSchema.safeParse(input)) as CancelOrderInput;
}