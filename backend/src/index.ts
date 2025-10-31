import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from "mysql2";
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

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
    return;
  }
  console.log("Connected to Jett3airline database");
});

app.use('/api/v1/flights', flightsRouter);
app.use('/api/v1/bookings', bookingsRouter);
app.use('/api/v1/passengers', passengersRouter);
app.use('/api/v1/payments', paymentsRouter);
app.use('/api/v1/home', seatsRouter);
app.use('/api/v1/admin', adminRouter);

app.get("/", (req, res) => {
  res.send("Server connected to MySQL on port 8889!");
});


app.listen(port, () => console.log(`Server running on http://localhost:${port}`));