import { Request, Response } from 'express';
import { PassengerModel } from '../models/Passenger';
import { SeatModel } from '../models/Seat';
import { BookingModel } from '../models/Booking';
import { CreatePassenger, UpdatePassenger } from '../types/database';
import { AuthenticatedRequest } from '../middleware/auth';

const passengerModel = new PassengerModel();
const seatModel = new SeatModel();
const bookingModel = new BookingModel();

export class PassengersController {
  async getPassengerDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const clientId = req.user?.client_id;
      const passengerId = parseInt(req.params.passengerId);

      if (!clientId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      if (!passengerId || passengerId <= 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PASSENGER_ID',
            message: 'Valid passenger ID is required'
          }
        });
        return;
      }

      const passenger = await passengerModel.getPassengerDetails(passengerId);
      if (!passenger) {
        res.status(404).json({
          success: false,
          error: {
            code: 'PASSENGER_NOT_FOUND',
            message: 'Passenger not found'
          }
        });
        return;
      }

      const booking = await bookingModel.findBookingById((passenger as any).booking_id);
      if (!booking || booking.client_id !== clientId) {
        res.status(403).json({
          success: false,
          error: {
            code: 'ACCESS_DENIED',
            message: 'Access denied to this passenger'
          }
        });
        return;
      }

      const baggage = await passengerModel.getPassengerBaggage(passengerId);

      res.json({
        success: true,
        data: {
          passenger,
          baggage
        },
        message: 'Passenger details retrieved successfully'
      });

    } catch (error) {
      console.error('Error getting passenger details:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve passenger details'
        }
      });
    }
  }

  async updatePassenger(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const clientId = req.user?.client_id;
      const passengerId = parseInt(req.params.passengerId);

      if (!clientId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      if (!passengerId || passengerId <= 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PASSENGER_ID',
            message: 'Valid passenger ID is required'
          }
        });
        return;
      }

      const canModify = await passengerModel.canModifyPassenger(passengerId);
      if (!canModify) {
        res.status(403).json({
          success: false,
          error: {
            code: 'MODIFICATION_NOT_ALLOWED',
            message: 'Passenger cannot be modified at this time'
          }
        });
        return;
      }

      const currentPassenger = await passengerModel.findPassengerById(passengerId);
      if (!currentPassenger) {
        res.status(404).json({
          success: false,
          error: {
            code: 'PASSENGER_NOT_FOUND',
            message: 'Passenger not found'
          }
        });
        return;
      }

      const booking = await bookingModel.findBookingById(currentPassenger.booking_id);
      if (!booking || booking.client_id !== clientId) {
        res.status(403).json({
          success: false,
          error: {
            code: 'ACCESS_DENIED',
            message: 'Access denied to this passenger'
          }
        });
        return;
      }

      const updateData: UpdatePassenger = req.body;

      if (updateData.seat_id && updateData.seat_id !== currentPassenger.seat_id) {
        const seatAvailability = await seatModel.checkSeatsAvailability(
          currentPassenger.flight_id, 
          [updateData.seat_id]
        );
        
        if (seatAvailability.length === 0 || !seatAvailability[0].available) {
          res.status(409).json({
            success: false,
            error: {
              code: 'SEAT_NOT_AVAILABLE',
              message: 'Selected seat is not available'
            }
          });
          return;
        }
      }

      const success = await passengerModel.updatePassenger(passengerId, updateData);
      if (!success) {
        res.status(500).json({
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            message: 'Failed to update passenger'
          }
        });
        return;
      }

      const updatedPassenger = await passengerModel.getPassengerDetails(passengerId);

      res.json({
        success: true,
        data: updatedPassenger,
        message: 'Passenger updated successfully'
      });

    } catch (error) {
      console.error('Error updating passenger:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update passenger'
        }
      });
    }
  }

  async changeSeat(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const clientId = req.user?.client_id;
      const passengerId = parseInt(req.params.passengerId);
      const { seat_id } = req.body;

      if (!clientId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      if (!passengerId || passengerId <= 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PASSENGER_ID',
            message: 'Valid passenger ID is required'
          }
        });
        return;
      }

      if (!seat_id || seat_id <= 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_SEAT_ID',
            message: 'Valid seat ID is required'
          }
        });
        return;
      }

      const canModify = await passengerModel.canModifyPassenger(passengerId);
      if (!canModify) {
        res.status(403).json({
          success: false,
          error: {
            code: 'MODIFICATION_NOT_ALLOWED',
            message: 'Passenger seat cannot be changed at this time'
          }
        });
        return;
      }

      const currentPassenger = await passengerModel.findPassengerById(passengerId);
      if (!currentPassenger) {
        res.status(404).json({
          success: false,
          error: {
            code: 'PASSENGER_NOT_FOUND',
            message: 'Passenger not found'
          }
        });
        return;
      }

      const booking = await bookingModel.findBookingById(currentPassenger.booking_id);
      if (!booking || booking.client_id !== clientId) {
        res.status(403).json({
          success: false,
          error: {
            code: 'ACCESS_DENIED',
            message: 'Access denied to this passenger'
          }
        });
        return;
      }

      const seatAvailability = await seatModel.checkSeatsAvailability(
        currentPassenger.flight_id, 
        [seat_id]
      );
      
      if (seatAvailability.length === 0 || !seatAvailability[0].available) {
        res.status(409).json({
          success: false,
          error: {
            code: 'SEAT_NOT_AVAILABLE',
            message: 'Selected seat is not available'
          }
        });
        return;
      }

      const success = await passengerModel.changeSeat(passengerId, seat_id);
      if (!success) {
        res.status(500).json({
          success: false,
          error: {
            code: 'SEAT_CHANGE_FAILED',
            message: 'Failed to change seat'
          }
        });
        return;
      }

      const updatedPassenger = await passengerModel.getPassengerDetails(passengerId);

      res.json({
        success: true,
        data: updatedPassenger,
        message: 'Seat changed successfully'
      });

    } catch (error) {
      console.error('Error changing passenger seat:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to change seat'
        }
      });
    }
  }

  async addPassengerToBooking(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const clientId = req.user?.client_id;
      const bookingId = parseInt(req.params.bookingId);

      if (!clientId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      if (!bookingId || bookingId <= 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_BOOKING_ID',
            message: 'Valid booking ID is required'
          }
        });
        return;
      }

      const canModify = await bookingModel.canModifyBooking(bookingId, clientId);
      if (!canModify) {
        res.status(403).json({
          success: false,
          error: {
            code: 'MODIFICATION_NOT_ALLOWED',
            message: 'Cannot add passengers to this booking at this time'
          }
        });
        return;
      }

      const passengerData: CreatePassenger = req.body;

      const validationErrors = passengerModel.validatePassengerData({
        ...passengerData,
        booking_id: bookingId,
        flight_id: passengerData.flight_id
      });

      if (validationErrors.length > 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid passenger data',
            details: validationErrors
          }
        });
        return;
      }

      const booking = await bookingModel.findBookingById(bookingId);
      if (!booking) {
        res.status(404).json({
          success: false,
          error: {
            code: 'BOOKING_NOT_FOUND',
            message: 'Booking not found'
          }
        });
        return;
      }

      const seatAvailability = await seatModel.checkSeatsAvailability(
        booking.flight_id, 
        [passengerData.seat_id]
      );
      
      if (seatAvailability.length === 0 || !seatAvailability[0].available) {
        res.status(409).json({
          success: false,
          error: {
            code: 'SEAT_NOT_AVAILABLE',
            message: 'Selected seat is not available'
          }
        });
        return;
      }

      const completePassengerData: CreatePassenger = {
        ...passengerData,
        booking_id: bookingId,
        flight_id: booking.flight_id
      };

      const passengerId = await passengerModel.createPassenger(completePassengerData);

      const createdPassenger = await passengerModel.getPassengerDetails(passengerId);

      res.status(201).json({
        success: true,
        data: createdPassenger,
        message: 'Passenger added to booking successfully'
      });

    } catch (error) {
      console.error('Error adding passenger to booking:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to add passenger to booking'
        }
      });
    }
  }

  async removePassengerFromBooking(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const clientId = req.user?.client_id;
      const passengerId = parseInt(req.params.passengerId);

      if (!clientId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      if (!passengerId || passengerId <= 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PASSENGER_ID',
            message: 'Valid passenger ID is required'
          }
        });
        return;
      }

      const canModify = await passengerModel.canModifyPassenger(passengerId);
      if (!canModify) {
        res.status(403).json({
          success: false,
          error: {
            code: 'MODIFICATION_NOT_ALLOWED',
            message: 'Passenger cannot be removed at this time'
          }
        });
        return;
      }

      const currentPassenger = await passengerModel.findPassengerById(passengerId);
      if (!currentPassenger) {
        res.status(404).json({
          success: false,
          error: {
            code: 'PASSENGER_NOT_FOUND',
            message: 'Passenger not found'
          }
        });
        return;
      }

      const booking = await bookingModel.findBookingById(currentPassenger.booking_id);
      if (!booking || booking.client_id !== clientId) {
        res.status(403).json({
          success: false,
          error: {
            code: 'ACCESS_DENIED',
            message: 'Access denied to this passenger'
          }
        });
        return;
      }

      const bookingPassengers = await passengerModel.getPassengersByBooking(currentPassenger.booking_id);
      if (bookingPassengers.length <= 1) {
        res.status(400).json({
          success: false,
          error: {
            code: 'LAST_PASSENGER',
            message: 'Cannot remove the last passenger from a booking. Cancel the booking instead.'
          }
        });
        return;
      }

      const success = await passengerModel.deletePassenger(passengerId);
      if (!success) {
        res.status(500).json({
          success: false,
          error: {
            code: 'REMOVAL_FAILED',
            message: 'Failed to remove passenger'
          }
        });
        return;
      }

      res.json({
        success: true,
        message: 'Passenger removed from booking successfully'
      });

    } catch (error) {
      console.error('Error removing passenger from booking:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to remove passenger from booking'
        }
      });
    }
  }

  async getPassengersByBooking(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const clientId = req.user?.client_id;
      const bookingId = parseInt(req.params.bookingId);

      if (!clientId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      if (!bookingId || bookingId <= 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_BOOKING_ID',
            message: 'Valid booking ID is required'
          }
        });
        return;
      }

      const booking = await bookingModel.findBookingById(bookingId);
      if (!booking) {
        res.status(404).json({
          success: false,
          error: {
            code: 'BOOKING_NOT_FOUND',
            message: 'Booking not found'
          }
        });
        return;
      }

      if (booking.client_id !== clientId) {
        res.status(403).json({
          success: false,
          error: {
            code: 'ACCESS_DENIED',
            message: 'Access denied to this booking'
          }
        });
        return;
      }

      const passengers = await passengerModel.getPassengersByBooking(bookingId);

      res.json({
        success: true,
        data: passengers,
        message: 'Passengers retrieved successfully'
      });

    } catch (error) {
      console.error('Error getting passengers by booking:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve passengers'
        }
      });
    }
  }
}

export default new PassengersController();