# Airline Backend API

A comprehensive TypeScript-based REST API for airline management operations.

## Project Structure

```
src/
├── config/         # Configuration files and environment setup
├── controllers/    # Business logic and request handlers
├── middleware/     # Custom middleware functions
├── models/         # Data models and database interfaces
├── routes/         # API route definitions
├── types/          # TypeScript type definitions
├── utils/          # Helper functions and utilities
├── db.ts          # Database connection setup
└── index.ts       # Application entry point
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   - Copy `.env.example` to `.env`
   - Update the environment variables with your configuration:
     ```bash
     cp .env.example .env
     ```

3. **Database Setup**
   - Ensure MySQL is running
   - Import the database schema from `jett3_airline (1).sql`
   - Update database credentials in `.env`

4. **Development**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 3306 |
| `DB_USER` | Database username | root |
| `DB_PASSWORD` | Database password | |
| `DB_NAME` | Database name | jett3_airline |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `JWT_SECRET` | JWT signing secret | |
| `JWT_EXPIRES_IN` | JWT expiration time | 24h |
| `BCRYPT_ROUNDS` | Password hashing rounds | 12 |

## Dependencies Added

### Production Dependencies
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT token management
- `express-validator` - Request validation
- `helmet` - Security headers
- `express-rate-limit` - Rate limiting

### Development Dependencies
- `@types/bcrypt` - TypeScript types for bcrypt
- `@types/jsonwebtoken` - TypeScript types for JWT

## Features

- **Authentication & Authorization**: JWT-based authentication system
- **Security**: Password hashing, rate limiting, security headers
- **Validation**: Comprehensive input validation
- **Type Safety**: Full TypeScript implementation
- **Modular Architecture**: Clean separation of concerns
- **Environment Configuration**: Flexible environment-based configuration

## Next Steps

1. Implement database models and connection pooling
2. Create authentication middleware and utilities
3. Build API controllers and routes
4. Add comprehensive error handling
5. Implement testing suite