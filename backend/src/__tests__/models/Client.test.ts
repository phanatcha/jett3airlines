import { describe, it, expect, beforeEach } from '@jest/globals';
import { ClientModel } from '../../models/Client';
import { mockClientData } from '../utils/testHelpers';

describe('ClientModel', () => {
  let clientModel: ClientModel;

  beforeEach(() => {
    clientModel = new ClientModel();
  });

  describe('validateClientData', () => {
    it('should return no errors for valid client data', () => {
      const errors = clientModel.validateClientData(mockClientData);
      expect(errors).toHaveLength(0);
    });

    it('should return error for short username', () => {
      const invalidData = { ...mockClientData, username: 'ab' };
      const errors = clientModel.validateClientData(invalidData);
      expect(errors).toContain('Username must be at least 3 characters long');
    });

    it('should return error for short password', () => {
      const invalidData = { ...mockClientData, password: '12345' };
      const errors = clientModel.validateClientData(invalidData);
      expect(errors).toContain('Password must be at least 6 characters long');
    });

    it('should return error for invalid email', () => {
      const invalidData = { ...mockClientData, email: 'invalid-email' };
      const errors = clientModel.validateClientData(invalidData);
      expect(errors).toContain('Valid email address is required');
    });

    it('should return error for missing firstname', () => {
      const invalidData = { ...mockClientData, firstname: '' };
      const errors = clientModel.validateClientData(invalidData);
      expect(errors).toContain('First name is required');
    });

    it('should return error for missing lastname', () => {
      const invalidData = { ...mockClientData, lastname: '' };
      const errors = clientModel.validateClientData(invalidData);
      expect(errors).toContain('Last name is required');
    });

    it('should return error for invalid four_digit', () => {
      const invalidData = { ...mockClientData, four_digit: '123' };
      const errors = clientModel.validateClientData(invalidData);
      expect(errors).toContain('Four digit code must be exactly 4 digits');
    });

    it('should return multiple errors for multiple invalid fields', () => {
      const invalidData = {
        ...mockClientData,
        username: 'ab',
        password: '123',
        email: 'invalid'
      };
      const errors = clientModel.validateClientData(invalidData);
      expect(errors.length).toBeGreaterThan(1);
    });
  });
});
