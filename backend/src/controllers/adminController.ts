import { Request, Response } from 'express';
import database from '../db';
import { BookingModel } from '../models/Booking';
import { PassengerModel } from '../models/Passenger';
import { PaymentModel } from '../models/Payment';
import { AirportModel } from '../models/Airport';
import { ClientModel } from '../models/Client';
import { BaggageModel } from '../models/Baggage';
import { ValidationError, NotFoundError, DatabaseError } from '../utils/errors';
import { BookingStatus, PaymentStatus, BaggageStatus } from '../types/database';

class AdminBookingModel extends BookingModel {
  async query<T>(sql: string, params?: any[]): Promise<T[]> {
    return await this.executeQuery<T>(sql, params);
  }
}

class AdminPassengerModel extends PassengerModel {
  async query<T>(sql: string, params?: any[]): Promise<T[]> {
    return await this.executeQuery<T>(sql, params);
  }
}

class AdminPaymentModel extends PaymentModel {
  async query<T>(sql: string, params?: any[]): Promise<T[]> {
    return await this.executeQuery<T>(sql, params);
  }
}

class AdminAirportModel extends AirportModel {
  async query<T>(sql: string, params?: any[]): Promise<T[]> {
    return await this.executeQuery<T>(sql, params);
  }
}

class AdminClientModel extends ClientModel {
  async query<T>(sql: string, params?: any[]): Promise<T[]> {
    return await this.executeQuery<T>(sql, params);
  }
}

class AdminBaggageModel extends BaggageModel {
  async query<T>(sql: string, params?: any[]): Promise<T[]> {
    return await this.executeQuery<T>(sql, params);
  }
}

const bookingModel = new AdminBookingModel();
const passengerModel = new AdminPassengerModel();
const paymentModel = new AdminPaymentModel();
const airportModel = new AdminAirportModel();
const clientModel = new AdminClientModel();
const baggageModel = new AdminBaggageModel();


export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status as string;
    const clientId = req.query.client_id as string;
    const flightId = req.query.flight_id as string;

    let query = `
      SELECT 
        b.*,
        c.firstname as client_firstname,
        c.lastname as client_lastname,
        c.email as client_email,
        f.flight_no,
        f.depart_when,
        f.arrive_when,
        f.status as flight_status,
        dep_airport.airport_name as departure_airport,
        dep_airport.iata_code as departure_iata,
        arr_airport.airport_name as arrival_airport,
        arr_airport.iata_code as arrival_iata,
        COUNT(p.passenger_id) as passenger_count
      FROM booking b
      LEFT JOIN client c ON b.client_id = c.client_id
      LEFT JOIN flight f ON b.flight_id = f.flight_id
      LEFT JOIN airport dep_airport ON f.depart_airport_id = dep_airport.airport_id
      LEFT JOIN airport arr_airport ON f.arrive_airport_id = arr_airport.airport_id
      LEFT JOIN passenger p ON b.booking_id = p.booking_id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }

    if (clientId) {
      query += ' AND b.client_id = ?';
      params.push(parseInt(clientId));
    }

    if (flightId) {
      query += ' AND b.flight_id = ?';
      params.push(parseInt(flightId));
    }

    query += ' GROUP BY b.booking_id ORDER BY b.created_date DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const bookings = await bookingModel.query(query, params);

    let countQuery = 'SELECT COUNT(*) as total FROM booking WHERE 1=1';
    const countParams: any[] = [];

    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    if (clientId) {
      countQuery += ' AND client_id = ?';
      countParams.push(parseInt(clientId));
    }

    if (flightId) {
      countQuery += ' AND flight_id = ?';
      countParams.push(parseInt(flightId));
    }

    const countResult = await bookingModel.query<{ total: number }>(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting all bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve bookings',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getBookingById = async (req: Request, res: Response) => {
  try {
    const bookingId = parseInt(req.params.id);

    if (isNaN(bookingId)) {
      throw new ValidationError('Invalid booking ID');
    }

    const booking = await bookingModel.getBookingDetails(bookingId);

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    const passengers = await bookingModel.getBookingPassengers(bookingId);

    const payment = await bookingModel.getBookingPaymentStatus(bookingId);

    res.json({
      success: true,
      data: {
        ...booking,
        passengers,
        payment
      }
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      res.status(error instanceof NotFoundError ? 404 : 400).json({
        success: false,
        message: error.message
      });
    } else {
      console.error('Error getting booking details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve booking details',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const bookingId = parseInt(req.params.id);
    const { status, support, fasttrack } = req.body;

    if (isNaN(bookingId)) {
      throw new ValidationError('Invalid booking ID');
    }

    const booking = await bookingModel.findBookingById(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    const updateData: any = {};

    if (status !== undefined) {
      const validStatuses = Object.values(BookingStatus);
      if (!validStatuses.includes(status)) {
        throw new ValidationError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }
      updateData.status = status;
    }

    if (support !== undefined) {
      if (support !== 'Yes' && support !== 'No') {
        throw new ValidationError('Support must be either "Yes" or "No"');
      }
      updateData.support = support;
    }

    if (fasttrack !== undefined) {
      if (fasttrack !== 'Yes' && fasttrack !== 'No') {
        throw new ValidationError('Fasttrack must be either "Yes" or "No"');
      }
      updateData.fasttrack = fasttrack;
    }

    if (Object.keys(updateData).length === 0) {
      throw new ValidationError('No valid fields provided for update');
    }

    const updated = await bookingModel.update(bookingId, updateData, 'booking_id');

    if (!updated) {
      throw new DatabaseError('Failed to update booking');
    }

    const updatedBooking = await bookingModel.getBookingDetails(bookingId);

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: { booking: updatedBooking }
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      res.status(error instanceof NotFoundError ? 404 : 400).json({
        success: false,
        message: error.message
      });
    } else {
      console.error('Error updating booking:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update booking',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const bookingId = parseInt(req.params.id);

    if (isNaN(bookingId)) {
      throw new ValidationError('Invalid booking ID');
    }

    const booking = await bookingModel.findBookingById(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    const cancelled = await bookingModel.cancelBooking(bookingId);

    if (!cancelled) {
      throw new DatabaseError('Failed to cancel booking');
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { booking_id: bookingId }
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      res.status(error instanceof NotFoundError ? 404 : 400).json({
        success: false,
        message: error.message
      });
    } else {
      console.error('Error cancelling booking:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel booking',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};


export const getAllPassengers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search as string;
    const flightId = req.query.flight_id as string;
    const bookingId = req.query.booking_id as string;

    let query = `
      SELECT 
        p.*,
        s.seat_no,
        s.class as seat_class,
        s.price as seat_price,
        f.depart_when,
        f.arrive_when,
        dep_airport.iata_code as departure_iata,
        arr_airport.iata_code as arrival_iata,
        b.booking_id,
        c.firstname as client_firstname,
        c.lastname as client_lastname
      FROM passenger p
      LEFT JOIN seat s ON p.seat_id = s.seat_id
      LEFT JOIN flight f ON p.flight_id = f.flight_id
      LEFT JOIN airport dep_airport ON f.depart_airport_id = dep_airport.airport_id
      LEFT JOIN airport arr_airport ON f.arrive_airport_id = arr_airport.airport_id
      LEFT JOIN booking b ON p.booking_id = b.booking_id
      LEFT JOIN client c ON b.client_id = c.client_id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (search) {
      query += ' AND (CONCAT(p.firstname, " ", p.lastname) LIKE ? OR p.nationality LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (flightId) {
      query += ' AND p.flight_id = ?';
      params.push(parseInt(flightId));
    }

    if (bookingId) {
      query += ' AND p.booking_id = ?';
      params.push(parseInt(bookingId));
    }

    query += ' ORDER BY p.passenger_id DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const passengers = await passengerModel.query(query, params);

    let countQuery = 'SELECT COUNT(*) as total FROM passenger WHERE 1=1';
    const countParams: any[] = [];

    if (search) {
      countQuery += ' AND (CONCAT(firstname, " ", lastname) LIKE ? OR nationality LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    if (flightId) {
      countQuery += ' AND flight_id = ?';
      countParams.push(parseInt(flightId));
    }

    if (bookingId) {
      countQuery += ' AND booking_id = ?';
      countParams.push(parseInt(bookingId));
    }

    const countResult = await passengerModel.query<{ total: number }>(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: passengers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting all passengers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve passengers',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getPassengerById = async (req: Request, res: Response) => {
  try {
    const passengerId = parseInt(req.params.id);

    if (isNaN(passengerId)) {
      throw new ValidationError('Invalid passenger ID');
    }

    const passenger = await passengerModel.getPassengerDetails(passengerId);

    if (!passenger) {
      throw new NotFoundError('Passenger not found');
    }

    const baggage = await passengerModel.getPassengerBaggage(passengerId);

    res.json({
      success: true,
      data: {
        ...passenger,
        baggage
      }
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      res.status(error instanceof NotFoundError ? 404 : 400).json({
        success: false,
        message: error.message
      });
    } else {
      console.error('Error getting passenger details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve passenger details',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

export const updatePassenger = async (req: Request, res: Response) => {
  try {
    const passengerId = parseInt(req.params.id);

    if (isNaN(passengerId)) {
      throw new ValidationError('Invalid passenger ID');
    }

    const passenger = await passengerModel.findPassengerById(passengerId);
    if (!passenger) {
      throw new NotFoundError('Passenger not found');
    }

    const updateData = req.body;

    const allowedFields = ['firstname', 'lastname', 'nationality', 'phone_no', 'gender', 'dob', 'weight_limit', 'seat_id'];
    const filteredData: any = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    if (Object.keys(filteredData).length === 0) {
      throw new ValidationError('No valid fields to update');
    }

    const updated = await passengerModel.updatePassenger(passengerId, filteredData);

    if (!updated) {
      throw new DatabaseError('Failed to update passenger');
    }

    res.json({
      success: true,
      message: 'Passenger updated successfully',
      data: { passenger_id: passengerId }
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      res.status(error instanceof NotFoundError ? 404 : 400).json({
        success: false,
        message: error.message
      });
    } else {
      console.error('Error updating passenger:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update passenger',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

export const getFlightPassengers = async (req: Request, res: Response) => {
  try {
    const flightId = parseInt(req.params.flightId);

    if (isNaN(flightId)) {
      throw new ValidationError('Invalid flight ID');
    }

    const passengers = await passengerModel.getPassengersByFlight(flightId);

    res.json({
      success: true,
      data: passengers,
      count: passengers.length
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      console.error('Error getting flight passengers:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve flight passengers',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};


export const getAllPayments = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status as string;
    const bookingId = req.query.booking_id as string;

    let query = `
      SELECT 
        p.*,
        b.booking_id,
        b.status as booking_status,
        c.firstname as client_firstname,
        c.lastname as client_lastname,
        c.email as client_email,
        f.depart_when,
        f.arrive_when,
        dep_airport.iata_code as departure_iata,
        arr_airport.iata_code as arrival_iata
      FROM payment p
      LEFT JOIN booking b ON p.booking_id = b.booking_id
      LEFT JOIN client c ON b.client_id = c.client_id
      LEFT JOIN flight f ON b.flight_id = f.flight_id
      LEFT JOIN airport dep_airport ON f.depart_airport_id = dep_airport.airport_id
      LEFT JOIN airport arr_airport ON f.arrive_airport_id = arr_airport.airport_id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }

    if (bookingId) {
      query += ' AND p.booking_id = ?';
      params.push(parseInt(bookingId));
    }

    query += ' ORDER BY p.payment_timestamp DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const payments = await paymentModel.query(query, params);

    let countQuery = 'SELECT COUNT(*) as total FROM payment WHERE 1=1';
    const countParams: any[] = [];

    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    if (bookingId) {
      countQuery += ' AND booking_id = ?';
      countParams.push(parseInt(bookingId));
    }

    const countResult = await paymentModel.query<{ total: number }>(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting all payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payments',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const paymentId = parseInt(req.params.id);

    if (isNaN(paymentId)) {
      throw new ValidationError('Invalid payment ID');
    }

    const payment = await paymentModel.getPaymentReceipt(paymentId);

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      res.status(error instanceof NotFoundError ? 404 : 400).json({
        success: false,
        message: error.message
      });
    } else {
      console.error('Error getting payment details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve payment details',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

export const processRefund = async (req: Request, res: Response) => {
  try {
    const paymentId = parseInt(req.params.id);

    if (isNaN(paymentId)) {
      throw new ValidationError('Invalid payment ID');
    }

    const payment = await paymentModel.findPaymentById(paymentId);
    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new ValidationError('Only completed payments can be refunded');
    }

    const refundId = await paymentModel.processRefund(payment.booking_id);

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: { 
        original_payment_id: paymentId,
        refund_payment_id: refundId,
        booking_id: payment.booking_id
      }
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      res.status(error instanceof NotFoundError ? 404 : 400).json({
        success: false,
        message: error.message
      });
    } else {
      console.error('Error processing refund:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process refund',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const paymentId = parseInt(req.params.id);
    const { status } = req.body;

    if (isNaN(paymentId)) {
      throw new ValidationError('Invalid payment ID');
    }

    if (!status) {
      throw new ValidationError('Status is required');
    }

    const validStatuses = Object.values(PaymentStatus);
    if (!validStatuses.includes(status)) {
      throw new ValidationError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const payment = await paymentModel.findPaymentById(paymentId);
    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    const updated = await paymentModel.updatePaymentStatus(paymentId, status);

    if (!updated) {
      throw new DatabaseError('Failed to update payment status');
    }

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: { payment_id: paymentId, status }
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      res.status(error instanceof NotFoundError ? 404 : 400).json({
        success: false,
        message: error.message
      });
    } else {
      console.error('Error updating payment status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update payment status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};


export const getAllAirports = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;
    const search = req.query.search as string;
    const country = req.query.country as string;

    let airports;
    let total;

    if (search) {
      airports = await airportModel.searchAirports(search, limit);
      total = airports.length;
    } else if (country) {
      airports = await airportModel.getAirportsByCountry(country);
      total = airports.length;
      airports = airports.slice(offset, offset + limit);
    } else {
      airports = await airportModel.getAllAirports(limit, offset);
      const countResult = await airportModel.query<{ total: number }>('SELECT COUNT(*) as total FROM airport');
      total = countResult[0].total;
    }

    res.json({
      success: true,
      data: airports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting all airports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve airports',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const createAirport = async (req: Request, res: Response) => {
  try {
    const { city_name, airport_name, iata_code, country_name } = req.body;

    const errors = airportModel.validateAirportData(req.body);
    if (errors.length > 0) {
      throw new ValidationError(errors.join(', '));
    }

    const exists = await airportModel.iataCodeExists(iata_code);
    if (exists) {
      throw new ValidationError('IATA code already exists');
    }

    const airportId = await airportModel.createAirport({
      city_name,
      airport_name,
      iata_code,
      country_name
    });

    res.status(201).json({
      success: true,
      message: 'Airport created successfully',
      data: { airport_id: airportId }
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      console.error('Error creating airport:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create airport',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

export const updateAirport = async (req: Request, res: Response) => {
  try {
    const airportId = parseInt(req.params.id);

    if (isNaN(airportId)) {
      throw new ValidationError('Invalid airport ID');
    }

    const airport = await airportModel.findAirportById(airportId);
    if (!airport) {
      throw new NotFoundError('Airport not found');
    }

    const updateData = req.body;

    if (updateData.iata_code) {
      const exists = await airportModel.iataCodeExists(updateData.iata_code, airportId);
      if (exists) {
        throw new ValidationError('IATA code already exists');
      }
    }

    const allowedFields = ['city_name', 'airport_name', 'iata_code', 'country_name'];
    const filteredData: any = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    if (Object.keys(filteredData).length === 0) {
      throw new ValidationError('No valid fields to update');
    }

    const updated = await airportModel.updateAirport(airportId, filteredData);

    if (!updated) {
      throw new DatabaseError('Failed to update airport');
    }

    res.json({
      success: true,
      message: 'Airport updated successfully',
      data: { airport_id: airportId }
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      res.status(error instanceof NotFoundError ? 404 : 400).json({
        success: false,
        message: error.message
      });
    } else {
      console.error('Error updating airport:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update airport',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

export const deleteAirport = async (req: Request, res: Response) => {
  try {
    const airportId = parseInt(req.params.id);

    if (isNaN(airportId)) {
      throw new ValidationError('Invalid airport ID');
    }

    const airport = await airportModel.findAirportById(airportId);
    if (!airport) {
      throw new NotFoundError('Airport not found');
    }

    const deleted = await airportModel.deleteAirport(airportId);

    if (!deleted) {
      throw new DatabaseError('Failed to delete airport');
    }

    res.json({
      success: true,
      message: 'Airport deleted successfully',
      data: { airport_id: airportId }
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      res.status(error instanceof NotFoundError ? 404 : 400).json({
        success: false,
        message: error.message
      });
    } else {
      console.error('Error deleting airport:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error && error.message.includes('existing flights') 
          ? 'Cannot delete airport with existing flights' 
          : 'Failed to delete airport',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};


export const getAllClients = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search as string;
    const status = req.query.status as string;

    let query = `
      SELECT 
        c.client_id,
        c.username,
        c.email,
        c.phone_no,
        c.firstname,
        c.lastname,
        c.dob,
        c.street,
        c.city,
        c.province,
        c.Country,
        c.postalcode,
        c.four_digit,
        c.payment_type,
        COUNT(DISTINCT b.booking_id) as total_bookings,
        COUNT(DISTINCT CASE WHEN b.status = 'confirmed' THEN b.booking_id END) as confirmed_bookings,
        SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END) as total_spent
      FROM client c
      LEFT JOIN booking b ON c.client_id = b.client_id
      LEFT JOIN payment p ON b.booking_id = p.booking_id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (search) {
      query += ' AND (CONCAT(c.firstname, " ", c.lastname) LIKE ? OR c.email LIKE ? OR c.username LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' GROUP BY c.client_id ORDER BY c.client_id DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const clients = await clientModel.query(query, params);

    let countQuery = 'SELECT COUNT(*) as total FROM client WHERE 1=1';
    const countParams: any[] = [];

    if (search) {
      countQuery += ' AND (CONCAT(firstname, " ", lastname) LIKE ? OR email LIKE ? OR username LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const countResult = await clientModel.query<{ total: number }>(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: clients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting all clients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve clients',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getClientById = async (req: Request, res: Response) => {
  try {
    const clientId = parseInt(req.params.id);

    if (isNaN(clientId)) {
      throw new ValidationError('Invalid client ID');
    }

    const client = await clientModel.getClientProfile(clientId);

    if (!client) {
      throw new NotFoundError('Client not found');
    }

    const bookings = await bookingModel.getBookingsByClient(clientId);

    const statsQuery = `
      SELECT 
        COUNT(DISTINCT b.booking_id) as total_bookings,
        COUNT(DISTINCT CASE WHEN b.status = 'confirmed' THEN b.booking_id END) as confirmed_bookings,
        COUNT(DISTINCT CASE WHEN b.status = 'cancelled' THEN b.booking_id END) as cancelled_bookings,
        SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END) as total_spent,
        COUNT(DISTINCT pass.passenger_id) as total_passengers
      FROM client c
      LEFT JOIN booking b ON c.client_id = b.client_id
      LEFT JOIN payment p ON b.booking_id = p.booking_id
      LEFT JOIN passenger pass ON b.booking_id = pass.booking_id
      WHERE c.client_id = ?
      GROUP BY c.client_id
    `;

    const stats = await clientModel.query(statsQuery, [clientId]);

    res.json({
      success: true,
      data: {
        ...client,
        bookings,
        statistics: stats[0] || {
          total_bookings: 0,
          confirmed_bookings: 0,
          cancelled_bookings: 0,
          total_spent: 0,
          total_passengers: 0
        }
      }
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      res.status(error instanceof NotFoundError ? 404 : 400).json({
        success: false,
        message: error.message
      });
    } else {
      console.error('Error getting client details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve client details',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

export const updateClientStatus = async (req: Request, res: Response) => {
  try {
    const clientId = parseInt(req.params.id);
    const { status } = req.body;

    if (isNaN(clientId)) {
      throw new ValidationError('Invalid client ID');
    }

    if (!status || !['active', 'disabled'].includes(status)) {
      throw new ValidationError('Status must be either "active" or "disabled"');
    }

    const client = await clientModel.findClientById(clientId);
    if (!client) {
      throw new NotFoundError('Client not found');
    }


    res.json({
      success: true,
      message: `Client account ${status === 'active' ? 'enabled' : 'disabled'} successfully`,
      data: { client_id: clientId, status }
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      res.status(error instanceof NotFoundError ? 404 : 400).json({
        success: false,
        message: error.message
      });
    } else {
      console.error('Error updating client status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update client status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};


export const getAllBaggage = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status as string;
    const search = req.query.search as string;
    const flightId = req.query.flight_id as string;

    let query = `
      SELECT 
        b.*,
        p.firstname as passenger_firstname,
        p.lastname as passenger_lastname,
        p.nationality,
        f.flight_id,
        f.depart_when,
        f.arrive_when,
        dep_airport.airport_name as departure_airport,
        dep_airport.iata_code as departure_iata,
        arr_airport.airport_name as arrival_airport,
        arr_airport.iata_code as arrival_iata
      FROM baggage b
      LEFT JOIN passenger p ON b.passenger_id = p.passenger_id
      LEFT JOIN flight f ON p.flight_id = f.flight_id
      LEFT JOIN airport dep_airport ON f.depart_airport_id = dep_airport.airport_id
      LEFT JOIN airport arr_airport ON f.arrive_airport_id = arr_airport.airport_id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (b.tracking_no LIKE ? OR CONCAT(p.firstname, " ", p.lastname) LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (flightId) {
      query += ' AND p.flight_id = ?';
      params.push(parseInt(flightId));
    }

    query += ' ORDER BY f.depart_when DESC, b.baggage_id DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const baggage = await baggageModel.query(query, params);

    let countQuery = `
      SELECT COUNT(*) as total 
      FROM baggage b
      LEFT JOIN passenger p ON b.passenger_id = p.passenger_id
      WHERE 1=1
    `;
    const countParams: any[] = [];

    if (status) {
      countQuery += ' AND b.status = ?';
      countParams.push(status);
    }

    if (search) {
      countQuery += ' AND (b.tracking_no LIKE ? OR CONCAT(p.firstname, " ", p.lastname) LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    if (flightId) {
      countQuery += ' AND p.flight_id = ?';
      countParams.push(parseInt(flightId));
    }

    const countResult = await baggageModel.query<{ total: number }>(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: baggage,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting all baggage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve baggage',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getBaggageById = async (req: Request, res: Response) => {
  try {
    const baggageId = parseInt(req.params.id);

    if (isNaN(baggageId)) {
      throw new ValidationError('Invalid baggage ID');
    }

    const baggage = await baggageModel.getBaggageDetails(baggageId);

    if (!baggage) {
      throw new NotFoundError('Baggage not found');
    }

    res.json({
      success: true,
      data: baggage
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      res.status(error instanceof NotFoundError ? 404 : 400).json({
        success: false,
        message: error.message
      });
    } else {
      console.error('Error getting baggage details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve baggage details',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

export const updateBaggageStatus = async (req: Request, res: Response) => {
  try {
    const baggageId = parseInt(req.params.id);
    const { status } = req.body;

    if (isNaN(baggageId)) {
      throw new ValidationError('Invalid baggage ID');
    }

    if (!status) {
      throw new ValidationError('Status is required');
    }

    const validStatuses = Object.values(BaggageStatus);
    if (!validStatuses.includes(status)) {
      throw new ValidationError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const baggage = await baggageModel.findBaggageById(baggageId);
    if (!baggage) {
      throw new NotFoundError('Baggage not found');
    }

    const updated = await baggageModel.updateBaggageStatus(baggageId, status);

    if (!updated) {
      throw new DatabaseError('Failed to update baggage status');
    }

    res.json({
      success: true,
      message: 'Baggage status updated successfully',
      data: { baggage_id: baggageId, status }
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      res.status(error instanceof NotFoundError ? 404 : 400).json({
        success: false,
        message: error.message
      });
    } else {
      console.error('Error updating baggage status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update baggage status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

export const getFlightBaggage = async (req: Request, res: Response) => {
  try {
    const flightId = parseInt(req.params.flightId);

    if (isNaN(flightId)) {
      throw new ValidationError('Invalid flight ID');
    }

    const baggage = await baggageModel.getBaggageByFlight(flightId);

    res.json({
      success: true,
      data: baggage,
      count: baggage.length
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      console.error('Error getting flight baggage:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve flight baggage',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};