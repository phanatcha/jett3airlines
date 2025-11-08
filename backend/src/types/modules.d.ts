// Type declarations for external modules

declare module 'mysql2/promise' {
  export interface Pool {
    execute(sql: string, params?: any[]): Promise<[any[], any]>;
    getConnection(): Promise<PoolConnection>;
    end(): Promise<void>;
    pool: {
      config: { connectionLimit: number };
      _allConnections: any[];
      _freeConnections: any[];
      _connectionQueue: any[];
    };
  }

  export interface PoolConnection {
    execute(sql: string, params?: any[]): Promise<[any[], any]>;
    beginTransaction(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
    release(): void;
  }

  export function createPool(config: any): Pool;
}

declare module 'dotenv' {
  export function config(): void;
}

declare module 'bcrypt' {
  export function hash(data: string, saltRounds: number): Promise<string>;
  export function compare(data: string, encrypted: string): Promise<boolean>;
}

declare module 'crypto' {
  export function scryptSync(password: string, salt: string, keylen: number): Buffer;
  export function randomBytes(size: number): Buffer;
  export function createCipher(algorithm: string, key: Buffer): any;
  export function createDecipher(algorithm: string, key: Buffer): any;
}