# Airline Backend API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Authentication](#authentication)
4. [API Endpoints](#api-endpoints)
   - [Authentication Endpoints](#authentication-endpoints)
   - [Flight Endpoints](#flight-endpoints)
   - [Booking Endpoints](#booking-endpoints)
   - [Payment Endpoints](#payment-endpoints)
   - [Baggage Endpoints](#baggage-endpoints)
   - [Admin Endpoints](#admin-endpoints)
   - [Reports Endpoints](#reports-endpoints)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Security](#security)

## Overview

The Airline Backend API is a comprehensive RESTful API built with TypeScript, Express.js, and MySQL. It provides endpoints for managing airline operations including flight bookings, passenger management, payments, and baggage tracking.

**Base URL**: `http://localhost:3000/api/v1`

**API Version**: v1

**Response Format**: JSON

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file with appropriate values (see Environment Configuration section)

5. Import the database schema:
```bash
mysql -u your_username -p jett3_airline < jett3_airline(1)\ fixed\ now.sql
```

6. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### Environment Configuration

Create a `.env` file in the backend directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=jett3_airline

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Security Configuration
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

**Important**: 
- Change `JWT_SECRET` to a strong, random string in production
- Use strong database credentials
- Adjust `CORS_ORIGIN` to match your frontend URL

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Most endpoints require authentication.

### Authentication Flow

1. **Register** a new account using `/api/v1/auth/register`
2. **Login** with credentials to receive a JWT token at `/api/v1/auth/login`
3. Include the token in subsequent requests using the `Authorization` header:
   ```
   Authorization: Bearer <your_jwt_token>
   ```

### Token Expiration

- Access tokens expire after 24 hours (configurable via `JWT_EXPIRES_IN`)
- Refresh tokens expire after 7 days (configurable via `JWT_REFRESH_EXPIRES_IN`)
- Use the `/api/v1/auth/refresh` endpoint to obtain a new access token

### Admin Authentication

Admin endpoints require both:
1. Valid JWT token
2. Admin role in the database (`is_admin = 1` in client table)

---

## API Endpoints


### Authentication Endpoints

#### Register New Client

**POST** `/api/v1/auth/register`

Register a new client account.

**Access**: Public

**Request Body**:
```json
{
  "username": "johndoe",
  "password": "SecurePassword123!",
  "email": "john.doe@example.com",
  "phone_no": "+1234567890",
  "firstname": "John",
  "lastname": "Doe",
  "dob": "1990-01-15",
  "street": "123 Main St",
  "city": "New York",
  "province": "NY",
  "country": "USA",
  "postalcode": "10001",
  "card_no": "4111111111111111",
  "four_digit": "1234",
  "payment_type": "Visa"
}
```

**Success Response** (201):
```json
{
  "success": true,
  "message": "Client registered successfully",
  "data": {
    "client_id": 1,
    "username": "johndoe",
    "email": "john.doe@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response** (400):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Username already exists"
  }
}
```

---

#### Login

**POST** `/api/v1/auth/login`

Authenticate a client and receive a JWT token.

**Access**: Public

**Request Body**:
```json
{
  "username": "johndoe",
  "password": "SecurePassword123!"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "client_id": 1,
    "username": "johndoe",
    "email": "john.doe@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response** (401):
```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Invalid username or password"
  }
}
```

---

#### Get Profile

**GET** `/api/v1/auth/profile`

Get the authenticated client's profile information.

**Access**: Private (requires authentication)

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "client_id": 1,
    "username": "johndoe",
    "email": "john.doe@example.com",
    "phone_no": "+1234567890",
    "firstname": "John",
    "lastname": "Doe",
    "dob": "1990-01-15",
    "street": "123 Main St",
    "city": "New York",
    "province": "NY",
    "country": "USA",
    "postalcode": "10001",
    "four_digit": "1234",
    "payment_type": "Visa"
  }
}
```

---

#### Update Profile

**PUT** `/api/v1/auth/profile`

Update the authenticated client's profile information.

**Access**: Private (requires authentication)

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body** (all fields optional):
```json
{
  "email": "newemail@example.com",
  "phone_no": "+1987654321",
  "street": "456 Oak Ave",
  "city": "Los Angeles",
  "province": "CA",
  "postalcode": "90001"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "client_id": 1,
    "username": "johndoe",
    "email": "newemail@example.com"
  }
}
```

---

#### Change Password

**PUT** `/api/v1/auth/password`

Change the authenticated client's password.

**Access**: Private (requires authentication)

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewSecurePassword456!"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

#### Refresh Token

**POST** `/api/v1/auth/refresh`

Refresh an expired access token.

**Access**: Private (requires valid refresh token)

**Headers**:
```
Authorization: Bearer <refresh_token>
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### Logout

**POST** `/api/v1/auth/logout`

Logout the authenticated client (client-side token removal).

**Access**: Private (requires authentication)

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---


### Flight Endpoints

#### Search Flights

**GET** `/api/v1/flights/search`

Search for available flights based on criteria.

**Access**: Public

**Query Parameters**:
- `depart_airport_id` (required): Departure airport ID
- `arrive_airport_id` (required): Arrival airport ID
- `depart_date` (required): Departure date (YYYY-MM-DD format)
- `passengers` (optional): Number of passengers (default: 1)
- `class` (optional): Seat class filter (Economy, Business, First)

**Example Request**:
```
GET /api/v1/flights/search?depart_airport_id=1&arrive_airport_id=2&depart_date=2024-12-25&passengers=2&class=Economy
```

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "flight_id": 101,
      "depart_when": "2024-12-25T08:00:00Z",
      "arrive_when": "2024-12-25T12:00:00Z",
      "status": "Scheduled",
      "airplane": {
        "airplane_id": 1,
        "type": "Boeing 737",
        "capacity": 180
      },
      "depart_airport": {
        "airport_id": 1,
        "airport_name": "JFK International",
        "city_name": "New York",
        "iata_code": "JFK"
      },
      "arrive_airport": {
        "airport_id": 2,
        "airport_name": "LAX International",
        "city_name": "Los Angeles",
        "iata_code": "LAX"
      },
      "available_seats": {
        "Economy": 45,
        "Business": 12,
        "First": 4
      },
      "min_price": 299.99
    }
  ]
}
```

---

#### Get Flight Details

**GET** `/api/v1/flights/:id`

Get detailed information about a specific flight.

**Access**: Public

**Path Parameters**:
- `id`: Flight ID

**Example Request**:
```
GET /api/v1/flights/101
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "flight_id": 101,
    "depart_when": "2024-12-25T08:00:00Z",
    "arrive_when": "2024-12-25T12:00:00Z",
    "status": "Scheduled",
    "airplane": {
      "airplane_id": 1,
      "type": "Boeing 737",
      "registration": "N12345",
      "capacity": 180,
      "manufacturing_year": 2018
    },
    "depart_airport": {
      "airport_id": 1,
      "airport_name": "JFK International",
      "city_name": "New York",
      "country_name": "USA",
      "iata_code": "JFK"
    },
    "arrive_airport": {
      "airport_id": 2,
      "airport_name": "LAX International",
      "city_name": "Los Angeles",
      "country_name": "USA",
      "iata_code": "LAX"
    },
    "duration_minutes": 360,
    "available_seats": 61
  }
}
```

**Error Response** (404):
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Flight not found"
  }
}
```

---

#### Get Flight Seats

**GET** `/api/v1/flights/:id/seats`

Get available seats for a specific flight with pricing information.

**Access**: Public

**Path Parameters**:
- `id`: Flight ID

**Query Parameters**:
- `class` (optional): Filter by seat class (Economy, Business, First)

**Example Request**:
```
GET /api/v1/flights/101/seats?class=Economy
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "flight_id": 101,
    "seats": [
      {
        "seat_id": 1,
        "seat_no": "1A",
        "class": "First",
        "price": 899.99,
        "is_available": true
      },
      {
        "seat_id": 15,
        "seat_no": "5C",
        "class": "Economy",
        "price": 299.99,
        "is_available": true
      }
    ],
    "summary": {
      "total_seats": 180,
      "available_seats": 61,
      "by_class": {
        "Economy": {
          "total": 150,
          "available": 45,
          "price_range": { "min": 299.99, "max": 349.99 }
        },
        "Business": {
          "total": 24,
          "available": 12,
          "price_range": { "min": 599.99, "max": 699.99 }
        },
        "First": {
          "total": 6,
          "available": 4,
          "price_range": { "min": 899.99, "max": 999.99 }
        }
      }
    }
  }
}
```

---

#### Check Seat Availability

**POST** `/api/v1/flights/:id/seats/check`

Check if specific seats are available before booking.

**Access**: Public

**Path Parameters**:
- `id`: Flight ID

**Request Body**:
```json
{
  "seat_ids": [15, 16, 17]
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "all_available": true,
    "seats": [
      {
        "seat_id": 15,
        "seat_no": "5C",
        "is_available": true
      },
      {
        "seat_id": 16,
        "seat_no": "5D",
        "is_available": true
      },
      {
        "seat_id": 17,
        "seat_no": "5E",
        "is_available": true
      }
    ]
  }
}
```

---


### Booking Endpoints

#### Create Booking

**POST** `/api/v1/bookings`

Create a new flight booking with passengers and seat selection.

**Access**: Private (requires authentication)

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "flight_id": 101,
  "support": "Yes",
  "fasttrack": "No",
  "passengers": [
    {
      "firstname": "John",
      "lastname": "Doe",
      "dob": "1990-01-15",
      "nationality": "USA",
      "passport_no": "P123456789",
      "passport_expiry": "2028-01-15",
      "seat_id": 15
    },
    {
      "firstname": "Jane",
      "lastname": "Doe",
      "dob": "1992-05-20",
      "nationality": "USA",
      "passport_no": "P987654321",
      "passport_expiry": "2027-05-20",
      "seat_id": 16
    }
  ]
}
```

**Success Response** (201):
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "booking_id": 501,
    "booking_no": "BK20241225001",
    "status": "Pending",
    "total_cost": 649.98,
    "flight": {
      "flight_id": 101,
      "depart_when": "2024-12-25T08:00:00Z",
      "arrive_when": "2024-12-25T12:00:00Z"
    },
    "passengers": [
      {
        "passenger_id": 1001,
        "firstname": "John",
        "lastname": "Doe",
        "seat_no": "5C"
      },
      {
        "passenger_id": 1002,
        "firstname": "Jane",
        "lastname": "Doe",
        "seat_no": "5D"
      }
    ],
    "created_date": "2024-11-08T10:30:00Z"
  }
}
```

**Error Response** (409):
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Seat 5C is already booked"
  }
}
```

---

#### Get Booking History

**GET** `/api/v1/bookings`

Get all bookings for the authenticated client.

**Access**: Private (requires authentication)

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by booking status

**Example Request**:
```
GET /api/v1/bookings?page=1&limit=10&status=Confirmed
```

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "booking_id": 501,
      "booking_no": "BK20241225001",
      "status": "Confirmed",
      "total_cost": 649.98,
      "created_date": "2024-11-08T10:30:00Z",
      "flight": {
        "flight_id": 101,
        "depart_when": "2024-12-25T08:00:00Z",
        "arrive_when": "2024-12-25T12:00:00Z",
        "depart_airport": "JFK",
        "arrive_airport": "LAX"
      },
      "passenger_count": 2
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

---

#### Get Booking Details

**GET** `/api/v1/bookings/:bookingId`

Get detailed information about a specific booking.

**Access**: Private (requires authentication, own bookings only)

**Headers**:
```
Authorization: Bearer <token>
```

**Path Parameters**:
- `bookingId`: Booking ID

**Example Request**:
```
GET /api/v1/bookings/501
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "booking_id": 501,
    "booking_no": "BK20241225001",
    "status": "Confirmed",
    "support": "Yes",
    "fasttrack": "No",
    "total_cost": 649.98,
    "created_date": "2024-11-08T10:30:00Z",
    "updated_date": "2024-11-08T11:00:00Z",
    "flight": {
      "flight_id": 101,
      "depart_when": "2024-12-25T08:00:00Z",
      "arrive_when": "2024-12-25T12:00:00Z",
      "status": "Scheduled",
      "depart_airport": {
        "airport_name": "JFK International",
        "city_name": "New York",
        "iata_code": "JFK"
      },
      "arrive_airport": {
        "airport_name": "LAX International",
        "city_name": "Los Angeles",
        "iata_code": "LAX"
      }
    },
    "passengers": [
      {
        "passenger_id": 1001,
        "firstname": "John",
        "lastname": "Doe",
        "nationality": "USA",
        "seat_no": "5C",
        "seat_class": "Economy"
      },
      {
        "passenger_id": 1002,
        "firstname": "Jane",
        "lastname": "Doe",
        "nationality": "USA",
        "seat_no": "5D",
        "seat_class": "Economy"
      }
    ],
    "payment": {
      "payment_id": 301,
      "amount": 649.98,
      "status": "Completed",
      "payment_date": "2024-11-08T11:00:00Z"
    }
  }
}
```

---

#### Update Booking

**PUT** `/api/v1/bookings/:bookingId`

Update booking information (support and fasttrack services).

**Access**: Private (requires authentication, own bookings only)

**Headers**:
```
Authorization: Bearer <token>
```

**Path Parameters**:
- `bookingId`: Booking ID

**Request Body**:
```json
{
  "support": "No",
  "fasttrack": "Yes"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Booking updated successfully",
  "data": {
    "booking_id": 501,
    "support": "No",
    "fasttrack": "Yes",
    "updated_date": "2024-11-08T12:00:00Z"
  }
}
```

---

#### Cancel Booking

**DELETE** `/api/v1/bookings/:bookingId`

Cancel a booking and process refund if applicable.

**Access**: Private (requires authentication, own bookings only)

**Headers**:
```
Authorization: Bearer <token>
```

**Path Parameters**:
- `bookingId`: Booking ID

**Example Request**:
```
DELETE /api/v1/bookings/501
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "booking_id": 501,
    "status": "Cancelled",
    "refund": {
      "amount": 649.98,
      "status": "Processed",
      "refund_date": "2024-11-08T13:00:00Z"
    }
  }
}
```

---


### Payment Endpoints

#### Process Payment

**POST** `/api/v1/payments`

Process payment for a booking.

**Access**: Private (requires authentication)

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "booking_id": 501,
  "amount": 649.98,
  "payment_method": "card",
  "card_no": "4111111111111111",
  "cvv": "123",
  "expiry_date": "12/25"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "payment_id": 301,
    "booking_id": 501,
    "amount": 649.98,
    "status": "Completed",
    "payment_date": "2024-11-08T11:00:00Z",
    "transaction_id": "TXN20241108001",
    "receipt_url": "/api/v1/payments/receipt/301"
  }
}
```

**Error Response** (400):
```json
{
  "success": false,
  "error": {
    "code": "PAYMENT_ERROR",
    "message": "Payment processing failed: Invalid card number"
  }
}
```

---

#### Get Payment Status

**GET** `/api/v1/payments/booking/:bookingId`

Get payment status for a specific booking.

**Access**: Private (requires authentication)

**Headers**:
```
Authorization: Bearer <token>
```

**Path Parameters**:
- `bookingId`: Booking ID

**Example Request**:
```
GET /api/v1/payments/booking/501
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "payment_id": 301,
    "booking_id": 501,
    "amount": 649.98,
    "status": "Completed",
    "payment_method": "card",
    "payment_date": "2024-11-08T11:00:00Z",
    "transaction_id": "TXN20241108001"
  }
}
```

---

#### Get Payment Receipt

**GET** `/api/v1/payments/receipt/:paymentId`

Get payment receipt details.

**Access**: Private (requires authentication)

**Headers**:
```
Authorization: Bearer <token>
```

**Path Parameters**:
- `paymentId`: Payment ID

**Example Request**:
```
GET /api/v1/payments/receipt/301
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "receipt_id": "RCP20241108001",
    "payment_id": 301,
    "booking_id": 501,
    "booking_no": "BK20241225001",
    "amount": 649.98,
    "payment_date": "2024-11-08T11:00:00Z",
    "payment_method": "Visa ending in 1111",
    "client": {
      "name": "John Doe",
      "email": "john.doe@example.com"
    },
    "flight": {
      "flight_id": 101,
      "route": "JFK → LAX",
      "depart_when": "2024-12-25T08:00:00Z"
    },
    "passengers": [
      {
        "name": "John Doe",
        "seat": "5C"
      },
      {
        "name": "Jane Doe",
        "seat": "5D"
      }
    ]
  }
}
```

---

#### Get Payment History

**GET** `/api/v1/payments/history`

Get payment history for the authenticated client.

**Access**: Private (requires authentication)

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example Request**:
```
GET /api/v1/payments/history?page=1&limit=10
```

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "payment_id": 301,
      "booking_id": 501,
      "amount": 649.98,
      "status": "Completed",
      "payment_date": "2024-11-08T11:00:00Z",
      "booking_no": "BK20241225001"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1
  }
}
```

---

#### Process Refund

**POST** `/api/v1/payments/refund/:bookingId`

Process a refund for a cancelled booking.

**Access**: Private (requires authentication)

**Headers**:
```
Authorization: Bearer <token>
```

**Path Parameters**:
- `bookingId`: Booking ID

**Request Body**:
```json
{
  "reason": "Flight cancelled by customer"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Refund processed successfully",
  "data": {
    "refund_id": 201,
    "payment_id": 301,
    "booking_id": 501,
    "amount": 649.98,
    "status": "Processed",
    "refund_date": "2024-11-08T13:00:00Z"
  }
}
```

---


### Baggage Endpoints

#### Track Baggage (Public)

**GET** `/api/v1/baggage/track/:trackingNo`

Track baggage by tracking number (public endpoint).

**Access**: Public

**Path Parameters**:
- `trackingNo`: Baggage tracking number

**Example Request**:
```
GET /api/v1/baggage/track/BAG20241108001
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "baggage_id": 701,
    "tracking_no": "BAG20241108001",
    "weight": 23.5,
    "status": "In Transit",
    "last_updated": "2024-11-08T14:30:00Z",
    "passenger": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "flight": {
      "flight_id": 101,
      "route": "JFK → LAX",
      "depart_when": "2024-12-25T08:00:00Z"
    },
    "status_history": [
      {
        "status": "Checked In",
        "timestamp": "2024-11-08T06:00:00Z"
      },
      {
        "status": "In Transit",
        "timestamp": "2024-11-08T14:30:00Z"
      }
    ]
  }
}
```

---

#### Get Baggage by Passenger

**GET** `/api/v1/baggage/passenger/:passengerId`

Get all baggage for a specific passenger.

**Access**: Private (requires authentication)

**Headers**:
```
Authorization: Bearer <token>
```

**Path Parameters**:
- `passengerId`: Passenger ID

**Example Request**:
```
GET /api/v1/baggage/passenger/1001
```

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "baggage_id": 701,
      "tracking_no": "BAG20241108001",
      "weight": 23.5,
      "status": "In Transit",
      "last_updated": "2024-11-08T14:30:00Z"
    },
    {
      "baggage_id": 702,
      "tracking_no": "BAG20241108002",
      "weight": 18.0,
      "status": "Checked In",
      "last_updated": "2024-11-08T06:00:00Z"
    }
  ]
}
```

---

#### Get Baggage Details

**GET** `/api/v1/baggage/:baggageId`

Get detailed information about specific baggage.

**Access**: Private (requires authentication)

**Headers**:
```
Authorization: Bearer <token>
```

**Path Parameters**:
- `baggageId`: Baggage ID

**Example Request**:
```
GET /api/v1/baggage/701
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "baggage_id": 701,
    "tracking_no": "BAG20241108001",
    "weight": 23.5,
    "status": "In Transit",
    "created_date": "2024-11-08T06:00:00Z",
    "last_updated": "2024-11-08T14:30:00Z",
    "passenger": {
      "passenger_id": 1001,
      "firstname": "John",
      "lastname": "Doe",
      "booking_id": 501
    },
    "flight": {
      "flight_id": 101,
      "depart_when": "2024-12-25T08:00:00Z",
      "arrive_when": "2024-12-25T12:00:00Z",
      "route": "JFK → LAX"
    }
  }
}
```

---

#### Create Baggage (Admin)

**POST** `/api/v1/baggage`

Create a new baggage record.

**Access**: Admin

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Request Body**:
```json
{
  "passenger_id": 1001,
  "weight": 23.5,
  "status": "Checked In"
}
```

**Success Response** (201):
```json
{
  "success": true,
  "message": "Baggage created successfully",
  "data": {
    "baggage_id": 701,
    "tracking_no": "BAG20241108001",
    "passenger_id": 1001,
    "weight": 23.5,
    "status": "Checked In",
    "created_date": "2024-11-08T06:00:00Z"
  }
}
```

---

#### Update Baggage Status (Admin)

**PUT** `/api/v1/baggage/:baggageId/status`

Update baggage status.

**Access**: Admin

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Path Parameters**:
- `baggageId`: Baggage ID

**Request Body**:
```json
{
  "status": "Delivered"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Baggage status updated successfully",
  "data": {
    "baggage_id": 701,
    "tracking_no": "BAG20241108001",
    "status": "Delivered",
    "last_updated": "2024-11-08T16:00:00Z"
  }
}
```

---


### Admin Endpoints

All admin endpoints require authentication with an admin account (`is_admin = 1`).

#### Flight Management

##### Get All Flights (Admin)

**GET** `/api/v1/admin/flights`

Get all flights with pagination and filtering.

**Access**: Admin

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by flight status
- `airport_id` (optional): Filter by airport ID

**Example Request**:
```
GET /api/v1/admin/flights?page=1&limit=20&status=Scheduled
```

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "flight_id": 101,
      "depart_when": "2024-12-25T08:00:00Z",
      "arrive_when": "2024-12-25T12:00:00Z",
      "status": "Scheduled",
      "airplane_id": 1,
      "depart_airport_id": 1,
      "arrive_airport_id": 2,
      "booking_count": 45,
      "revenue": 13499.55
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

##### Create Flight (Admin)

**POST** `/api/v1/admin/flights`

Create a new flight.

**Access**: Admin

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Request Body**:
```json
{
  "depart_when": "2024-12-25T08:00:00Z",
  "arrive_when": "2024-12-25T12:00:00Z",
  "airplane_id": 1,
  "depart_airport_id": 1,
  "arrive_airport_id": 2,
  "status": "Scheduled"
}
```

**Success Response** (201):
```json
{
  "success": true,
  "message": "Flight created successfully",
  "data": {
    "flight_id": 102,
    "depart_when": "2024-12-25T08:00:00Z",
    "arrive_when": "2024-12-25T12:00:00Z",
    "status": "Scheduled",
    "airplane_id": 1,
    "depart_airport_id": 1,
    "arrive_airport_id": 2
  }
}
```

---

##### Update Flight (Admin)

**PUT** `/api/v1/admin/flights/:id`

Update flight information.

**Access**: Admin

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Path Parameters**:
- `id`: Flight ID

**Request Body** (all fields optional):
```json
{
  "depart_when": "2024-12-25T09:00:00Z",
  "arrive_when": "2024-12-25T13:00:00Z",
  "status": "Delayed"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Flight updated successfully",
  "data": {
    "flight_id": 101,
    "depart_when": "2024-12-25T09:00:00Z",
    "arrive_when": "2024-12-25T13:00:00Z",
    "status": "Delayed"
  }
}
```

---

##### Delete Flight (Admin)

**DELETE** `/api/v1/admin/flights/:id`

Delete a flight.

**Access**: Admin

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Path Parameters**:
- `id`: Flight ID

**Success Response** (200):
```json
{
  "success": true,
  "message": "Flight deleted successfully"
}
```

---

#### Booking Management

##### Get All Bookings (Admin)

**GET** `/api/v1/admin/bookings`

List all bookings with filtering and pagination.

**Access**: Admin

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by booking status
- `client_id` (optional): Filter by client ID
- `flight_id` (optional): Filter by flight ID

**Example Request**:
```
GET /api/v1/admin/bookings?page=1&limit=20&status=Confirmed
```

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "booking_id": 501,
      "booking_no": "BK20241225001",
      "status": "Confirmed",
      "client_id": 1,
      "client_name": "John Doe",
      "flight_id": 101,
      "flight_route": "JFK → LAX",
      "passenger_count": 2,
      "total_cost": 649.98,
      "created_date": "2024-11-08T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 450,
    "totalPages": 23
  }
}
```

---

##### Get Booking by ID (Admin)

**GET** `/api/v1/admin/bookings/:id`

View specific booking details.

**Access**: Admin

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Path Parameters**:
- `id`: Booking ID

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "booking_id": 501,
    "booking_no": "BK20241225001",
    "status": "Confirmed",
    "support": "Yes",
    "fasttrack": "No",
    "total_cost": 649.98,
    "created_date": "2024-11-08T10:30:00Z",
    "client": {
      "client_id": 1,
      "username": "johndoe",
      "email": "john.doe@example.com",
      "phone_no": "+1234567890"
    },
    "flight": {
      "flight_id": 101,
      "depart_when": "2024-12-25T08:00:00Z",
      "arrive_when": "2024-12-25T12:00:00Z",
      "route": "JFK → LAX"
    },
    "passengers": [
      {
        "passenger_id": 1001,
        "firstname": "John",
        "lastname": "Doe",
        "seat_no": "5C"
      }
    ],
    "payment": {
      "payment_id": 301,
      "amount": 649.98,
      "status": "Completed"
    }
  }
}
```

---

##### Update Booking Status (Admin)

**PATCH** `/api/v1/admin/bookings/:id/status`

Update booking status.

**Access**: Admin

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Path Parameters**:
- `id`: Booking ID

**Request Body**:
```json
{
  "status": "Cancelled"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Booking status updated successfully",
  "data": {
    "booking_id": 501,
    "status": "Cancelled",
    "updated_date": "2024-11-08T15:00:00Z"
  }
}
```

---

#### Airport Management

##### Get All Airports (Admin)

**GET** `/api/v1/admin/airports`

List all airports.

**Access**: Admin

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `search` (optional): Search by name, city, IATA code, or country
- `country` (optional): Filter by country

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "airport_id": 1,
      "city_name": "New York",
      "airport_name": "JFK International",
      "iata_code": "JFK",
      "country_name": "USA"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 120,
    "totalPages": 3
  }
}
```

---

##### Create Airport (Admin)

**POST** `/api/v1/admin/airports`

Create a new airport.

**Access**: Admin

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Request Body**:
```json
{
  "city_name": "Miami",
  "airport_name": "Miami International Airport",
  "iata_code": "MIA",
  "country_name": "USA"
}
```

**Success Response** (201):
```json
{
  "success": true,
  "message": "Airport created successfully",
  "data": {
    "airport_id": 25,
    "city_name": "Miami",
    "airport_name": "Miami International Airport",
    "iata_code": "MIA",
    "country_name": "USA"
  }
}
```

---


### Reports Endpoints

All reports endpoints require admin authentication.

#### Get Metrics

**GET** `/api/v1/admin/reports/metrics`

Get summary metrics including total flights, bookings, revenue, and cancellations.

**Access**: Admin

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "total_flights": 150,
    "total_bookings": 450,
    "total_revenue": 135000.50,
    "total_cancellations": 25,
    "active_clients": 320,
    "pending_payments": 15,
    "completed_payments": 435
  }
}
```

---

#### Get Bookings Per Day

**GET** `/api/v1/admin/reports/bookings-per-day`

Get bookings per day data for charts.

**Access**: Admin

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Query Parameters**:
- `startDate` (optional): Start date (YYYY-MM-DD format)
- `endDate` (optional): End date (YYYY-MM-DD format)
- `days` (optional): Number of days to look back (default: 30)

**Example Request**:
```
GET /api/v1/admin/reports/bookings-per-day?days=7
```

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-11-01",
      "bookings": 15,
      "confirmed": 12,
      "cancelled": 3
    },
    {
      "date": "2024-11-02",
      "bookings": 18,
      "confirmed": 16,
      "cancelled": 2
    }
  ]
}
```

---

#### Get Revenue Per Day

**GET** `/api/v1/admin/reports/revenue-per-day`

Get revenue per day data for charts.

**Access**: Admin

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Query Parameters**:
- `startDate` (optional): Start date (YYYY-MM-DD format)
- `endDate` (optional): End date (YYYY-MM-DD format)
- `days` (optional): Number of days to look back (default: 30)

**Example Request**:
```
GET /api/v1/admin/reports/revenue-per-day?days=7
```

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-11-01",
      "revenue": 4500.75,
      "bookings": 15
    },
    {
      "date": "2024-11-02",
      "revenue": 5400.50,
      "bookings": 18
    }
  ]
}
```

---

#### Get Flight Stats

**GET** `/api/v1/admin/reports/flight-stats`

Get flight statistics.

**Access**: Admin

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "total_flights": 150,
    "by_status": {
      "Scheduled": 80,
      "Completed": 55,
      "Cancelled": 10,
      "Delayed": 5
    },
    "average_occupancy": 75.5,
    "most_popular_routes": [
      {
        "route": "JFK → LAX",
        "flights": 25,
        "bookings": 450
      }
    ]
  }
}
```

---

#### Get Booking Stats

**GET** `/api/v1/admin/reports/booking-stats`

Get booking statistics.

**Access**: Admin

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "total_bookings": 450,
    "by_status": {
      "Confirmed": 380,
      "Pending": 45,
      "Cancelled": 25
    },
    "average_booking_value": 300.00,
    "total_passengers": 890,
    "average_passengers_per_booking": 1.98
  }
}
```

---

#### Export CSV

**GET** `/api/v1/admin/reports/export/csv`

Export reports as CSV file.

**Access**: Admin

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Query Parameters**:
- `type` (required): Report type (metrics, bookings, revenue, flights)
- `startDate` (optional): Start date (YYYY-MM-DD format)
- `endDate` (optional): End date (YYYY-MM-DD format)

**Example Request**:
```
GET /api/v1/admin/reports/export/csv?type=bookings&startDate=2024-11-01&endDate=2024-11-30
```

**Success Response** (200):
Returns a CSV file with appropriate headers:
```
Content-Type: text/csv
Content-Disposition: attachment; filename="bookings-report-2024-11-01-to-2024-11-30.csv"
```

---

#### Export PDF

**GET** `/api/v1/admin/reports/export/pdf`

Export reports as PDF file.

**Access**: Admin

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Query Parameters**:
- `type` (required): Report type (metrics, bookings, revenue, flights)
- `startDate` (optional): Start date (YYYY-MM-DD format)
- `endDate` (optional): End date (YYYY-MM-DD format)

**Example Request**:
```
GET /api/v1/admin/reports/export/pdf?type=revenue&startDate=2024-11-01&endDate=2024-11-30
```

**Success Response** (200):
Returns a PDF file with appropriate headers:
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="revenue-report-2024-11-01-to-2024-11-30.pdf"
```

---


## Error Handling

The API uses consistent error response formats across all endpoints.

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  },
  "timestamp": "2024-11-08T10:30:00Z"
}
```

### HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| `200` | Success - Request completed successfully |
| `201` | Created - Resource created successfully |
| `400` | Bad Request - Invalid request parameters or body |
| `401` | Unauthorized - Missing or invalid authentication token |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found - Requested resource not found |
| `409` | Conflict - Resource conflict (e.g., seat already booked) |
| `422` | Unprocessable Entity - Validation error |
| `429` | Too Many Requests - Rate limit exceeded |
| `500` | Internal Server Error - Server-side error |

### Error Codes

| Error Code | Description |
|------------|-------------|
| `VALIDATION_ERROR` | Input validation failed |
| `AUTHENTICATION_ERROR` | Authentication failed |
| `AUTHORIZATION_ERROR` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `CONFLICT` | Resource conflict |
| `DATABASE_ERROR` | Database operation failed |
| `PAYMENT_ERROR` | Payment processing failed |
| `RATE_LIMIT_EXCEEDED` | Too many requests |

### Example Error Responses

#### Validation Error (400)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "fields": {
        "email": "Invalid email format",
        "password": "Password must be at least 8 characters"
      }
    }
  },
  "timestamp": "2024-11-08T10:30:00Z"
}
```

#### Authentication Error (401)
```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Invalid or expired token"
  },
  "timestamp": "2024-11-08T10:30:00Z"
}
```

#### Not Found Error (404)
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Flight with ID 999 not found"
  },
  "timestamp": "2024-11-08T10:30:00Z"
}
```

#### Conflict Error (409)
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Seat 5C is already booked for this flight"
  },
  "timestamp": "2024-11-08T10:30:00Z"
}
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse and ensure fair usage.

### Rate Limit Configuration

- **Window**: 15 minutes (900,000 ms)
- **Max Requests**: 100 requests per window
- **Authentication Endpoints**: Stricter limits (20 requests per 15 minutes)

### Rate Limit Headers

Every response includes rate limit information in headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699445400
```

### Rate Limit Exceeded Response (429)

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "retryAfter": 300
    }
  },
  "timestamp": "2024-11-08T10:30:00Z"
}
```

---

## Security

### Authentication

- **JWT Tokens**: All authenticated endpoints require a valid JWT token
- **Token Format**: `Authorization: Bearer <token>`
- **Token Expiration**: 24 hours for access tokens, 7 days for refresh tokens
- **Secure Storage**: Store tokens securely (e.g., httpOnly cookies, secure storage)

### Password Security

- **Hashing**: Passwords are hashed using bcrypt with 12 rounds
- **Requirements**: Minimum 8 characters (enforced by validation)
- **Never Transmitted**: Passwords are never returned in API responses

### Data Encryption

- **Sensitive Data**: Card numbers, passport numbers, and passwords are encrypted
- **HTTPS**: Always use HTTPS in production
- **PCI Compliance**: Card data handling follows PCI DSS guidelines

### CORS

- **Allowed Origins**: Configured via `CORS_ORIGIN` environment variable
- **Credentials**: Supports credentials for authenticated requests
- **Methods**: GET, POST, PUT, PATCH, DELETE

### Security Headers

The API uses Helmet.js to set security headers:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`

### Input Validation

- **Sanitization**: All inputs are sanitized to prevent XSS attacks
- **Validation**: express-validator is used for comprehensive input validation
- **SQL Injection**: Parameterized queries prevent SQL injection

### Best Practices

1. **Never expose JWT_SECRET**: Keep it secure and change it regularly
2. **Use HTTPS**: Always use HTTPS in production
3. **Rotate Tokens**: Implement token rotation for long-lived sessions
4. **Monitor**: Log and monitor suspicious activities
5. **Update Dependencies**: Keep all dependencies up to date
6. **Environment Variables**: Never commit sensitive data to version control

---

## Testing the API

### Using cURL

#### Register a new client:
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "TestPass123!",
    "email": "test@example.com",
    "phone_no": "+1234567890",
    "firstname": "Test",
    "lastname": "User",
    "dob": "1990-01-01",
    "street": "123 Test St",
    "city": "Test City",
    "province": "TC",
    "country": "USA",
    "postalcode": "12345",
    "card_no": "4111111111111111",
    "four_digit": "1234",
    "payment_type": "Visa"
  }'
```

#### Login:
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "TestPass123!"
  }'
```

#### Search flights:
```bash
curl -X GET "http://localhost:3000/api/v1/flights/search?depart_airport_id=1&arrive_airport_id=2&depart_date=2024-12-25"
```

#### Get profile (authenticated):
```bash
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman

1. Import the API endpoints into Postman
2. Set up environment variables for `base_url` and `token`
3. Use the Collection Runner for automated testing
4. Save common requests for reuse

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

---

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET` (minimum 32 characters)
- [ ] Configure production database credentials
- [ ] Enable HTTPS/SSL
- [ ] Set appropriate `CORS_ORIGIN`
- [ ] Configure rate limiting for production load
- [ ] Set up logging and monitoring
- [ ] Configure backup strategy for database
- [ ] Review and update security headers
- [ ] Set up error tracking (e.g., Sentry)

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
DB_HOST=your-production-db-host
DB_PORT=3306
DB_USER=your-production-db-user
DB_PASSWORD=your-strong-production-password
DB_NAME=jett3_airline
JWT_SECRET=your-very-strong-production-secret-minimum-32-characters
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=https://your-production-frontend.com
```

### Building for Production

```bash
# Install dependencies
npm install --production

# Build TypeScript
npm run build

# Start production server
npm start
```

### Docker Deployment (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t airline-backend .
docker run -p 3000:3000 --env-file .env airline-backend
```

---

## Support and Contact

For issues, questions, or contributions:

- **Repository**: [Your Repository URL]
- **Documentation**: This file
- **Issues**: [Your Issues URL]

---

## Changelog

### Version 1.0.0 (2024-11-08)

- Initial release
- Complete authentication system
- Flight search and management
- Booking system with passenger management
- Payment processing
- Baggage tracking
- Admin management endpoints
- Reports and analytics
- Comprehensive error handling
- Rate limiting and security features

---

**Last Updated**: November 8, 2024
