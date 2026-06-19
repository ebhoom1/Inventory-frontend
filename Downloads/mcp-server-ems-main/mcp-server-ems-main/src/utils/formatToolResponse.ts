// src/utils/formatToolResponse.ts
//
// Small helpers that keep user-facing tool text clean and resilient to
// missing/odd fields in EMS API responses.

/** Coerce an unknown value into a non-negative integer count (0 on failure). */
export function safeCount(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

/** Short, human-readable summary for an exceedence response. */
export function buildShortMessageForExceedence(data: any): string {
  if (data && data.hasExceedence) {
    const count = safeCount(data.count);
    return `${count} exceedence(s) found today.`;
  }
  return "No exceedence found today.";
}

/**
 * Short, human-readable summary for a gap response.
 * Supports both `gapCount` (current EMS field) and `totalGapCount`/`hasGap`
 * variants so the wording stays correct if the API field names evolve.
 */
export function buildShortMessageForGap(data: any): string {
  const count = safeCount(
    data?.totalGapCount ?? data?.gapCount ?? data?.gapDates?.length
  );
  const hasGap = data?.hasGap === true || count > 0;
  if (!hasGap || count === 0) {
    return "No data gap found.";
  }
  return `${count} data gap(s) found.`;
}

/** Turn any thrown value into a clean, token-free string. */
export function normalizeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}
