export type AuthUser = {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatarUrl?: string | null;
};

export type AuthResponse = {
  user: AuthUser;
  accessToken: string;
};
