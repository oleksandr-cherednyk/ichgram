export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 50;

export type CursorPayload = {
  createdAt: string;
  id: string;
};

export type PaginationParams = {
  cursor?: string | null;
  limit?: number | string | null;
};

export type PaginationResult<T> = {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
};

export const parseLimit = (limit?: number | string | null): number => {
  if (limit === undefined || limit === null || limit === '') {
    return DEFAULT_LIMIT;
  }

  const parsed = typeof limit === 'string' ? Number(limit) : limit;
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_LIMIT;
  }

  return Math.min(Math.trunc(parsed), MAX_LIMIT);
};

export const encodeCursor = (payload: CursorPayload): string =>
  Buffer.from(JSON.stringify(payload)).toString('base64url');

export const decodeCursor = (cursor?: string | null): CursorPayload | null => {
  if (!cursor) {
    return null;
  }

  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf8');
    const parsed = JSON.parse(decoded) as CursorPayload;

    if (!parsed.createdAt || !parsed.id) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};
