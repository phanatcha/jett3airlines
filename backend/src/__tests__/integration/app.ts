import express from 'express';
import cors from 'cors';
import flightsRouter from '../../routes/flights';
import bookingsRouter from '../../routes/bookings';
import passengersRouter from '../../routes/passengers';
import paymentsRouter from '../../routes/payments';
import seatsRouter from '../../routes/seats';
import adminRouter from '../../routes/admin';
import authRouter from '../../routes/auth';
import reportsRouter from '../../routes/reports';
import baggageRouter from '../../routes/baggage';
import airportsRouter from '../../routes/airports';
import { securityHeaders, generalRateLimit, corsOptions, securityErrorHandler } from '../../middleware/security';
import { errorHandler, notFoundHandler } from '../../middleware/errorHandler';
import { sanitizeInput } from '../../middleware/validation';

// Create test app instance
export const createTestApp = () => {
  const app = express();

  // Security middleware
  app.use(securityHeaders);
  app.use(cors(corsOptions));
  app.use(generalRateLimit);
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Input sanitization middleware
  app.use(sanitizeInput);

  // API routes
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/flights', flightsRouter);
  app.use('/api/v1/bookings', bookingsRouter);
  app.use('/api/v1/passengers', passengersRouter);
  app.use('/api/v1/payments', paymentsRouter);
  app.use('/api/v1/baggage', baggageRouter);
  app.use('/api/v1/seats', seatsRouter);
  app.use('/api/v1/airports', airportsRouter);
  app.use('/api/v1/admin', adminRouter);
  app.use('/api/v1/admin/reports', reportsRouter);

  app.get("/", (req, res) => {
    res.json({
      success: true,
      message: "Airline API Server is running",
      version: "1.0.0"
    });
  });

  // 404 handler
  app.use(notFoundHandler);

  // Security error handling middleware
  app.use(securityErrorHandler);

  // Global error handler
  app.use(errorHandler);

  return app;
};

// Create and export default app instance for tests
const app = createTestApp();
export default app;
