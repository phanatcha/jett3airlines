import { describe, it, expect, beforeEach } from '@jest/globals';
import { BookingModel } from '../../models/Booking';
import { mockBookingData, mockPassengerData } from '../utils/testHelpers';

describe('BookingModel', () => {
  let bookingModel: BookingModel;

  beforeEach(() => {
    bookingModel = new BookingModel();
  });

  describe('validateBookingData', () => {
    it('should return no errors for valid booking data', () => {
      const errors = bookingModel.validateBookingData(mockBookingData);
      expect(errors).toHaveLength(0);
    });

    it('should return error for missing flight_id', () => {
      const invalidData = { ...mockBookingData, flight_id: 0 };
      const errors = bookingModel.validateBookingData(invalidData);
      expect(errors).toContain('Valid flight ID is required');
    });

    it('should return error for empty passengers array', () => {
      const invalidData = { ...mockBookingData, passengers: [] };
      const errors = bookingModel.validateBookingData(invalidData);
      expect(errors).toContain('At least one passenger is required');
    });

    it('should return error for passenger missing firstname', () => {
      const invalidPassenger = { ...mockPassengerData, firstname: '' };
      const invalidData = { ...mockBookingData, passengers: [invalidPassenger] };
      const errors = bookingModel.validateBookingData(invalidData);
      expect(errors.some(e => e.includes('First name is required'))).toBe(true);
    });

    it('should return error for passenger missing lastname', () => {
      const invalidPassenger = { ...mockPassengerData, lastname: '' };
      const invalidData = { ...mockBookingData, passengers: [invalidPassenger] };
      const errors = bookingModel.validateBookingData(invalidData);
      expect(errors.some(e => e.includes('Last name is required'))).toBe(true);
    });

    it('should return error for passenger missing passport_no', () => {
      const invalidPassenger = { ...mockPassengerData, passport_no: '' };
      const invalidData = { ...mockBookingData, passengers: [invalidPassenger] };
      const errors = bookingModel.validateBookingData(invalidData);
      expect(errors.some(e => e.includes('Passport number is required'))).toBe(true);
    });

    it('should return error for passenger with invalid gender', () => {
      const invalidPassenger = { ...mockPassengerData, gender: 'Invalid' as any };
      const invalidData = { ...mockBookingData, passengers: [invalidPassenger] };
      const errors = bookingModel.validateBookingData(invalidData);
      expect(errors.some(e => e.includes('Valid gender is required'))).toBe(true);
    });

    it('should return error for passenger missing seat_id', () => {
      const invalidPassenger = { ...mockPassengerData, seat_id: 0 };
      const invalidData = { ...mockBookingData, passengers: [invalidPassenger] };
      const errors = bookingModel.validateBookingData(invalidData);
      expect(errors.some(e => e.includes('Valid seat selection is required'))).toBe(true);
    });

    it('should validate multiple passengers correctly', () => {
      const validPassenger1 = { ...mockPassengerData };
      const validPassenger2 = { ...mockPassengerData, firstname: 'Jane', seat_id: 2 };
      const validData = { ...mockBookingData, passengers: [validPassenger1, validPassenger2] };
      const errors = bookingModel.validateBookingData(validData);
      expect(errors).toHaveLength(0);
    });
  });
});
