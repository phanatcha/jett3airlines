# Frontend-Backend API Integration Guide

This document explains how the frontend is integrated with the backend API.

## Overview

The frontend React application communicates with the backend Express API using Axios. The integration includes:

- Authentication (login, register, profile management)
- Flight search and booking
- Payment processing
- Admin operations
- Baggage tracking

## Configuration

### API Base URL

The API base URL is configured in `src/services/api.js`:

```javascript
baseURL: 'http://localhost:8080/api/v1'
```

**Important:** Make sure the backend server is running on port 8080 before using the frontend.

### CORS Configuration

The backend is configured to accept requests from `http://localhost:5173` (Vite's default port). If you change the frontend port, update the `CORS_ORIGIN` in `backend/.env`.

## Architecture

### API Service (`src/services/api.js`)

Central API client with:
- Axios instance with base configuration
- Request interceptor for adding auth tokens
- Response interceptor for error handling
- Organized API methods by feature

### Context Providers

#### AuthContext (`src/context/AuthContext.jsx`)

Manages authentication state:
- User login/logout
- User registration
- Profile management
- Token storage in localStorage
- Authentication status checks

**Usage:**
```javascript
import { useAuth } from '../context/AuthContext';

const { user, login, logout, isAuthenticated } = useAuth();
```

#### BookingContext (`src/context/BookingContext.jsx`)

Manages booking flow state:
- Search criteria
- Selected flights
- Passenger information
- Seat selection
- Payment processing

**Usage:**
```javascript
import { useBooking } from '../context/BookingContext';

const { createBooking, selectedFlights, passengers } = useBooking();
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/profile` - Get user profile (requires auth)
- `PUT /api/v1/auth/profile` - Update user profile (requires auth)

### Flights

- `GET /api/v1/flights/search` - Search flights
- `GET /api/v1/flights/:id` - Get flight details
- `GET /api/v1/flights/:id/seats` - Get available seats

### Bookings

- `POST /api/v1/bookings` - Create booking (requires auth)
- `GET /api/v1/bookings` - Get user bookings (requires auth)
- `GET /api/v1/bookings/:id` - Get booking details (requires auth)
- `PUT /api/v1/bookings/:id` - Update booking (requires auth)
- `DELETE /api/v1/bookings/:id` - Cancel booking (requires auth)

### Payments

- `POST /api/v1/payments` - Process payment (requires auth)
- `GET /api/v1/payments/:bookingId` - Get payment status (requires auth)

### Baggage

- `POST /api/v1/baggage` - Create baggage record (requires auth)
- `GET /api/v1/baggage/track/:trackingNo` - Track baggage (public)
- `GET /api/v1/baggage/:id` - Get baggage details (requires auth)
- `PATCH /api/v1/baggage/:id/status` - Update baggage status (requires auth)

### Admin (requires admin auth)

- `GET /api/v1/admin/bookings` - Get all bookings
- `GET /api/v1/admin/flights` - Get all flights
- `POST /api/v1/admin/flights` - Create flight
- `PUT /api/v1/admin/flights/:id` - Update flight
- `DELETE /api/v1/admin/flights/:id` - Delete flight
- `GET /api/v1/admin/clients` - Get all clients
- `GET /api/v1/admin/payments` - Get all payments
- `GET /api/v1/admin/reports/revenue` - Get revenue report
- `GET /api/v1/admin/reports/bookings` - Get booking statistics
- `GET /api/v1/admin/reports/occupancy` - Get flight occupancy

## Authentication Flow

### Registration

1. User fills out signup form (`/signup`)
2. User provides additional info (`/info`)
3. Frontend calls `authAPI.register()` with complete data
4. Backend creates user account
5. Frontend auto-logs in the user
6. User is redirected to flights page

### Login

1. User enters credentials (`/login`)
2. Frontend calls `authAPI.login()`
3. Backend validates credentials and returns JWT token
4. Frontend stores token in localStorage
5. Token is automatically added to all subsequent requests
6. User is redirected to flights page

### Protected Routes

All authenticated requests automatically include the JWT token via the request interceptor:

```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Error Handling

### API Errors

The response interceptor handles errors globally:

```javascript
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response.data);
  }
);
```

### Component-Level Error Handling

Components can handle specific errors:

```javascript
const result = await login(credentials);
if (!result.success) {
  setError(result.error || 'Login failed');
}
```

## Data Flow Example: Creating a Booking

1. **Search Flights** (`/flights`)
   - User enters search criteria
   - `updateSearchCriteria()` updates context
   - Navigate to departure selection

2. **Select Flights** (`/flights/departure`, `/flights/return`)
   - Call `flightsAPI.search()` with criteria
   - Display available flights
   - `selectDepartureFlight()` / `selectReturnFlight()` updates context

3. **Add Passengers** (`/passengerinfo`)
   - User enters passenger details
   - `addPassenger()` updates context

4. **Select Seats** (`/seat`)
   - Call `flightsAPI.getSeats()` for selected flight
   - Display seat map
   - `selectSeat()` updates context

5. **Choose Fare Options** (`/fare`)
   - User selects support/fasttrack options
   - `updateFareOptions()` updates context

6. **Process Payment** (`/payment`)
   - User enters payment details
   - `createBooking()` creates booking with backend
   - `processPayment()` processes payment
   - Navigate to confirmation

7. **Confirmation** (`/confirmation`)
   - Display booking details
   - Show booking reference number

## Development Setup

### Prerequisites

1. Backend server running on `http://localhost:8080`
2. MySQL database configured and running
3. Frontend dependencies installed

### Running the Application

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access Application:**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:8080/api/v1`

## Testing the Integration

### Manual Testing

1. **Test Registration:**
   - Go to `/signup`
   - Fill out the form
   - Complete personal info on `/info`
   - Verify account creation and auto-login

2. **Test Login:**
   - Go to `/login`
   - Enter credentials
   - Verify redirect to `/flights`

3. **Test Flight Search:**
   - Enter search criteria
   - Verify API call to `/api/v1/flights/search`
   - Check results display

4. **Test Booking Flow:**
   - Select a flight
   - Add passenger info
   - Select seats
   - Process payment
   - Verify booking creation

### Using Browser DevTools

1. **Network Tab:**
   - Monitor API requests
   - Check request/response data
   - Verify authentication headers

2. **Console:**
   - Check for errors
   - View API responses

3. **Application Tab:**
   - Inspect localStorage for token and user data

## Common Issues

### CORS Errors

**Problem:** Browser blocks requests due to CORS policy

**Solution:** Ensure backend `.env` has correct `CORS_ORIGIN`:
```
CORS_ORIGIN=http://localhost:5173
```

### 401 Unauthorized

**Problem:** API returns 401 for authenticated requests

**Solutions:**
- Check if token exists in localStorage
- Verify token hasn't expired
- Ensure JWT_SECRET matches between frontend and backend
- Try logging in again

### Connection Refused

**Problem:** Cannot connect to backend API

**Solutions:**
- Verify backend server is running
- Check backend is on port 8080
- Ensure no firewall blocking

### Database Errors

**Problem:** API returns 500 errors

**Solutions:**
- Check backend console for database errors
- Verify MySQL is running
- Check database credentials in backend `.env`
- Ensure database schema is up to date

## Security Considerations

1. **Token Storage:** JWT tokens are stored in localStorage (consider httpOnly cookies for production)
2. **HTTPS:** Use HTTPS in production
3. **Token Expiration:** Tokens expire after 1 hour (configurable in backend)
4. **Input Validation:** Both frontend and backend validate user input
5. **Password Security:** Passwords are hashed with bcrypt on backend

## Next Steps

To enhance the integration:

1. Add loading states and spinners
2. Implement retry logic for failed requests
3. Add request caching
4. Implement real-time updates with WebSockets
5. Add comprehensive error boundaries
6. Implement refresh token mechanism
7. Add request rate limiting on frontend
8. Implement offline support with service workers
