import { describe, it, expect } from '@jest/globals';
import { BookingModel } from '../../models/Booking';
import { mockBookingData } from '../utils/testHelpers';

describe('BookingsController - Validation Logic', () => {
  const bookingModel = new BookingModel();

  describe('Booking validation', () => {
    it('should validate booking data correctly', () => {
      const errors = bookingModel.validateBookingData(mockBookingData);
      expect(errors).toHaveLength(0);
    });

    it('should detect invalid flight_id', () => {
      const invalidData = { ...mockBookingData, flight_id: -1 };
      const errors = bookingModel.validateBookingData(invalidData);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.includes('flight ID'))).toBe(true);
    });

    it('should detect missing passengers', () => {
      const invalidData = { ...mockBookingData, passengers: [] };
      const errors = bookingModel.validateBookingData(invalidData);
      expect(errors).toContain('At least one passenger is required');
    });
  });
});
