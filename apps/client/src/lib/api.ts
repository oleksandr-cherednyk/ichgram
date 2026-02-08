import { useAuthStore } from '../stores/auth';
import { type ApiError, type ApiErrorResponse } from '../types/api';
import { queryClient } from './query-client';

export const buildCursorUrl = (
  path: string,
  cursor?: string | null,
): string => {
  if (!cursor) return path;
  const params = new URLSearchParams();
  params.set('cursor', cursor);
  return `${path}?${params}`;
};

type ApiRequestError = {
  status: number;
  error: ApiError;
};

type RefreshResponse = {
  accessToken: string;
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

// Prevent multiple simultaneous refresh requests
let refreshPromise: Promise<string | null> | null = null;

export const refreshAccessToken = async (): Promise<string | null> => {
  // If already refreshing, wait for that request
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as RefreshResponse;
      return data.accessToken;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

type WithAuthOptions = {
  /** Skip the pre-flight token refresh when no token is present */
  skipPreflightRefresh?: boolean;
  /** Skip the 401 retry (e.g. for the refresh endpoint itself) */
  skipRetryOn401?: boolean;
};

const withAuth = async <T>(
  execute: (token: string | null) => Promise<Response>,
  opts: WithAuthOptions = {},
): Promise<T> => {
  const { accessToken, setAccessToken, clear } = useAuthStore.getState();

  let token = accessToken;

  // No token — try refresh before hitting the server (unless skipped)
  if (!token && !opts.skipPreflightRefresh) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      setAccessToken(newToken);
      token = newToken;
    } else {
      clear();
      queryClient.cancelQueries();
      queryClient.clear();
      throw buildError(401, {
        code: 'UNAUTHORIZED',
        message: 'Not authenticated',
      });
    }
  }

  let response = await execute(token);

  // If 401, try to refresh and retry (unless skipped)
  if (response.status === 401 && !opts.skipRetryOn401) {
    const newToken = await refreshAccessToken();

    if (newToken) {
      setAccessToken(newToken);
      response = await execute(newToken);
    } else {
      clear();
      queryClient.cancelQueries();
      queryClient.clear();
    }
  }

  const text = await response.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const parsedError = (data as ApiErrorResponse | null)?.error;
    throw buildError(response.status, parsedError);
  }

  return data as T;
};

const makeRequest = (
  input: string,
  init?: RequestInit,
  token?: string | null,
): Promise<Response> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (init?.headers) {
    const customHeaders = init.headers as Record<string, string>;
    Object.assign(headers, customHeaders);
  }

  return fetch(`/api${input}`, {
    ...init,
    credentials: 'include',
    headers,
  });
};

const makeUploadRequest = (
  input: string,
  method: string,
  body: FormData,
  token?: string | null,
): Promise<Response> => {
  const headers: Record<string, string> = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`/api${input}`, {
    method,
    credentials: 'include',
    headers,
    body,
  });
};

export const apiRequest = async <T>(
  input: string,
  init?: RequestInit,
): Promise<T> => {
  const isAuthEndpoint = input.startsWith('/auth/');

  return withAuth<T>((token) => makeRequest(input, init, token), {
    skipPreflightRefresh: isAuthEndpoint,
    skipRetryOn401: input.includes('/auth/refresh'),
  });
};

export const apiUpload = async <T>(
  input: string,
  method: string,
  body: FormData,
): Promise<T> => {
  return withAuth<T>((token) => makeUploadRequest(input, method, body, token));
};
