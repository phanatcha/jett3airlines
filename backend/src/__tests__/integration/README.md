# Integration Tests

This directory contains integration tests for the Airline Backend API. These tests verify the complete functionality of API endpoints including authentication, database integration, and business logic.

## Test Files

- `auth.integration.test.ts` - Authentication and authorization flows
- `flights.integration.test.ts` - Flight search and management endpoints
- `bookings.integration.test.ts` - Booking creation and management
- `payments.integration.test.ts` - Payment processing workflows
- `admin.integration.test.ts` - Admin-only endpoints and authorization
- `baggage.integration.test.ts` - Baggage tracking system

## Prerequisites

### Database Setup

Integration tests require a running MySQL database. You have two options:

1. **Use the main database** (not recommended for tests):
   - Tests will use the database configured in `.env`

2. **Use a separate test database** (recommended):
   - Create a test database: `CREATE DATABASE jett3_airline_test;`
   - Configure `.env.test` with test database credentials
   - Tests will use this separate database

### Environment Configuration

Create a `.env.test` file in the backend directory:

```env
NODE_ENV=test
PORT=8081

# Test Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=jett3_airline_test
DB_PORT=3306

# JWT Configuration
JWT_SECRET=test_jwt_secret_key
JWT_EXPIRES_IN=1h

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

## Running Tests

### Run all integration tests:
```bash
npm test -- --testPathPatterns=integration
```

### Run specific test file:
```bash
npm test -- auth.integration.test
npm test -- flights.integration.test
npm test -- bookings.integration.test
```

### Run with coverage:
```bash
npm test -- --testPathPatterns=integration --coverage
```

### Run in watch mode (for development):
```bash
npm run test:watch -- --testPathPatterns=integration
```

## Test Structure

Each integration test file follows this pattern:

1. **Setup** - Create test app instance and authenticate test users
2. **Test Suites** - Organized by endpoint/functionality
3. **Test Cases** - Cover success scenarios, error cases, and edge cases
4. **Cleanup** - Tests are isolated and don't affect each other

## What's Tested

### Authentication Tests
- User registration with validation
- Login with valid/invalid credentials
- Protected route access with JWT tokens
- Profile management

### Flight Tests
- Public flight search (no auth required)
- Flight details retrieval
- Seat availability checking
- Admin flight management (requires admin auth)

### Booking Tests
- Booking creation with passengers
- Booking retrieval and listing
- Booking modifications
- Authorization checks

### Payment Tests
- Payment processing
- Payment validation
- Booking-payment integration
- Error handling

### Admin Tests
- Admin authentication and authorization
- Admin-only endpoint access
- Data management operations
- Regular user access denial

### Baggage Tests
- Baggage record creation
- Tracking number generation
- Status updates
- Passenger-baggage linking

## Test Coverage

Integration tests verify:
- ✅ HTTP status codes
- ✅ Response structure and data
- ✅ Authentication and authorization
- ✅ Database transactions
- ✅ Error handling
- ✅ Input validation
- ✅ Business logic workflows

## Known Issues

### Rate Limiting
Some tests may fail with 429 (Too Many Requests) errors if run repeatedly. This is expected behavior from the rate limiting middleware. Solutions:

1. Increase rate limits in test environment
2. Add delays between test runs
3. Disable rate limiting for tests

### Database Connection
Tests require an active database connection. If the database is not available:
- Tests will fail with connection errors
- Ensure MySQL is running
- Verify database credentials in `.env` or `.env.test`

## Best Practices

1. **Isolation** - Each test should be independent
2. **Cleanup** - Tests should not leave data that affects other tests
3. **Realistic Data** - Use realistic test data that matches production scenarios
4. **Error Cases** - Test both success and failure paths
5. **Authentication** - Test both authenticated and unauthenticated access

## Troubleshooting

### Tests fail with "ECONNREFUSED"
- Database is not running or not accessible
- Check database credentials in `.env` or `.env.test`
- Verify MySQL service is running

### Tests fail with "429 Too Many Requests"
- Rate limiting is triggering
- Run tests with longer delays
- Consider disabling rate limiting in test environment

### Tests fail with "401 Unauthorized"
- JWT token generation or validation issue
- Check JWT_SECRET in environment configuration
- Verify authentication middleware is working

### Tests timeout
- Increase Jest timeout in `jest.config.js`
- Check for slow database queries
- Verify network connectivity

## Contributing

When adding new integration tests:

1. Follow existing test structure and naming conventions
2. Test both success and error scenarios
3. Include proper authentication where required
4. Add descriptive test names
5. Document any special setup requirements
6. Ensure tests are isolated and repeatable
