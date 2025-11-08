import { Response } from 'express';
import { BookingModel } from '../models/Booking';
import { SeatModel } from '../models/Seat';
import { FlightModel } from '../models/Flight';
import { PassengerModel } from '../models/Passenger';
import { PaymentModel } from '../models/Payment';
import { BookingRequest, Booking, PaymentStatus } from '../types/database';
import { AuthenticatedRequest } from '../middleware/auth';

const bookingModel = new BookingModel();
const seatModel = new SeatModel();
const flightModel = new FlightModel();
const passengerModel = new PassengerModel();
const paymentModel = new PaymentModel();

export class BookingsController {
  // Create new booking with passenger validation and seat conflict prevention
  async createBooking(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const clientId = req.user?.client_id;
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

      const bookingData: BookingRequest = req.body;

      // Validate booking data
      const validationErrors = bookingModel.validateBookingData(bookingData);
      if (validationErrors.length > 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid booking data',
            details: validationErrors
          }
        });
        return;
      }

      // Validate flight exists and is available
      const flight = await flightModel.findFlightById(bookingData.flight_id);
      if (!flight) {
        res.status(404).json({
          success: false,
          error: {
            code: 'FLIGHT_NOT_FOUND',
            message: 'Flight not found'
          }
        });
        return;
      }

      // Check if flight is still accepting bookings
      if (flight.status !== 'Scheduled') {
        res.status(400).json({
          success: false,
          error: {
            code: 'FLIGHT_NOT_AVAILABLE',
            message: 'Flight is not available for booking'
          }
        });
        return;
      }

      // Check if flight departure is in the future
      const departureTime = new Date(flight.depart_when);
      const now = new Date();
      if (departureTime <= now) {
        res.status(400).json({
          success: false,
          error: {
            code: 'FLIGHT_DEPARTED',
            message: 'Cannot book flights that have already departed'
          }
        });
        return;
      }

      // Validate passengers and check seat availability
      const seatIds = bookingData.passengers.map(p => p.seat_id);
      const seatAvailability = await seatModel.checkSeatsAvailability(bookingData.flight_id, seatIds);
      
      const unavailableSeats = seatAvailability.filter(seat => !seat.available);
      if (unavailableSeats.length > 0) {
        res.status(409).json({
          success: false,
          error: {
            code: 'SEAT_CONFLICT',
            message: 'One or more selected seats are already booked',
            details: {
              unavailableSeats: unavailableSeats.map(s => s.seatId)
            }
          }
        });
        return;
      }

      // Validate each passenger
      for (let i = 0; i < bookingData.passengers.length; i++) {
        const passenger = bookingData.passengers[i];
        const passengerErrors = passengerModel.validatePassengerData({
          ...passenger,
          booking_id: 0, // Will be set after booking creation
          flight_id: bookingData.flight_id
        });

        if (passengerErrors.length > 0) {
          res.status(400).json({
            success: false,
            error: {
              code: 'PASSENGER_VALIDATION_ERROR',
              message: `Validation errors for passenger ${i + 1}`,
              details: passengerErrors
            }
          });
          return;
        }
      }

      // Calculate total booking cost
      const totalCost = await this.calculateBookingCost(seatIds);

      // Create booking with passengers
      const bookingId = await bookingModel.createBookingWithPassengers(bookingData, clientId);

      // Get created booking details
      const bookingDetails = await bookingModel.getBookingDetails(bookingId);
      const passengers = await bookingModel.getBookingPassengers(bookingId);

      res.status(201).json({
        success: true,
        data: {
          booking: bookingDetails,
          passengers: passengers,
          totalCost: totalCost
        },
        message: 'Booking created successfully'
      });

    } catch (error) {
      console.error('Error creating booking:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create booking'
        }
      });
    }
  }

  // Get booking history for authenticated client
  async getBookingHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const clientId = req.user?.client_id;
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

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const bookings = await bookingModel.getBookingsByClient(clientId, limit, offset);

      // Get total count for pagination
      const totalBookings = await bookingModel.findAll<Booking>({ client_id: clientId });
      const total = totalBookings.length;

      res.json({
        success: true,
        data: bookings,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        message: 'Booking history retrieved successfully'
      });

    } catch (error) {
      console.error('Error getting booking history:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve booking history'
        }
      });
    }
  }

  // Get specific booking details
  async getBookingDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const booking = await bookingModel.getBookingDetails(bookingId);
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

      // Check if booking belongs to the authenticated client
      if ((booking as any).client_id !== clientId) {
        res.status(403).json({
          success: false,
          error: {
            code: 'ACCESS_DENIED',
            message: 'Access denied to this booking'
          }
        });
        return;
      }

      const passengers = await bookingModel.getBookingPassengers(bookingId);
      const paymentStatus = await bookingModel.getBookingPaymentStatus(bookingId);
      const totalCost = await bookingModel.calculateBookingCost(bookingId);

      res.json({
        success: true,
        data: {
          booking,
          passengers,
          paymentStatus,
          totalCost
        },
        message: 'Booking details retrieved successfully'
      });

    } catch (error) {
      console.error('Error getting booking details:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve booking details'
        }
      });
    }
  }

  // Update booking (modify passengers, seats, etc.)
  async updateBooking(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      // Check if client can modify this booking
      const canModify = await bookingModel.canModifyBooking(bookingId, clientId);
      if (!canModify) {
        res.status(403).json({
          success: false,
          error: {
            code: 'MODIFICATION_NOT_ALLOWED',
            message: 'Booking cannot be modified at this time'
          }
        });
        return;
      }

      const updateData = req.body;

      // If passengers are being updated, validate seat availability
      if (updateData.passengers) {
        const seatIds = updateData.passengers.map((p: any) => p.seat_id);
        const booking = await bookingModel.findBookingById(bookingId);
        
        if (booking) {
          const seatAvailability = await seatModel.checkSeatsAvailability(booking.flight_id, seatIds);
          const unavailableSeats = seatAvailability.filter(seat => !seat.available);
          
          if (unavailableSeats.length > 0) {
            res.status(409).json({
              success: false,
              error: {
                code: 'SEAT_CONFLICT',
                message: 'One or more selected seats are already booked',
                details: {
                  unavailableSeats: unavailableSeats.map(s => s.seatId)
                }
              }
            });
            return;
          }
        }
      }

      // Update booking support and fasttrack options
      if (updateData.support !== undefined || updateData.fasttrack !== undefined) {
        const bookingUpdateData: any = {};
        if (updateData.support !== undefined) bookingUpdateData.support = updateData.support;
        if (updateData.fasttrack !== undefined) bookingUpdateData.fasttrack = updateData.fasttrack;
        
        await bookingModel.update(bookingId, bookingUpdateData, 'booking_id');
      }

      // Get updated booking details
      const updatedBooking = await bookingModel.getBookingDetails(bookingId);
      const passengers = await bookingModel.getBookingPassengers(bookingId);
      const totalCost = await bookingModel.calculateBookingCost(bookingId);

      res.json({
        success: true,
        data: {
          booking: updatedBooking,
          passengers,
          totalCost
        },
        message: 'Booking updated successfully'
      });

    } catch (error) {
      console.error('Error updating booking:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update booking'
        }
      });
    }
  }

  // Cancel booking with automatic refund processing
  async cancelBooking(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      // Get booking details
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

      // Check if booking belongs to client
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

      // Check if booking is already cancelled
      if (booking.status === 'cancelled') {
        res.status(400).json({
          success: false,
          error: {
            code: 'ALREADY_CANCELLED',
            message: 'Booking is already cancelled'
          }
        });
        return;
      }

      // Check if client can modify this booking
      const canModify = await bookingModel.canModifyBooking(bookingId, clientId);
      if (!canModify) {
        res.status(403).json({
          success: false,
          error: {
            code: 'CANCELLATION_NOT_ALLOWED',
            message: 'Booking cannot be cancelled at this time (must be at least 24 hours before departure)'
          }
        });
        return;
      }

      // Check if payment exists and needs refund
      const payment = await paymentModel.findPaymentByBookingId(bookingId);
      let refundInfo = null;

      if (payment && payment.status === PaymentStatus.COMPLETED) {
        // Process refund automatically
        try {
          const refundId = await paymentModel.processRefund(bookingId);
          const refundReceipt = await paymentModel.getPaymentReceipt(refundId);
          refundInfo = {
            refund_id: refundId,
            refund_amount: Math.abs((refundReceipt as any).amount),
            refund_status: 'refunded',
            refund_receipt: refundReceipt
          };
        } catch (refundError) {
          console.error('Error processing refund:', refundError);
          // Continue with cancellation even if refund fails
          // The refund can be processed manually later
        }
      } else {
        // No payment or payment not completed, just cancel the booking
        await bookingModel.cancelBooking(bookingId);
      }

      res.json({
        success: true,
        data: {
          booking_id: bookingId,
          status: 'cancelled',
          refund: refundInfo
        },
        message: refundInfo 
          ? 'Booking cancelled and refund processed successfully' 
          : 'Booking cancelled successfully'
      });

    } catch (error) {
      console.error('Error cancelling booking:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to cancel booking'
        }
      });
    }
  }

  // Update booking status (admin only)
  async updateBookingStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const bookingId = parseInt(req.params.id);
      const { status } = req.body;

      if (!status) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Status is required'
          }
        });
        return;
      }

      // Validate status value
      const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: `Status must be one of: ${validStatuses.join(', ')}`
          }
        });
        return;
      }

      // Check if booking exists
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

      // Update booking status
      const updateSuccess = await bookingModel.updateBookingStatus(bookingId, status);

      if (!updateSuccess) {
        res.status(500).json({
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            message: 'Failed to update booking status'
          }
        });
        return;
      }

      // Get updated booking
      const updatedBooking = await bookingModel.getBookingDetails(bookingId);

      res.status(200).json({
        success: true,
        message: 'Booking status updated successfully',
        data: {
          booking: updatedBooking
        }
      });
    } catch (error) {
      console.error('Update booking status error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error while updating booking status'
        }
      });
    }
  }

  // Helper method to calculate booking cost
  private async calculateBookingCost(seatIds: number[]): Promise<number> {
    try {
      if (seatIds.length === 0) return 0;

      let totalCost = 0;
      for (const seatId of seatIds) {
        const seat = await seatModel.findSeatById(seatId);
        if (seat) {
          totalCost += seat.price;
        }
      }
      return totalCost;
    } catch (error) {
      console.error('Error calculating booking cost:', error);
      throw error;
    }
  }
}

export default new BookingsController();