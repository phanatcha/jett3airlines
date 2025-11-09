# Jett3 Airlines - Full Stack Application

A complete airline booking system with React frontend and Express backend, featuring flight search, booking management, payment processing, and admin operations.

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jett3airlines
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

3. **Setup database**
   ```bash
   cd backend
   mysql -u root -p < jett3_airline.sql
   mysql -u root -p jett3_airline < create_admin_user.sql
   ```

4. **Configure environment**
   ```bash
   # Create backend/.env file
   cp backend/.env.example backend/.env
   # Edit backend/.env with your database credentials
   ```

5. **Start the application**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080

## 📁 Project Structure

```
jett3airlines/
├── backend/                    # Express.js backend
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── models/            # Database models
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Custom middleware
│   │   ├── utils/             # Utility functions
│   │   └── __tests__/         # Tests
│   ├── .env                   # Environment variables
│   └── package.json
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── context/           # Context providers
│   │   ├── services/          # API services
│   │   └── utils/             # Utility functions
│   └── package.json
│
├── INTEGRATION_SUMMARY.md      # Integration overview
├── INTEGRATION_QUICKSTART.md   # Quick setup guide
└── check-integration.ps1       # Health check script
```

## 🔧 Technology Stack

### Backend
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: express-validator
- **Security**: helmet, cors, rate-limiting
- **Testing**: Jest, Supertest

### Frontend
- **Framework**: React 19
- **Routing**: React Router v7
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: Context API
- **Build Tool**: Vite

## 🎯 Features

### User Features
- ✅ User registration and authentication
- ✅ Flight search and filtering
- ✅ Multi-passenger booking
- ✅ Seat selection
- ✅ Payment processing
- ✅ Booking management
- ✅ Baggage tracking
- ✅ Profile management

### Admin Features
- ✅ Flight management (CRUD)
- ✅ Booking management
- ✅ Client management
- ✅ Payment tracking
- ✅ Airport management
- ✅ Airplane management
- ✅ Revenue reports
- ✅ Booking statistics
- ✅ Flight occupancy reports

## 📚 Documentation

- **[Integration Summary](INTEGRATION_SUMMARY.md)** - Overview of the integration
- **[Quick Start Guide](INTEGRATION_QUICKSTART.md)** - Step-by-step setup
- **[API Integration Guide](frontend/API_INTEGRATION.md)** - Detailed API documentation
- **[Backend README](backend/README.md)** - Backend-specific documentation
- **[Code Examples](frontend/src/components/ExampleAPIUsage.jsx)** - Usage examples

## 🔐 Default Credentials

### Admin Account
- Username: `admin`
- Password: `admin123`

### Test User
Create a new account through the registration flow at `/signup`

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run integration tests
npm test -- --testPathPatterns=integration

# Run with coverage
npm test -- --coverage
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 🔍 Health Check

Run the integration health check script:

```powershell
.\check-integration.ps1
```

This will verify:
- Node.js and npm installation
- MySQL service status
- Required directories and files
- Dependencies installation
- Port availability
- Server status

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/profile` - Update profile

### Flights
- `GET /api/v1/flights/search` - Search flights
- `GET /api/v1/flights/:id` - Get flight details
- `GET /api/v1/flights/:id/seats` - Get available seats

### Bookings
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings` - Get user bookings
- `GET /api/v1/bookings/:id` - Get booking details
- `PUT /api/v1/bookings/:id` - Update booking
- `DELETE /api/v1/bookings/:id` - Cancel booking

### Payments
- `POST /api/v1/payments` - Process payment
- `GET /api/v1/payments/:bookingId` - Get payment status

### Admin
- `GET /api/v1/admin/bookings` - Get all bookings
- `GET /api/v1/admin/flights` - Get all flights
- `POST /api/v1/admin/flights` - Create flight
- `GET /api/v1/admin/reports/revenue` - Revenue report
- And more...

See [API Integration Guide](frontend/API_INTEGRATION.md) for complete API documentation.

## 🛠️ Development

### Backend Development

```bash
cd backend

# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Frontend Development

```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🐛 Troubleshooting

### CORS Errors
- Ensure `CORS_ORIGIN=http://localhost:5173` in `backend/.env`
- Restart backend server after changing .env

### Database Connection Failed
- Verify MySQL is running
- Check database credentials in `backend/.env`
- Ensure database exists: `SHOW DATABASES;`

### 401 Unauthorized
- Check if logged in (token in localStorage)
- Try logging in again
- Verify JWT_SECRET in backend .env

### Port Already in Use
- Backend (8080): Stop other services using port 8080
- Frontend (5173): Stop other Vite instances

See [Quick Start Guide](INTEGRATION_QUICKSTART.md) for more troubleshooting tips.

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- Input validation and sanitization
- SQL injection prevention
- XSS protection with helmet
- Secure HTTP headers

## 📈 Performance

- Request/response interceptors for efficient API calls
- Automatic token management
- Error handling and retry logic
- Optimized database queries
- Connection pooling

## 🚧 Future Enhancements

- [ ] Real-time flight updates with WebSockets
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Advanced search filters
- [ ] Loyalty program
- [ ] Social media integration
- [ ] Payment gateway integration
- [ ] Automated testing (E2E)

## 📝 License

This project is licensed under the ISC License.

## 👥 Contributors

- Development Team

## 📞 Support

For issues and questions:
1. Check the [Quick Start Guide](INTEGRATION_QUICKSTART.md)
2. Review [API Integration Guide](frontend/API_INTEGRATION.md)
3. Run health check: `.\check-integration.ps1`
4. Check backend console for errors
5. Check browser console for errors

## 🎉 Acknowledgments

- Express.js team
- React team
- MySQL team
- All open-source contributors

---

**Happy Coding! ✈️**
