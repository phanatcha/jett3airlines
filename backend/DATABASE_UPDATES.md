# Database Updates and Changes

## Overview
This document outlines the updates made to align the backend code with the updated database schema.

## Key Changes

### 1. Password Hashing
- **Changed from**: bcrypt
- **Changed to**: argon2
- **Reason**: Database schema specifies argon2 for password hashing
- **Impact**: All password-related operations now use argon2.hash() and argon2.verify()

### 2. Database Users
Two database users have been configured:

#### Admin User
- **Username**: `admin_jett3`
- **Password**: `admin_jett31234`
- **Privileges**: Full access to all tables in `jett3_airline` database
- **Usage**: Backend API operations (default in .env)

#### Passenger User
- **Username**: `passenger`
- **Password**: `passenger1234`
- **Privileges**: 
  - SELECT on all tables
  - INSERT, UPDATE on: client, booking, passenger, baggage
- **Usage**: Limited operations for passenger-facing features

### 3. Schema Updates

#### Client Table
- `password`: Now stored as VARCHAR(255) with argon2 hash (not varbinary)
- `role`: Added field for user roles ('user' or 'admin'), defaults to 'user'

#### Flight Table
- `flight_no`: Added VARCHAR(50) field for flight numbers (e.g., "JT301")
- Format: JT{flight_id padded to 3 digits}

#### Booking Table
- `booking_no`: Added VARCHAR(100) field for booking reference numbers
- Format: BK{booking_id padded to 6 digits}{YYYYMMDD}
- `updated_date`: Automatically updated via trigger `updated_booking`

#### Seat Table
- Class naming conventions:
  - First Class: "FIRSTCLASS"
  - Business: "Business" or "BUSINESS"
  - Premium Economy: "Premium Economy" or "PREMIUM_ECONOMY"
  - Economy: "Economy" or "ECONOMY"

### 4. Database Triggers

#### `updated_booking`
- Automatically sets `updated_date` to NOW() before any UPDATE on booking table

#### `checked_double_seat_booking`
- Prevents double-booking of seats on the same flight
- Triggers before INSERT on passenger table

#### `updating_passenger_seat`
- Prevents seat conflicts when updating passenger seat assignments
- Triggers before UPDATE on passenger table

## Migration Steps

### 1. Install Dependencies
```bash
cd backend
npm install argon2
```

### 2. Update Environment Variables
Update `.env` file with the admin database user:
```env
DB_USER=admin_jett3
DB_PASSWORD=admin_jett31234
```

### 3. Run Database Updates
Execute the SQL script to add flight and booking numbers:
```bash
mysql -u admin_jett3 -p jett3_airline < update_flight_booking_numbers.sql
```

### 4. Test the Changes
```bash
npm run dev
```

## API Impact

### Authentication
- Login and registration now use argon2 for password verification
- Existing passwords in database should already be argon2 hashed

### Booking Operations
- New bookings will automatically receive a `booking_no`
- Booking updates trigger automatic `updated_date` update

### Flight Operations
- Flights now include `flight_no` in responses
- Flight numbers follow format: JT001, JT002, etc.

### Seat Selection
- Seat class values are case-sensitive
- Double-booking prevention is enforced at database level

## Security Considerations

1. **Password Storage**: Argon2 provides better security than bcrypt
2. **Card Number Encryption**: Still uses AES-256-CBC encryption
3. **Passport Encryption**: Stored as varbinary in database
4. **Database Users**: Use principle of least privilege (passenger user has limited access)

## Testing Checklist

- [ ] User registration with argon2 password hashing
- [ ] User login with argon2 password verification
- [ ] Booking creation with automatic booking_no generation
- [ ] Flight queries returning flight_no
- [ ] Seat double-booking prevention
- [ ] Booking update triggering updated_date
- [ ] Database connection with admin_jett3 user

## Rollback Plan

If issues occur:
1. Revert `.env` to use root user
2. Reinstall bcrypt: `npm install bcrypt`
3. Revert Client.ts model changes
4. Remove argon2: `npm uninstall argon2`

## Future Enhancements

1. Add automatic flight_no generation on flight creation
2. Implement booking_no generation in application layer
3. Add role-based access control using client.role field
4. Create separate connection pools for admin and passenger users
