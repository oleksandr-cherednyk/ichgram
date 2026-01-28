import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form';

/**
 * Maps API error details to form field errors
 */
export const mapApiErrorsToForm = <T extends FieldValues>(
  details: Record<string, unknown> | undefined,
  setError: UseFormSetError<T>,
): boolean => {
  if (!details) return false;

  let hasErrors = false;

  for (const [field, value] of Object.entries(details)) {
    const message = extractErrorMessage(value);
    if (message) {
      setError(field as FieldPath<T>, {
        type: 'server',
        message,
      });
      hasErrors = true;
    }
  }

  return hasErrors;
};

/**
 * Extracts error message from various error value formats
 */
const extractErrorMessage = (value: unknown): string | null => {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value) && value.length > 0) {
    return String(value[0]);
  }

  if (value && typeof value === 'object' && 'message' in value) {
    return String(value.message);
  }

  return null;
};
