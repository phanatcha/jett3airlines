import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Type declarations for Node.js globals (fallback if @types/node is not available)
declare const process: {
  env: { [key: string]: string | undefined };
};

dotenv.config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jett3_airline',
  port: Number(process.env.DB_PORT) || 3306,
  // Connection pool configuration
  connectionLimit: 10,
  // Additional security and performance settings
  charset: 'utf8mb4',
  timezone: '+00:00',
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Database connection class with enhanced functionality
class Database {
  private pool: mysql.Pool;

  constructor() {
    this.pool = pool;
    this.testConnection();
  }

  // Test initial connection
  private async testConnection(): Promise<void> {
    try {
      const connection = await this.pool.getConnection();
      console.log('✅ Connected to Jett3airline database with connection pooling');
      connection.release();
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      console.log('⚠️  Server will continue running without database connection');
      console.log('💡 To fix this, create a .env file with your database credentials');
      // Don't throw error - let the server continue running
    }
  }

  // Execute query with error handling and logging
  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    const startTime = Date.now();
    
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Executing query:', sql);
        if (params) console.log('📝 Parameters:', params);
      }

      const [rows] = await this.pool.execute(sql, params);
      
      const executionTime = Date.now() - startTime;
      if (process.env.NODE_ENV === 'development') {
        console.log(`⏱️  Query executed in ${executionTime}ms`);
      }

      return rows as T[];
    } catch (error) {
      console.error('❌ Database query error:', error);
      console.error('🔍 Failed query:', sql);
      if (params) console.error('📝 Parameters:', params);
      throw error;
    }
  }

  // Execute transaction with rollback support
  async transaction<T>(callback: (connection: mysql.PoolConnection) => Promise<T>): Promise<T> {
    const connection = await this.pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Transaction started');
      }

      const result = await callback(connection);
      
      await connection.commit();
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Transaction committed');
      }

      return result;
    } catch (error) {
      await connection.rollback();
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Transaction rolled back');
      }
      
      console.error('❌ Transaction error:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get connection pool statistics
  getPoolStats() {
    return {
      totalConnections: (this.pool as any).pool?.config?.connectionLimit || 10,
      activeConnections: 'N/A', // Not accessible in newer mysql2 versions
      freeConnections: 'N/A',   // Not accessible in newer mysql2 versions
      queuedRequests: 'N/A',    // Not accessible in newer mysql2 versions
    };
  }

  // Close all connections (for graceful shutdown)
  async close(): Promise<void> {
    try {
      await this.pool.end();
      console.log('🔌 Database connections closed');
    } catch (error) {
      console.error('❌ Error closing database connections:', error);
      throw error;
    }
  }

  // Get the pool instance for advanced usage
  getPool(): mysql.Pool {
    return this.pool;
  }
}

// Create and export database instance
const database = new Database();

export default database;
export { Database };
