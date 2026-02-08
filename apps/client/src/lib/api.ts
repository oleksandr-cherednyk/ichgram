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

const makeRequest = async (
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

const makeUploadRequest = async (
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
  const { accessToken, setAccessToken, clear } = useAuthStore.getState();

  // No token and not an auth endpoint — try refresh before hitting the server
  let token = accessToken;
  if (!token && !input.startsWith('/auth/')) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      setAccessToken(newToken);
      token = newToken;
    } else {
      clear();
      queryClient.clear();
      throw buildError(401, {
        code: 'UNAUTHORIZED',
        message: 'Not authenticated',
      });
    }
  }

  let response = await makeRequest(input, init, token);

  // If 401 and not the refresh endpoint itself, try to refresh
  if (response.status === 401 && !input.includes('/auth/refresh')) {
    const newToken = await refreshAccessToken();

    if (newToken) {
      // Update store with new token
      setAccessToken(newToken);
      // Retry the original request
      response = await makeRequest(input, init, newToken);
    } else {
      // Refresh failed - clear auth state (triggers redirect to /login)
      clear();
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

export const apiUpload = async <T>(
  input: string,
  method: string,
  body: FormData,
): Promise<T> => {
  const { accessToken, setAccessToken, clear } = useAuthStore.getState();

  // No token — try refresh before hitting the server
  let token = accessToken;
  if (!token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      setAccessToken(newToken);
      token = newToken;
    } else {
      clear();
      queryClient.clear();
      throw buildError(401, {
        code: 'UNAUTHORIZED',
        message: 'Not authenticated',
      });
    }
  }

  let response = await makeUploadRequest(input, method, body, token);

  // If 401, try to refresh and retry
  if (response.status === 401) {
    const newToken = await refreshAccessToken();

    if (newToken) {
      setAccessToken(newToken);
      response = await makeUploadRequest(input, method, body, newToken);
    } else {
      clear();
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
