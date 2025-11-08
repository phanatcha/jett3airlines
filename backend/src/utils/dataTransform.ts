// Data transformation utilities for the airline API

import { ApiResponse, PaginatedResponse } from '../types/database';

// Type declaration for Buffer (fallback if @types/node is not available)
declare const Buffer: {
  isBuffer(obj: any): boolean;
};

/**
 * Transform database results to API response format
 */
export function formatApiResponse<T>(
  success: boolean,
  data?: T,
  message: string = '',
  error?: string
): ApiResponse<T> {
  return {
    success,
    data,
    message,
    error,
    timestamp: new Date().toISOString()
  };
}

/**
 * Transform database results to paginated API response format
 */
export function formatPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message: string = 'Data retrieved successfully'
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);
  
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  };
}

/**
 * Convert Buffer fields to strings for API responses
 */
export function convertBuffersToStrings<T extends Record<string, any>>(obj: T): T {
  const result = { ...obj };
  
  for (const key in result) {
    if (Buffer.isBuffer(result[key])) {
      // For sensitive fields, don't expose the actual value
      if (key === 'password' || key === 'card_no' || key === 'passport_no') {
        delete result[key];
      } else {
        result[key] = result[key].toString('utf8');
      }
    }
  }
  
  return result;
}

/**
 * Remove sensitive fields from client data
 */
export function sanitizeClientData(client: any) {
  const { password, card_no, ...sanitizedClient } = client;
  return convertBuffersToStrings(sanitizedClient);
}

/**
 * Remove sensitive fields from passenger data
 */
export function sanitizePassengerData(passenger: any) {
  const { passport_no, ...sanitizedPassenger } = passenger;
  return convertBuffersToStrings(sanitizedPassenger);
}

/**
 * Format date for API responses
 */
export function formatDate(date: Date | string): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString();
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase()
  }).format(amount);
}

/**
 * Calculate pagination offset
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Validate pagination parameters
 */
export function validatePagination(page?: string | number, limit?: string | number) {
  const pageNum = typeof page === 'string' ? parseInt(page) : (page || 1);
  const limitNum = typeof limit === 'string' ? parseInt(limit) : (limit || 10);
  
  const validatedPage = Math.max(1, pageNum);
  const validatedLimit = Math.min(Math.max(1, limitNum), 100); // Max 100 items per page
  
  return {
    page: validatedPage,
    limit: validatedLimit,
    offset: calculateOffset(validatedPage, validatedLimit)
  };
}

/**
 * Transform flight duration from minutes to readable format
 */
export function formatFlightDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return '0h 0m';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dob: Date | string): number {
  const birthDate = typeof dob === 'string' ? new Date(dob) : dob;
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Generate seat map layout
 */
export function generateSeatMap(seats: any[]): any {
  const seatMap: { [key: string]: any[] } = {};
  
  seats.forEach(seat => {
    if (!seatMap[seat.class]) {
      seatMap[seat.class] = [];
    }
    seatMap[seat.class].push(seat);
  });
  
  // Sort seats within each class
  Object.keys(seatMap).forEach(seatClass => {
    seatMap[seatClass].sort((a, b) => {
      // Extract row number and letter from seat_no (e.g., "12A")
      const aRow = parseInt(a.seat_no.match(/\d+/)?.[0] || '0');
      const bRow = parseInt(b.seat_no.match(/\d+/)?.[0] || '0');
      const aLetter = a.seat_no.match(/[A-Z]/)?.[0] || '';
      const bLetter = b.seat_no.match(/[A-Z]/)?.[0] || '';
      
      if (aRow !== bRow) {
        return aRow - bRow;
      }
      return aLetter.localeCompare(bLetter);
    });
  });
  
  return seatMap;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

/**
 * Generate random string for tracking numbers, etc.
 */
export function generateRandomString(length: number, includeNumbers: boolean = true): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const chars = includeNumbers ? letters + numbers : letters;
  
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }
  
  if (typeof obj === 'object') {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  
  return obj;
}

/**
 * Convert string to title case
 */
export function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data: any): any {
  const sensitiveFields = ['password', 'card_no', 'passport_no', 'four_digit'];
  const masked = deepClone(data);
  
  function maskObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    
    for (const key in obj) {
      if (sensitiveFields.includes(key.toLowerCase())) {
        obj[key] = '***MASKED***';
      } else if (typeof obj[key] === 'object') {
        maskObject(obj[key]);
      }
    }
    
    return obj;
  }
  
  return maskObject(masked);
}