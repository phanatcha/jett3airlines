// Export all database types and interfaces
export * from './database';

// Legacy types for backward compatibility
export interface AuthTokenPayload {
  clientId: number;
  username: string;
  email: string;
  iat?: number;
  exp?: number;
}