# Admin Authentication System

## Overview

The Jett3Airlines backend uses role-based authentication to distinguish between regular users and administrators. Admin access is determined by the `role` field in the `client` table, which can be either `'user'` or `'admin'`.

## How It Works

### 1. **Login Process**

When a user logs in:
- The system verifies credentials using argon2 password hashing
- If credentials are valid, a JWT token is generated containing:
  - `client_id`
  - `username`
  - `email`
  - `role` (either 'user' or 'admin')
- The response includes an `isAdmin` boolean flag for easy frontend checking

### 2. **Admin Route Protection**

All admin routes (`/api/v1/admin/*`) are protected by two middleware layers:

1. **`authenticateToken`** - Verifies the JWT token is valid
2. **`requireAdmin`** - Checks if the user's role is 'admin'

If either check fails, the request is rejected with appropriate error messages.

### 3. **Frontend Integration**

The frontend should:
1. Store the JWT token and user data (including role) after login
2. Check the `isAdmin` flag or `role` field to determine if user is admin
3. Redirect to admin dashboard if `isAdmin === true`
4. Include the JWT token in all API requests via Authorization header

## Creating an Admin User

### Method 1: Using the Script (Recommended)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Run the admin user generator script:
   ```bash
   npx ts-node scripts/createAdminUser.ts
   ```

3. Copy the generated SQL and run it in your MySQL database

4. The default credentials will be:
   - **Username**: `admin`
   - **Password**: `admin123`
   - **Email**: `admin@jett3airlines.com`

### Method 2: Manual SQL Insert

You can manually insert an admin user by:

1. Hash a password using argon2 (you can use an online tool or Node.js)
2. Insert into the `client` table with `role = 'admin'`

Example:
```sql
INSERT INTO `client` (
  `username`, `password`, `email`, `phone_no`, 
  `firstname`, `lastname`, `dob`, `street`, `city`, 
  `province`, `Country`, `postalcode`, `card_no`, 
  `four_digit`, `payment_type`, `role`
) VALUES (
  'admin',
  '$argon2id$v=19$m=65536,t=3,p=4$...',  -- argon2 hashed password
  'admin@jett3airlines.com',
  '+66812345678',
  'Admin',
  'User',
  '1990-01-01',
  '123 Admin Street',
  'Bangkok',
  'Bangkok',
  'Thailand',
  '10100',
  0x6a1ba53b64749136fe7a54e241ee928a,
  '0000',
  'VISA',
  'admin'
);
```

### Method 3: Update Existing User

To promote an existing user to admin:

```sql
UPDATE `client` 
SET `role` = 'admin' 
WHERE `username` = 'your_username';
```

## API Endpoints

### Login (for both users and admins)

**POST** `/api/v1/auth/login`

Request:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

Response (Admin):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "client": {
      "client_id": 1,
      "username": "admin",
      "email": "admin@jett3airlines.com",
      "role": "admin",
      ...
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    },
    "isAdmin": true
  }
}
```

### Admin Routes

All admin routes require:
- Valid JWT token in Authorization header: `Bearer <token>`
- User role must be 'admin'

Examples:
- `GET /api/v1/admin/flights` - Get all flights
- `POST /api/v1/admin/flights` - Create new flight
- `PUT /api/v1/admin/flights/:id` - Update flight
- `DELETE /api/v1/admin/flights/:id` - Delete flight
- `GET /api/v1/admin/airplanes` - Get all airplanes
- etc.

## Security Considerations

1. **Password Security**
   - All passwords are hashed using argon2 (more secure than bcrypt)
   - Never store plain text passwords

2. **Token Security**
   - JWT tokens contain the user's role
   - Tokens are signed and verified on each request
   - Tokens expire after a set time (configurable in config)

3. **Role Verification**
   - Role is checked on every admin route request
   - Role cannot be modified via API (only via direct database access)

4. **Admin Account Protection**
   - Change default admin password immediately after setup
   - Use strong passwords for admin accounts
   - Limit the number of admin accounts
   - Monitor admin activity logs

## Frontend Implementation Example

```javascript
// After login
const loginResponse = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
});

const data = await loginResponse.json();

if (data.success) {
  // Store token and user data
  localStorage.setItem('accessToken', data.data.tokens.accessToken);
  localStorage.setItem('user', JSON.stringify(data.data.client));
  
  // Check if admin and redirect
  if (data.data.isAdmin) {
    window.location.href = '/admin';
  } else {
    window.location.href = '/dashboard';
  }
}

// Making admin API calls
const token = localStorage.getItem('accessToken');
const response = await fetch('/api/v1/admin/flights', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## Troubleshooting

### "Admin access required" error
- Verify the user's role is set to 'admin' in the database
- Check that the JWT token contains the correct role
- Ensure the token hasn't expired

### "Authentication required" error
- Verify the Authorization header is included
- Check that the token format is correct: `Bearer <token>`
- Ensure the token is valid and not expired

### Cannot create admin user
- Verify database connection
- Check that the `role` column exists in the `client` table
- Ensure argon2 is properly installed: `npm install argon2`

## Testing

To test admin authentication:

1. Create an admin user using one of the methods above
2. Login with admin credentials
3. Verify the response includes `isAdmin: true`
4. Try accessing an admin endpoint with the token
5. Try accessing the same endpoint with a regular user token (should fail)

## Database Schema

The `client` table includes:
```sql
`role` varchar(50) DEFAULT 'user'
```

Valid values:
- `'user'` - Regular user (default)
- `'admin'` - Administrator with full access
