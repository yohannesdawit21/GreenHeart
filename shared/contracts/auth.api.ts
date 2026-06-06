/**
 * Auth API contracts — Owner: Role B
 * @see agent/api-contracts.md
 */

export type UserRole = 'client' | 'advisor';

export interface RegisterRequest {
  email: string;
  password: string;
  role: UserRole;
  profile?: {
    username: string;
    bio?: string;
    tags?: string[];
    coinRatePerSession?: number;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  profile: {
    username: string;
    bio: string;
    tags: string[];
    coinRatePerSession: number;
  };
}

export interface AuthResponse {
  user: AuthUser;
  token?: string;
}

export interface MeResponse {
  user: AuthUser;
}
