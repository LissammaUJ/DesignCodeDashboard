import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ApiErrorResponse } from '../models/api.models';

export function handleApiError(error: HttpErrorResponse): Observable<never> {
  const apiError = error.error as ApiErrorResponse | undefined;
  const message =
    apiError?.message ||
    error.message ||
    'An unexpected error occurred while calling the API.';

  console.error('[API Error]', {
    status: error.status,
    message,
    url: error.url,
    details: apiError?.details,
  });

  return throwError(() => ({
    status: error.status,
    message,
    details: apiError?.details ?? null,
  }));
}

/** Local calendar date YYYY-MM-DD (avoids UTC timezone shift). */
export function toIsoDate(value: Date | string): string {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.includes('T') ? trimmed.split('T')[0] : trimmed;
  }
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new Error('Invalid date value for API filter.');
  }
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, '0');
  const d = String(value.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Resolve AccountId from PrimeNG select (string | number | { value }). */
export function resolveAccountId(raw: unknown): number | undefined {
  if (raw == null || raw === '') return undefined;
  if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) return Math.trunc(raw);
  if (typeof raw === 'string' && raw.trim() !== '') {
    const n = Number(raw.trim());
    return Number.isFinite(n) && n > 0 ? Math.trunc(n) : undefined;
  }
  if (typeof raw === 'object' && raw !== null && 'value' in (raw as object)) {
    return resolveAccountId((raw as { value: unknown }).value);
  }
  return undefined;
}

/** Resolve a single calendar date from DatePicker (Date | string | Date[]). */
export function resolveFilterDate(raw: unknown): string | undefined {
  if (raw == null || raw === '') return undefined;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value == null || value === '') return undefined;
  try {
    return toIsoDate(value as Date | string);
  } catch {
    return undefined;
  }
}

export function displayValue(value: string | number | null | undefined, fallback = '—'): string {
  if (value == null) return fallback;
  if (typeof value === 'string' && value.trim() === '') return fallback;
  return String(value);
}
