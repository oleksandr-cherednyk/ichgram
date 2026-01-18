import { type ApiError, type ApiErrorResponse } from '../types/api';

type ApiRequestError = {
  status: number;
  error: ApiError;
};

const buildError = (status: number, error?: ApiError): ApiRequestError => ({
  status,
  error: {
    code: error?.code ?? 'UNKNOWN_ERROR',
    message: error?.message ?? 'Unknown error',
    details: error?.details,
    requestId: error?.requestId,
  },
});

export const apiRequest = async <T>(
  input: string,
  init?: RequestInit,
): Promise<T> => {
  const response = await fetch(`/api${input}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  const text = await response.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const parsedError = (data as ApiErrorResponse | null)?.error;
    throw buildError(response.status, parsedError);
  }

  return data as T;
};
