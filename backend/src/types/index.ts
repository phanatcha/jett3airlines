export * from './database';

export interface AuthTokenPayload {
  clientId: number;
  username: string;
  email: string;
  iat?: number;
  exp?: number;
}