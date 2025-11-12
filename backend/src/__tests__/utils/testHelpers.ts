import { jest } from '@jest/globals';
import { ClientRegistrationRequest, BookingRequest, PassengerRequest } from '../../types/database';


export const mockClientData: ClientRegistrationRequest = {
  username: 'testuser',
  password: 'password123',
  email: 'test@example.com',
  phone_no: '1234567890',
  firstname: 'Test',
  lastname: 'User',
  dob: '1990-01-01',
  street: '123 Test St',
  city: 'Test City',
  province: 'Test Province',
  country: 'Test Country',
  postalcode: '12345',
  card_no: '1234567890123456',
  four_digit: '1234',
  payment_type: 'credit'
};

export const mockPassengerData: PassengerRequest = {
  firstname: 'John',
  lastname: 'Doe',
  passport_no: 'AB123456',
  nationality: 'USA',
  phone_no: '1234567890',
  gender: 'Male',
  dob: '1985-05-15',
  weight_limit: 20,
  seat_id: 1
};

export const mockBookingData: BookingRequest = {
  flight_id: 1,
  support: 'no',
  fasttrack: 'no',
  passengers: [mockPassengerData]
};

export const mockRequest = (body: any = {}, params: any = {}, query: any = {}) => ({
  body,
  params,
  query,
  headers: {},
  user: undefined
});

export const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

export const generateRandomString = (length: number = 10): string => {
  return Math.random().toString(36).substring(2, length + 2);
};

export const generateRandomEmail = (): string => {
  return `test${generateRandomString(8)}@example.com`;
};

export const generateRandomUsername = (): string => {
  return `user${generateRandomString(8)}`;
};
