# Airline Backend API

A comprehensive TypeScript-based REST API for airline management operations including flight bookings, passenger management, payments, and baggage tracking.

## 📚 Documentation

- **[API Documentation](./API_DOCUMENTATION.md)** - Complete API reference with request/response examples
- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Step-by-step deployment instructions
- **[Admin Authentication](./ADMIN_AUTHENTICATION.md)** - Admin user setup and management
- **[Error Handling](./ERROR_HANDLING_IMPLEMENTATION.md)** - Error handling implementation details

## 🚀 Quick Start

### Prerequisites

- Node.js v16+ (v18 recommended)
- MySQL v8.0+
- npm v8+

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database Setup**
   ```bash
   # Import database schema
   mysql -u root -p jett3_airline < "jett3_airline(1) fixed now.sql"
   
   # Create admin user
   mysql -u root -p jett3_airline < create_admin_user.sql
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## 🏗️ Project Structure

```
src/
├── __tests__/          # Test files (unit and integration)
├── config/             # Configuration files
├── controllers/        # Business logic and request handlers
├── middleware/         # Custom middleware (auth, validation, errors)
├── models/             # Data models and database interfaces
├── routes/             # API route definitions
├── scripts/            # Utility scripts (admin creation, etc.)
├── types/              # TypeScript type definitions
├── utils/              # Helper functions and utilities
├── db.ts               # Database connection with pooling
└── index.ts            # Application entry point
```

## 🔑 Key Features

- ✅ **Authentication & Authorization**: JWT-based with refresh tokens
- ✅ **Flight Management**: Search, booking, and seat selection
- ✅ **Payment Processing**: Secure payment handling with encryption
- ✅ **Baggage Tracking**: Real-time baggage status tracking
- ✅ **Admin Dashboard**: Comprehensive admin management endpoints
- ✅ **Reports & Analytics**: Business metrics and data export (CSV/PDF)
- ✅ **Security**: bcrypt hashing, rate limiting, helmet security headers
- ✅ **Validation**: express-validator for input sanitization
- ✅ **Error Handling**: Consistent error responses with proper HTTP codes
- ✅ **Testing**: Unit and integration tests with Jest

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start            # Start production server
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

## 🌐 API Endpoints

### Public Endpoints
- `POST /api/v1/auth/register` - Register new client
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/flights/search` - Search flights
- `GET /api/v1/flights/:id` - Get flight details
- `GET /api/v1/baggage/track/:trackingNo` - Track baggage

### Authenticated Endpoints
- `GET /api/v1/auth/profile` - Get profile
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings` - Get booking history
- `POST /api/v1/payments` - Process payment
- `GET /api/v1/baggage/passenger/:id` - Get passenger baggage

### Admin Endpoints
- `GET /api/v1/admin/flights` - Manage flights
- `GET /api/v1/admin/bookings` - Manage bookings
- `GET /api/v1/admin/payments` - Manage payments
- `GET /api/v1/admin/reports/*` - Access reports and analytics

**See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete endpoint details.**

## ⚙️ Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DB_HOST` | Database host | Yes | localhost |
| `DB_PORT` | Database port | Yes | 3306 |
| `DB_USER` | Database username | Yes | - |
| `DB_PASSWORD` | Database password | Yes | - |
| `DB_NAME` | Database name | Yes | jett3_airline |
| `PORT` | Server port | No | 3000 |
| `NODE_ENV` | Environment | Yes | development |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `JWT_EXPIRES_IN` | Access token expiration | No | 24h |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | No | 7d |
| `BCRYPT_ROUNDS` | Password hashing rounds | No | 12 |
| `CORS_ORIGIN` | Allowed CORS origin | Yes | - |

**See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed configuration.**

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

Test coverage includes:
- Unit tests for controllers and models
- Integration tests for API endpoints
- Authentication and authorization flows
- Database operations

## 🔒 Security

- **Password Hashing**: bcrypt with configurable rounds
- **JWT Tokens**: Secure token-based authentication
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: Sanitization and validation on all inputs
- **SQL Injection Prevention**: Parameterized queries
- **Security Headers**: Helmet.js for HTTP security headers
- **CORS**: Configurable cross-origin resource sharing
- **Data Encryption**: Sensitive data encrypted at rest

## 📦 Dependencies

### Production
- `express` - Web framework
- `mysql2` - MySQL database driver
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT authentication
- `express-validator` - Input validation
- `helmet` - Security headers
- `express-rate-limit` - Rate limiting
- `cors` - CORS middleware
- `dotenv` - Environment configuration
- `pdfkit` - PDF generation

### Development
- `typescript` - TypeScript compiler
- `ts-node` - TypeScript execution
- `nodemon` - Development server
- `jest` - Testing framework
- `supertest` - HTTP testing
- `@types/*` - TypeScript type definitions

## 🚢 Deployment

For production deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

Quick production build:
```bash
npm install --production
npm run build
npm start
```

## 📝 License

This project is part of the Jett3 Airline management system.

## 🤝 Contributing

1. Follow TypeScript best practices
2. Write tests for new features
3. Update documentation
4. Follow existing code style
5. Ensure all tests pass before committing

## 📞 Support

For issues and questions:
- Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- Review [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- Check existing documentation files

---

**Last Updated**: November 8, 2024