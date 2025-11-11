// Database entity interfaces based on the MySQL schema

// Type declaration for Buffer (fallback if @types/node is not available)
type BufferLike = any;

export interface Client {
  client_id: number;
  username: string;
  password: string | BufferLike; // varchar(255) in database, stored as argon2 hash
  email: string;
  phone_no: string;
  firstname: string;
  lastname: string;
  dob: Date;
  street: string;
  city: string;
  province: string;
  Country: string; // Note: Capital C in database
  postalcode: string;
  card_no: BufferLike; // varbinary in database
  four_digit: string;
  payment_type: string;
  role?: string; // 'user' or 'admin', defaults to 'user'
}

export interface Flight {
  flight_id: number;
  depart_when: Date;
  arrive_when: Date;
  status: string;
  airplane_id: number;
  depart_airport_id: number;
  arrive_airport_id: number;
  flight_no?: string; // Flight number (e.g., "JT301")
}

export interface Booking {
  booking_id: number;
  support: string;
  fasttrack: string;
  status: string;
  created_date: Date;
  updated_date?: Date;
  client_id: number;
  flight_id: number;
  booking_no?: string; // Booking reference number
}

export interface Passenger {
  passenger_id: number;
  firstname: string;
  lastname: string;
  passport_no: BufferLike; // varbinary in database
  nationality: string;
  phone_no: string;
  gender: string;
  dob: Date;
  weight_limit: number;
  seat_id: number;
  booking_id: number;
  flight_id: number;
}

export interface Seat {
  seat_id: number;
  seat_no: string;
  class: string;
  price: number;
  airplane_id: number;
}

export interface Payment {
  payment_id: number;
  amount: number;
  currency: string;
  payment_timestamp: Date;
  status: string;
  booking_id: number;
}

export interface Airport {
  airport_id: number;
  city_name: string;
  airport_name: string;
  iata_code: string;
  country_name: string;
}

export interface Airplane {
  airplane_id: number;
  type: string;
  registration: string;
  reg_country: string;
  MSN: string;
  manufacturing_year: Date;
  capacity: number;
  min_price: number;
}

export interface Baggage {
  baggage_id: number;
  tracking_no: string;
  status: string;
  passenger_id: number;
}

// API Response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Request interfaces for API endpoints
export interface ClientRegistrationRequest {
  username: string;
  password: string;
  email: string;
  phone_no: string;
  firstname: string;
  lastname: string;
  dob: string; // ISO date string
  street: string;
  city: string;
  province: string;
  country: string;
  postalcode: string;
  card_no: string;
  four_digit: string;
  payment_type: string;
}

export interface ClientLoginRequest {
  username: string;
  password: string;
}

export interface FlightSearchRequest {
  depart_airport_id?: number;
  arrive_airport_id?: number;
  depart_date?: string;
  return_date?: string;
  passengers?: number;
  class?: string;
  cabin_class?: 'Economy' | 'Premium Economy' | 'Business'; // Travel class filter
}

export interface BookingRequest {
  flight_id: number;
  passengers: PassengerRequest[];
  support?: string;
  fasttrack?: string;
}

export interface PassengerRequest {
  firstname: string;
  lastname: string;
  passport_no: string;
  nationality: string;
  phone_no?: string; // Optional field
  gender: string;
  dob: string; // ISO date string
  weight_limit?: number;
  seat_id: number;
}

export interface PaymentRequest {
  booking_id: number;
  amount: number;
  currency: string;
  payment_method?: string;
}

// Utility types for database operations
export type CreateClient = Omit<Client, 'client_id'>;
export type UpdateClient = Partial<Omit<Client, 'client_id'>>;
export type CreateBooking = Omit<Booking, 'booking_id' | 'created_date' | 'updated_date'>;
export type UpdateBooking = Partial<Omit<Booking, 'booking_id' | 'created_date'>>;
export type CreatePassenger = Omit<Passenger, 'passenger_id'>;
export type UpdatePassenger = Partial<Omit<Passenger, 'passenger_id'>>;
export type CreatePayment = Omit<Payment, 'payment_id' | 'payment_timestamp'>;
export type CreateBaggage = Omit<Baggage, 'baggage_id'>;

// Enums for common values
export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

export enum FlightStatus {
  SCHEDULED = 'Scheduled',
  DELAYED = 'Delayed',
  CANCELLED = 'Cancelled',
  BOARDING = 'Boarding',
  DEPARTED = 'Departed',
  ARRIVED = 'Arrived'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum SeatClass {
  ECONOMY = 'Economy',
  PREMIUM_ECONOMY = 'Premium Economy',
  BUSINESS = 'Business',
  FIRST_CLASS = 'First Class'
}

export enum BaggageStatus {
  CHECKED_IN = 'checked_in',
  IN_TRANSIT = 'in_transit',
  ARRIVED = 'arrived',
  DELIVERED = 'delivered',
  LOST = 'lost'
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other'
}

export enum PaymentType {
  VISA = 'VISA',
  MASTERCARD = 'MASTERCARD',
  AMEX = 'AMEX',
  DISCOVER = 'DISCOVER',
  JCB = 'JCB',
  MAESTRO = 'MAESTRO'
}