// Standard API error payload contract.
export type ApiErrorPayload = {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    requestId?: string;
  };
};

export type ApiError = {
  status: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export const createApiError = (
  status: number,
  code: string,
  message: string,
  details?: Record<string, unknown>,
): ApiError => ({
  status,
  code,
  message,
  details,
});
