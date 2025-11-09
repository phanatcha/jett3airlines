import { describe, it, expect } from '@jest/globals';
import { ClientModel } from '../../models/Client';
import { mockClientData } from '../utils/testHelpers';

describe('AuthController - Validation Logic', () => {
  const clientModel = new ClientModel();

  describe('Client registration validation', () => {
    it('should validate complete client data', () => {
      const errors = clientModel.validateClientData(mockClientData);
      expect(errors).toHaveLength(0);
    });

    it('should detect invalid username length', () => {
      const invalidData = { ...mockClientData, username: 'ab' };
      const errors = clientModel.validateClientData(invalidData);
      expect(errors.some(e => e.includes('Username'))).toBe(true);
    });

    it('should detect invalid password length', () => {
      const invalidData = { ...mockClientData, password: '123' };
      const errors = clientModel.validateClientData(invalidData);
      expect(errors.some(e => e.includes('Password'))).toBe(true);
    });

    it('should detect invalid email format', () => {
      const invalidData = { ...mockClientData, email: 'not-an-email' };
      const errors = clientModel.validateClientData(invalidData);
      expect(errors.some(e => e.includes('email'))).toBe(true);
    });

    it('should detect missing required fields', () => {
      const invalidData = { ...mockClientData, firstname: '', lastname: '' };
      const errors = clientModel.validateClientData(invalidData);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
