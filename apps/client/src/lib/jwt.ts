/**
 * Decode JWT payload without verifying signature.
 * Used client-side to check token expiry.
 */
export const decodeJwtPayload = (token: string): { exp?: number } | null => {
  try {
    const base64Payload = token.split('.')[1];
    const payload = JSON.parse(atob(base64Payload));
    return payload;
  } catch {
    return null;
  }
};

/**
 * Check if JWT token is expired.
 * Returns true if expired or invalid.
 */
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;

  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;

  // exp is in seconds, Date.now() in milliseconds
  // Add 10 second buffer to account for clock skew
  return payload.exp * 1000 < Date.now() + 10000;
};
