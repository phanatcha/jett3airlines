# Middleware Documentation

This directory contains all middleware functions used in the Airline Backend API.

## Error Handling

### Custom Error Classes (`utils/errors.ts`)

The application uses custom error classes that extend the base `AppError` class. All errors include:
- `statusCode`: HTTP status code
- `code`: Error code for client identification
- `message`: Human-readable error message
- `details`: Optional additional error details
- `isOperational`: Flag to distinguish operational errors from programming errors

#### Available Error Classes

1. **ValidationError** (422)
   - Used for input validation failures
   - Example: Invalid email format, missing required fields

2. **AuthenticationError** (401)
   - Used for authentication failures
   - Example: Invalid credentials, expired token

3. **AuthorizationError** (403)
   - Used for permission denied scenarios
   - Example: Non-admin accessing admin routes

4. **NotFoundError** (404)
   - Used when resources are not found
   - Example: Flight ID doesn't exist

5. **ConflictError** (409)
   - Used for resource conflicts
   - Example: Seat already booked, duplicate username

6. **DatabaseError** (500)
   - Used for database operation failures
   - Example: Connection errors, query failures

7. **BadRequestError** (400)
   - Used for malformed requests
   - Example: Invalid JSON, incorrect data types

8. **PaymentError** (402)
   - Used for payment processing failures
   - Example: Card declined, insufficient funds

9. **ServiceUnavailableError** (503)
   - Used for temporary service issues
   - Example: Database temporarily unavailable

### Usage Example

```typescript
import { NotFoundError, ConflictError } from '../utils/errors';

// In a controller
const flight = await Flight.findById(flightId);
if (!flight) {
  throw new NotFoundError('Flight');
}

// Check for conflicts
const existingSeat = await Seat.findByNumber(seatNo);
if (existingSeat) {
  throw new ConflictError('Seat already exists', { seatNo });
}
```

### Global Error Handler (`errorHandler.ts`)

The global error handler catches all errors and formats them consistently:

```typescript
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Flight not found",
    "details": { "flightId": 123 }
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Async Handler

Use the `asyncHandler` wrapper for async route handlers to automatically catch errors:

```typescript
import { asyncHandler } from '../middleware/errorHandler';

router.get('/flights/:id', asyncHandler(async (req, res) => {
  const flight = await Flight.findById(req.params.id);
  if (!flight) {
    throw new NotFoundError('Flight');
  }
  res.json({ success: true, data: flight });
}));
```

## Validation

### Input Validation (`validation.ts`)

All API endpoints use express-validator for input validation. Validation errors are automatically formatted and returned with a 422 status code.

#### Available Validation Schemas

**Authentication:**
- `validateRegistration` - Client registration
- `validateLogin` - Client login
- `validateProfileUpdate` - Profile updates
- `validatePasswordChange` - Password changes

**Flights:**
- `validateFlightSearch` - Flight search queries
- `validateFlightCreation` - Creating new flights (admin)
- `validateFlightUpdate` - Updating flights (admin)
- `validateFlightStatusUpdate` - Updating flight status (admin)

**Bookings:**
- `validateBookingCreation` - Creating bookings
- `validateBookingUpdate` - Updating bookings

**Passengers:**
- `validatePassengerCreation` - Adding passengers
- `validatePassengerUpdate` - Updating passenger info

**Payments:**
- `validatePaymentProcessing` - Processing payments
- `validateRefundProcessing` - Processing refunds

**Baggage:**
- `validateBaggageCreation` - Creating baggage records
- `validateBaggageStatusUpdate` - Updating baggage status
- `validateBaggageTracking` - Tracking baggage
- `validateBaggageSearch` - Searching baggage

**Airplanes & Seats:**
- `validateAirplaneCreation` - Creating airplanes (admin)
- `validateAirplaneUpdate` - Updating airplanes (admin)
- `validateSeatCreation` - Creating seats (admin)
- `validateSeatUpdate` - Updating seats (admin)

**Reports:**
- `validateReportDateRange` - Date range queries for reports
- `validateReportExport` - Report export parameters

**Utilities:**
- `validateIdParam(paramName)` - Validates ID parameters
- `validatePagination` - Validates pagination parameters

### Input Sanitization

The `sanitizeInput` middleware automatically removes potentially dangerous content:
- Script tags
- JavaScript protocols
- Event handlers

Applied globally to all routes.

## Authentication & Authorization

### Authentication (`auth.ts`)

**authenticateToken**
- Verifies JWT tokens from Authorization header
- Adds decoded user info to `req.user`
- Throws `AuthenticationError` if token is invalid or missing

**optionalAuth**
- Similar to `authenticateToken` but doesn't fail if no token provided
- Useful for endpoints that work differently for authenticated users

**requireAuth**
- Ensures user is authenticated
- Use after `authenticateToken`

**requireOwnership**
- Ensures authenticated user can only access their own resources
- Compares `req.user.client_id` with requested resource

### Admin Authorization (`adminAuth.ts`)

**requireAdmin**
- Ensures authenticated user has admin role
- Throws `AuthorizationError` if user is not admin

**requireAdminOrSelf**
- Allows access if user is admin OR accessing their own resources
- Useful for profile endpoints

### Usage Example

```typescript
import { authenticateToken, requireOwnership } from '../middleware/auth';
import { requireAdmin } from '../middleware/adminAuth';

// Public route - no auth
router.get('/flights/search', searchFlights);

// Authenticated route
router.get('/bookings', authenticateToken, getBookings);

// User can only access their own bookings
router.get('/bookings/:bookingId', authenticateToken, requireOwnership, getBookingDetails);

// Admin only route
router.post('/admin/flights', authenticateToken, requireAdmin, createFlight);
```

## Security

### Security Middleware (`security.ts`)

**Rate Limiting:**
- `generalRateLimit` - Applied to all routes
- `authRateLimit` - Stricter limits for auth endpoints (5 requests per 15 minutes)

**Security Headers:**
- `securityHeaders` - Helmet.js security headers
- Content Security Policy
- HSTS
- XSS Protection

**CORS:**
- `corsOptions` - Configured CORS settings
- Allows credentials
- Configurable origin from environment

### Usage

Security middleware is applied globally in `index.ts`:

```typescript
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(generalRateLimit);
app.use(sanitizeInput);
```

## Middleware Order

The order of middleware is important:

1. Security headers
2. CORS
3. Rate limiting
4. Body parsing
5. Input sanitization
6. Route-specific middleware (auth, validation)
7. Route handlers
8. 404 handler
9. Error handlers

## Best Practices

1. **Always use custom error classes** instead of throwing generic errors
2. **Validate all inputs** using express-validator schemas
3. **Use asyncHandler** for async route handlers
4. **Provide meaningful error messages** that help clients understand what went wrong
5. **Include relevant details** in error objects for debugging
6. **Never expose sensitive information** in error messages (passwords, tokens, etc.)
7. **Log errors appropriately** - operational errors at info level, programming errors at error level
8. **Use appropriate HTTP status codes** for different error types
