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
import baggageRouter from './routes/baggage';
import airportsRouter from './routes/airports';
import { securityHeaders, generalRateLimit, corsOptions, securityErrorHandler } from './middleware/security';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { sanitizeInput } from './middleware/validation';

dotenv.config();
const app = express();
const port = process.env.PORT || 8080;

app.use(securityHeaders);
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174',
    'https://jett3airlines-h9qjglnfk-patters-projects-d55ba5ab.vercel.app',
    /^https:\/\/.*\.vercel\.app$/
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(sanitizeInput);

app.use((req, res, next) => {
  console.log(`🔥 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log(`   Headers:`, req.headers);
  console.log(`   Body:`, req.body);
  next();
});


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
    version: "1.0.0",
    endpoints: {
      auth: "/api/v1/auth",
      flights: "/api/v1/flights",
      bookings: "/api/v1/bookings",
      passengers: "/api/v1/passengers",
      payments: "/api/v1/payments",
      baggage: "/api/v1/baggage",
      seats: "/api/v1/seats",
      airports: "/api/v1/airports",
      admin: "/api/v1/admin",
      reports: "/api/v1/admin/reports"
    }
  });
});

app.use(notFoundHandler);

app.use(securityErrorHandler);

app.use(errorHandler);

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));