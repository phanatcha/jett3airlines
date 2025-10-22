import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import flightsRouter from './routes/flights';
import bookingsRouter from './routes/bookings';
import passengersRouter from './routes/passengers';
import paymentsRouter from './routes/payments';
import seatsRouter from './routes/seats';
import adminRouter from './routes/admin';

dotenv.config();
const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.use('/api/v1/flights', flightsRouter);
app.use('/api/v1/bookings', bookingsRouter);
app.use('/api/v1/passengers', passengersRouter);
app.use('/api/v1/payments', paymentsRouter);
app.use('/api/v1/seats', seatsRouter);
app.use('/api/v1/admin', adminRouter);

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
