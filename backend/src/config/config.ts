import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
  // Database Configuration
  database: {
    host: string;
    port: number;
    user: string;
    password: string;
    name: string;
  };
  
  // Server Configuration
  server: {
    port: number;
    nodeEnv: string;
  };
  
  // JWT Configuration
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  
  // Security Configuration
  security: {
    bcryptRounds: number;
  };
  
  // Rate Limiting Configuration
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  
  // CORS Configuration
  cors: {
    origin: string;
  };
}

const config: Config = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'jett3_airline',
  },
  
  server: {
    port: parseInt(process.env.PORT || '3000'),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
};

export default config;