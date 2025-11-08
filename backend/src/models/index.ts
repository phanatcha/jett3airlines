// Import all models
import { BaseModel } from './BaseModel';
import { ClientModel } from './Client';
import { FlightModel } from './Flight';
import { BookingModel } from './Booking';
import { PassengerModel } from './Passenger';
import { SeatModel } from './Seat';
import { PaymentModel } from './Payment';
import { AirportModel } from './Airport';
import { AirplaneModel } from './Airplane';
import { BaggageModel } from './Baggage';

// Export all models for easy importing
export { BaseModel };
export { ClientModel };
export { FlightModel };
export { BookingModel };
export { PassengerModel };
export { SeatModel };
export { PaymentModel };
export { AirportModel };
export { AirplaneModel };
export { BaggageModel };

// Create model instances for easy access
export const clientModel = new ClientModel();
export const flightModel = new FlightModel();
export const bookingModel = new BookingModel();
export const passengerModel = new PassengerModel();
export const seatModel = new SeatModel();
export const paymentModel = new PaymentModel();
export const airportModel = new AirportModel();
export const airplaneModel = new AirplaneModel();
export const baggageModel = new BaggageModel();