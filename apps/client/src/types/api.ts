export type ApiError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  requestId?: string;
};

export type ApiErrorResponse = {
  error: ApiError;
};
