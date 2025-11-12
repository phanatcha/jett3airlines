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

export const createTestApp = () => {
  const app = express();

  app.use(securityHeaders);
  app.use(cors(corsOptions));
  app.use(generalRateLimit);
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.use(sanitizeInput);

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

  app.use(notFoundHandler);

  app.use(securityErrorHandler);

  app.use(errorHandler);

  return app;
};

const app = createTestApp();
export default app;
