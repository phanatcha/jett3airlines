import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Handle specific error codes
      if (error.response.status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (updates) => api.put('/auth/profile', updates),
};

// Flights API
export const flightsAPI = {
  search: (params) => api.get('/flights/search', { params }),
  getById: (id) => api.get(`/flights/${id}`),
  getSeats: (flightId) => api.get(`/flights/${flightId}/seats`),
};

// Bookings API
export const bookingsAPI = {
  create: (bookingData) => api.post('/bookings', bookingData),
  getAll: () => api.get('/bookings'),
  getById: (id) => api.get(`/bookings/${id}`),
  update: (id, updates) => api.put(`/bookings/${id}`, updates),
  cancel: (id) => api.delete(`/bookings/${id}`),
};

// Payments API
export const paymentsAPI = {
  process: (paymentData) => api.post('/payments', paymentData),
  getByBooking: (bookingId) => api.get(`/payments/${bookingId}`),
};

// Baggage API
export const baggageAPI = {
  create: (baggageData) => api.post('/baggage', baggageData),
  getById: (id) => api.get(`/baggage/${id}`),
  track: (trackingNo) => api.get(`/baggage/track/${trackingNo}`),
  updateStatus: (id, status) => api.patch(`/baggage/${id}/status`, { status }),
  getByPassenger: (passengerId) => api.get(`/baggage/passenger/${passengerId}`),
};

// Admin API
export const adminAPI = {
  // Bookings
  getAllBookings: (params) => api.get('/admin/bookings', { params }),
  getBookingById: (id) => api.get(`/admin/bookings/${id}`),
  updateBooking: (id, updates) => api.put(`/admin/bookings/${id}`, updates),
  cancelBooking: (id) => api.delete(`/admin/bookings/${id}`),
  
  // Flights
  getAllFlights: (params) => api.get('/admin/flights', { params }),
  createFlight: (flightData) => api.post('/admin/flights', flightData),
  updateFlight: (id, updates) => api.put(`/admin/flights/${id}`, updates),
  deleteFlight: (id) => api.delete(`/admin/flights/${id}`),
  
  // Clients
  getAllClients: (params) => api.get('/admin/clients', { params }),
  getClientById: (id) => api.get(`/admin/clients/${id}`),
  
  // Payments
  getAllPayments: (params) => api.get('/admin/payments', { params }),
  
  // Airports
  getAllAirports: () => api.get('/admin/airports'),
  createAirport: (airportData) => api.post('/admin/airports', airportData),
  updateAirport: (id, updates) => api.put(`/admin/airports/${id}`, updates),
  deleteAirport: (id) => api.delete(`/admin/airports/${id}`),
  
  // Airplanes
  getAllAirplanes: () => api.get('/admin/airplanes'),
  createAirplane: (airplaneData) => api.post('/admin/airplanes', airplaneData),
  updateAirplane: (id, updates) => api.put(`/admin/airplanes/${id}`, updates),
  deleteAirplane: (id) => api.delete(`/admin/airplanes/${id}`),
  
  // Baggage
  getAllBaggage: (params) => api.get('/admin/baggage', { params }),
  
  // Reports
  getRevenue: (params) => api.get('/admin/reports/revenue', { params }),
  getBookingStats: (params) => api.get('/admin/reports/bookings', { params }),
  getFlightOccupancy: (params) => api.get('/admin/reports/occupancy', { params }),
};

export default api;
