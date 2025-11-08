import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import flightsRouter from './routes/flights';
import bookingsRouter from './routes/bookings';
import passengersRouter from './routes/passengers';
import paymentsRouter from './routes/payments';
import seatsRouter from './routes/seats';
import adminRouter from './routes/admin';
import authRouter from './routes/auth';
import reportsRouter from './routes/reports';
import { securityHeaders, generalRateLimit, corsOptions, securityErrorHandler } from './middleware/security';

dotenv.config();
const app = express();
const port = process.env.PORT || 8080;

// Security middleware
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(generalRateLimit);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection is handled by the Database class in db.ts

// API routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/flights', flightsRouter);
app.use('/api/v1/bookings', bookingsRouter);
app.use('/api/v1/passengers', passengersRouter);
app.use('/api/v1/payments', paymentsRouter);
app.use('/api/v1/home', seatsRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/admin/reports', reportsRouter);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Airline API Server is running",
    version: "1.0.0",
    endpoints: {
      auth: "/api/v1/auth",
      flights: "/api/v1/flights",
      bookings: "/api/v1/bookings",
      passengers: "/api/v1/passengers",
      payments: "/api/v1/payments",
      seats: "/api/v1/home",
      admin: "/api/v1/admin",
      reports: "/api/v1/admin/reports"
    }
  });
});

// Security error handling middleware
app.use(securityErrorHandler);

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error'
    }
  });
});

// 404 handler - catch all unmatched routes
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    }
  });
});

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));