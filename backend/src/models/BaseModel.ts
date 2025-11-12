import database from '../db';
import { ApiResponse } from '../types/database';

export abstract class BaseModel {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async findById<T>(id: number, idColumn: string = 'id'): Promise<T | null> {
    try {
      const query = `SELECT * FROM ${this.tableName} WHERE ${idColumn} = ? LIMIT 1`;
      const results = await database.query<T>(query, [id]);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error(`Error finding ${this.tableName} by ID:`, error);
      throw error;
    }
  }

  async findAll<T>(
    conditions?: Record<string, any>,
    limit?: number,
    offset?: number,
    orderBy?: string
  ): Promise<T[]> {
    try {
      let query = `SELECT * FROM ${this.tableName}`;
      const params: any[] = [];

      if (conditions && Object.keys(conditions).length > 0) {
        const whereClause = Object.keys(conditions)
          .map(key => `${key} = ?`)
          .join(' AND ');
        query += ` WHERE ${whereClause}`;
        params.push(...Object.values(conditions));
      }

      if (orderBy) {
        query += ` ORDER BY ${orderBy}`;
      }

      if (limit) {
        query += ` LIMIT ?`;
        params.push(limit);
        
        if (offset) {
          query += ` OFFSET ?`;
          params.push(offset);
        }
      }

      return await database.query<T>(query, params);
    } catch (error) {
      console.error(`Error finding all ${this.tableName}:`, error);
      throw error;
    }
  }

  async create<T>(data: Omit<T, 'id'>): Promise<number> {
    try {
      const columns = Object.keys(data as any).join(', ');
      const placeholders = Object.keys(data as any).map(() => '?').join(', ');
      const values = Object.values(data as any);

      const query = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`;
      const result = await database.query(query, values);
      
      return (result as any).insertId;
    } catch (error) {
      console.error(`Error creating ${this.tableName}:`, error);
      throw error;
    }
  }

  async update<T>(
    id: number,
    data: Partial<T>,
    idColumn: string = 'id'
  ): Promise<boolean> {
    try {
      const columns = Object.keys(data as any);
      if (columns.length === 0) {
        throw new Error('No data provided for update');
      }

      const setClause = columns.map(col => `${col} = ?`).join(', ');
      const values = [...Object.values(data as any), id];

      const query = `UPDATE ${this.tableName} SET ${setClause} WHERE ${idColumn} = ?`;
      const result = await database.query(query, values);
      
      return (result as any).affectedRows > 0;
    } catch (error) {
      console.error(`Error updating ${this.tableName}:`, error);
      throw error;
    }
  }

  async delete(id: number, idColumn: string = 'id'): Promise<boolean> {
    try {
      const query = `DELETE FROM ${this.tableName} WHERE ${idColumn} = ?`;
      const result = await database.query(query, [id]);
      
      return (result as any).affectedRows > 0;
    } catch (error) {
      console.error(`Error deleting ${this.tableName}:`, error);
      throw error;
    }
  }

  async count(conditions?: Record<string, any>): Promise<number> {
    try {
      let query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
      const params: any[] = [];

      if (conditions && Object.keys(conditions).length > 0) {
        const whereClause = Object.keys(conditions)
          .map(key => `${key} = ?`)
          .join(' AND ');
        query += ` WHERE ${whereClause}`;
        params.push(...Object.values(conditions));
      }

      const result = await database.query<{ count: number }>(query, params);
      return result[0]?.count || 0;
    } catch (error) {
      console.error(`Error counting ${this.tableName}:`, error);
      throw error;
    }
  }

  async exists(id: number, idColumn: string = 'id'): Promise<boolean> {
    try {
      const query = `SELECT 1 FROM ${this.tableName} WHERE ${idColumn} = ? LIMIT 1`;
      const result = await database.query(query, [id]);
      return result.length > 0;
    } catch (error) {
      console.error(`Error checking existence in ${this.tableName}:`, error);
      throw error;
    }
  }

  protected async executeQuery<T>(query: string, params?: any[]): Promise<T[]> {
    try {
      return await database.query<T>(query, params);
    } catch (error) {
      console.error(`Error executing custom query on ${this.tableName}:`, error);
      throw error;
    }
  }

  protected async executeTransaction<T>(
    callback: (connection: any) => Promise<T>
  ): Promise<T> {
    return await database.transaction(callback);
  }

  protected formatResponse<T>(
    success: boolean,
    data?: T,
    message: string = '',
    error?: string
  ): ApiResponse<T> {
    const response: ApiResponse<T> = {
      success,
      message,
      timestamp: new Date().toISOString()
    };
    
    if (data !== undefined) {
      response.data = data;
    }
    
    if (error !== undefined) {
      response.error = error;
    }
    
    return response;
  }
}