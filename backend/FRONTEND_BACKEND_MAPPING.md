# Frontend-Backend API Mapping

This document maps frontend pages and features to their corresponding backend API endpoints.

## ✅ Completed Backend APIs

### 1. Authentication & User Management
**Frontend Pages**: Login.jsx, SignUp.jsx, Info.jsx

| Frontend Feature | Backend Endpoint | Status |
|-----------------|------------------|--------|
| User Registration | `POST /api/v1/auth/register` | ✅ Complete |
| User Login | `POST /api/v1/auth/login` | ✅ Complete |
| Get Profile | `GET /api/v1/auth/profile` | ✅ Complete |
| Update Profile | `PUT /api/v1/auth/profile` | ✅ Complete |
| Change Password | `POST /api/v1/auth/change-password` | ✅ Complete |
| Refresh Token | `POST /api/v1/auth/refresh` | ✅ Complete |
| Logout | `POST /api/v1/auth/logout` | ✅ Complete |

**Features**:
- ✅ Argon2 password hashing
- ✅ JWT token authentication
- ✅ Role-based access (user/admin)
- ✅ Admin authentication via login credentials

---

### 2. Flight Search & Booking Flow
**Frontend Pages**: Flights.jsx, Departure.jsx, Return.jsx, Fare.jsx

| Frontend Feature | Backend Endpoint | Status |
|-----------------|------------------|--------|
| Search Flights | `GET /api/v1/flights/search` | ✅ Complete |
| Get Flight Details | `GET /api/v1/flights/:id` | ✅ Complete |
| Get Available Seats | `GET /api/v1/flights/:id/seats` | ✅ Complete |
| Get Seat Availability | `GET /api/v1/flights/:id/seats/availability` | ✅ Complete |

---

### 3. Passenger Information
**Frontend Pages**: PassengerInfo.jsx

| Frontend Feature | Backend Endpoint | Status |
|-----------------|------------------|--------|
| Create Passenger | `POST /api/v1/passengers` | ✅ Complete |
| Update Passenger | `PUT /api/v1/passengers/:id` | ✅ Complete |
| Get Passenger Details | `GET /api/v1/passengers/:id` | ✅ Complete |

---

### 4. Seat Selection
**Frontend Pages**: Seat.jsx

| Frontend Feature | Backend Endpoint | Status |
|-----------------|------------------|--------|
| Get Seat Map | `GET /api/v1/flights/:id/seats` | ✅ Complete |
| Check Seat Availability | `GET /api/v1/flights/:id/seats/availability` | ✅ Complete |
| Reserve Seat | Part of booking creation | ✅ Complete |

---

### 5. Booking Management
**Frontend Pages**: Book.jsx, Confirmation.jsx

| Frontend Feature | Backend Endpoint | Status |
|-----------------|------------------|--------|
| Create Booking | `POST /api/v1/bookings` | ✅ Complete |
| Get Booking Details | `GET /api/v1/bookings/:id` | ✅ Complete |
| Get User Bookings | `GET /api/v1/bookings/my-bookings` | ✅ Complete |
| Update Booking | `PUT /api/v1/bookings/:id` | ✅ Complete |
| Cancel Booking | `DELETE /api/v1/bookings/:id` | ✅ Complete |

---

### 6. Payment Processing
**Frontend Pages**: Payment.jsx

| Frontend Feature | Backend Endpoint | Status |
|-----------------|------------------|--------|
| Create Payment | `POST /api/v1/payments` | ✅ Complete |
| Get Payment Status | `GET /api/v1/payments/:id` | ✅ Complete |
| Get Booking Payments | `GET /api/v1/bookings/:id/payments` | ✅ Complete |

---

### 7. Admin - Flight Management
**Frontend Pages**: Admin.jsx (Flights Tab), EditFlight.jsx

| Frontend Feature | Backend Endpoint | Status |
|-----------------|------------------|--------|
| Get All Flights | `GET /api/v1/admin/flights` | ✅ Complete |
| Create Flight | `POST /api/v1/admin/flights` | ✅ Complete |
| Update Flight | `PUT /api/v1/admin/flights/:id` | ✅ Complete |
| Delete Flight | `DELETE /api/v1/admin/flights/:id` | ✅ Complete |
| Update Flight Status | `PATCH /api/v1/admin/flights/:id/status` | ✅ Complete |
| Get Flight Stats | `GET /api/v1/admin/flights/stats` | ✅ Complete |

---

### 8. Admin - Booking Management
**Frontend Pages**: Admin.jsx (Bookings Tab), EditBooking.jsx

| Frontend Feature | Backend Endpoint | Status |
|-----------------|------------------|--------|
| Get All Bookings | `GET /api/v1/bookings` (admin) | ✅ Complete |
| Get Booking Details | `GET /api/v1/bookings/:id` | ✅ Complete |
| Update Booking | `PUT /api/v1/bookings/:id` | ✅ Complete |
| Update Booking Status | `PATCH /api/v1/bookings/:id/status` | ⚠️ Needs endpoint |

---

### 9. Admin - Reports
**Frontend Pages**: Admin.jsx (Reports Tab)

| Frontend Feature | Backend Endpoint | Status |
|-----------------|------------------|--------|
| Get Metrics Summary | `GET /api/v1/admin/reports/metrics` | ⚠️ Needs endpoint |
| Get Bookings Per Day | `GET /api/v1/admin/reports/bookings-per-day` | ⚠️ Needs endpoint |
| Export CSV | `GET /api/v1/admin/reports/export/csv` | ⚠️ Needs endpoint |
| Export PDF | `GET /api/v1/admin/reports/export/pdf` | ⚠️ Needs endpoint |

---

### 10. Admin - Airplane Management
**Frontend Pages**: Admin.jsx (potential future feature)

| Frontend Feature | Backend Endpoint | Status |
|-----------------|------------------|--------|
| Get All Airplanes | `GET /api/v1/admin/airplanes` | ✅ Complete |
| Create Airplane | `POST /api/v1/admin/airplanes` | ✅ Complete |
| Update Airplane | `PUT /api/v1/admin/airplanes/:id` | ✅ Complete |
| Delete Airplane | `DELETE /api/v1/admin/airplanes/:id` | ✅ Complete |
| Get Seat Configuration | `GET /api/v1/admin/airplanes/:id/seats` | ✅ Complete |

---

### 11. Admin - Seat Management
**Frontend Pages**: Admin.jsx (potential future feature)

| Frontend Feature | Backend Endpoint | Status |
|-----------------|------------------|--------|
| Create Seat | `POST /api/v1/admin/airplanes/:id/seats` | ✅ Complete |
| Update Seat | `PUT /api/v1/admin/seats/:id` | ✅ Complete |
| Delete Seat | `DELETE /api/v1/admin/seats/:id` | ✅ Complete |

---

## 🔄 APIs That Need to Be Added

### 1. Admin Reports Endpoints
These endpoints are needed for the Reports tab in Admin.jsx:

```typescript
// Get summary metrics
GET /api/v1/admin/reports/metrics
Response: {
  totalFlights: number,
  totalBookings: number,
  totalRevenue: number,
  totalCancellations: number
}

// Get bookings per day data
GET /api/v1/admin/reports/bookings-per-day
Query: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
Response: {
  data: [{ date: string, bookings: number }]
}

// Export reports as CSV
GET /api/v1/admin/reports/export/csv
Query: ?type=metrics|bookings&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD

// Export reports as PDF
GET /api/v1/admin/reports/export/pdf
Query: ?type=metrics|bookings&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

### 2. Booking Status Update Endpoint
For EditBooking.jsx to update booking status:

```typescript
PATCH /api/v1/admin/bookings/:id/status
Body: { status: 'pending' | 'confirmed' | 'cancelled' | 'completed' }
```

---

## 📋 Database Schema Alignment

### Current Schema Status:
- ✅ `client` table - includes `role` field for admin authentication
- ✅ `flight` table - includes `flight_no` field
- ✅ `booking` table - includes `booking_no` field
- ✅ `passenger` table - with triggers for seat validation
- ✅ `seat` table - with various class types
- ✅ `payment` table
- ✅ `airplane` table
- ✅ `airport` table
- ✅ `baggage` table

### Database Triggers:
- ✅ `updated_booking` - Auto-updates `updated_date`
- ✅ `checked_double_seat_booking` - Prevents double booking
- ✅ `updating_passenger_seat` - Validates seat updates

---

## 🔐 Security Features

### Implemented:
- ✅ Argon2 password hashing
- ✅ JWT token authentication
- ✅ Role-based access control (user/admin)
- ✅ Admin middleware protection
- ✅ Input validation and sanitization
- ✅ Rate limiting middleware
- ✅ Security headers (helmet)
- ✅ CORS configuration
- ✅ Encrypted card numbers (AES-256-CBC)
- ✅ Encrypted passport numbers

---

## 📝 Next Steps

### Priority 1: Complete Admin Reports
1. Create `reportsController.ts`
2. Add reports routes
3. Implement metrics calculation
4. Add CSV/PDF export functionality

### Priority 2: Add Booking Status Update
1. Add status update endpoint to bookings controller
2. Add validation for status transitions
3. Update routes

### Priority 3: Frontend Integration
1. Connect Login page to auth API
2. Implement JWT token storage
3. Add API calls to all frontend pages
4. Handle authentication redirects
5. Implement error handling

### Priority 4: Testing
1. Test all API endpoints
2. Test admin authentication flow
3. Test booking flow end-to-end
4. Test payment processing
5. Load testing for production

---

## 🎯 API Base URL

Development: `http://localhost:8080/api/v1`
Production: TBD

## 📚 API Documentation

Full API documentation is available in the backend README.md file.

---

## ✨ Summary

**Completion Status:**
- Core APIs: ✅ 95% Complete
- Admin APIs: ✅ 90% Complete
- Reports APIs: ⚠️ 0% Complete (needs implementation)
- Frontend Integration: ⚠️ 0% Complete (ready to start)

**What's Working:**
- ✅ User authentication with role-based access
- ✅ Flight search and booking
- ✅ Passenger management
- ✅ Seat selection
- ✅ Payment processing
- ✅ Admin flight management
- ✅ Admin booking management (view/edit)

**What Needs Work:**
- ⚠️ Admin reports endpoints
- ⚠️ Booking status update endpoint
- ⚠️ Frontend-backend integration
- ⚠️ CSV/PDF export functionality
