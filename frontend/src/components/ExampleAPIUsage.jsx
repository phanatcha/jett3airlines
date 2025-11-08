/**
 * Example Component: How to Use the API Integration
 * 
 * This file demonstrates various patterns for using the API
 * in your React components. Copy these patterns to your pages.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { flightsAPI, bookingsAPI, adminAPI } from '../services/api';

// ============================================
// Example 1: Using Auth Context
// ============================================
export const AuthExample = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div>
      {isAuthenticated() ? (
        <div>
          <p>Welcome, {user.firstname}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <p>Please login</p>
      )}
    </div>
  );
};

// ============================================
// Example 2: Fetching Data on Component Mount
// ============================================
export const FlightSearchExample = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const searchFlights = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await flightsAPI.search({
          depart_airport_id: 1,
          arrive_airport_id: 2,
          depart_date: '2024-12-01',
        });

        if (response.success) {
          setFlights(response.data);
        } else {
          setError('Failed to load flights');
        }
      } catch (err) {
        setError(err.error?.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    searchFlights();
  }, []);

  if (loading) return <div>Loading flights...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Available Flights</h2>
      {flights.map((flight) => (
        <div key={flight.flight_id}>
          <p>Flight {flight.flight_id}</p>
          <p>Departure: {flight.depart_when}</p>
          <p>Arrival: {flight.arrive_when}</p>
        </div>
      ))}
    </div>
  );
};

// ============================================
// Example 3: Form Submission with API
// ============================================
export const BookingFormExample = () => {
  const { createBooking, loading } = useBooking();
  const [formData, setFormData] = useState({
    flight_id: '',
    support: 'no',
    fasttrack: 'no',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const result = await createBooking();

    if (result.success) {
      setSuccess(true);
      // Redirect or show confirmation
    } else {
      setError(result.error || 'Booking failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">Booking created!</div>}

      {/* Form fields */}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Booking'}
      </button>
    </form>
  );
};

// ============================================
// Example 4: Direct API Call (without context)
// ============================================
export const DirectAPIExample = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingsAPI.getAll();
      
      if (response.success) {
        setBookings(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div>
      <h2>My Bookings</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {bookings.map((booking) => (
            <li key={booking.booking_id}>
              Booking #{booking.booking_id} - {booking.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ============================================
// Example 5: Admin Operations
// ============================================
export const AdminExample = () => {
  const { isAdmin } = useAuth();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAllFlights = async () => {
    if (!isAdmin()) {
      alert('Admin access required');
      return;
    }

    try {
      setLoading(true);
      const response = await adminAPI.getAllFlights();
      
      if (response.success) {
        setFlights(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch flights:', err);
    } finally {
      setLoading(false);
    }
  };

  const createFlight = async (flightData) => {
    try {
      const response = await adminAPI.createFlight(flightData);
      
      if (response.success) {
        alert('Flight created successfully!');
        fetchAllFlights(); // Refresh list
      }
    } catch (err) {
      alert('Failed to create flight: ' + err.error?.message);
    }
  };

  if (!isAdmin()) {
    return <div>Access Denied</div>;
  }

  return (
    <div>
      <h2>Admin: Manage Flights</h2>
      <button onClick={fetchAllFlights} disabled={loading}>
        {loading ? 'Loading...' : 'Refresh Flights'}
      </button>
      {/* Flight list and create form */}
    </div>
  );
};

// ============================================
// Example 6: Error Handling Pattern
// ============================================
export const ErrorHandlingExample = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await flightsAPI.search({ /* params */ });

      if (response.success) {
        setData(response.data);
      } else {
        // Handle API error response
        setError(response.error?.message || 'Operation failed');
      }
    } catch (err) {
      // Handle network or unexpected errors
      if (err.error) {
        setError(err.error.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div className="error">{error}</div>}
      {data && <div>{/* Render data */}</div>}
      <button onClick={fetchData}>Fetch Data</button>
    </div>
  );
};

// ============================================
// Example 7: Conditional Rendering Based on Auth
// ============================================
export const ConditionalRenderExample = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div>
      {isAuthenticated() ? (
        <div>
          <h2>Welcome back, {user.firstname}!</h2>
          <p>Email: {user.email}</p>
          {/* Authenticated content */}
        </div>
      ) : (
        <div>
          <h2>Please Login</h2>
          <a href="/login">Go to Login</a>
        </div>
      )}
    </div>
  );
};

// ============================================
// Example 8: Using Booking Context
// ============================================
export const BookingContextExample = () => {
  const {
    searchCriteria,
    updateSearchCriteria,
    selectedFlights,
    selectDepartureFlight,
    passengers,
    addPassenger,
  } = useBooking();

  const handleSearch = () => {
    updateSearchCriteria({
      fromWhere: 'Bangkok',
      toWhere: 'Tokyo',
      departureDate: '2024-12-01',
    });
  };

  const handleSelectFlight = (flight) => {
    selectDepartureFlight(flight);
  };

  const handleAddPassenger = () => {
    addPassenger({
      firstname: 'John',
      lastname: 'Doe',
      passport_no: 'AB123456',
      nationality: 'USA',
      phone_no: '1234567890',
      gender: 'Male',
      dob: '1990-01-01',
      weight_limit: 20,
    });
  };

  return (
    <div>
      <h2>Booking Flow</h2>
      <p>From: {searchCriteria.fromWhere}</p>
      <p>To: {searchCriteria.toWhere}</p>
      <p>Passengers: {passengers.length}</p>
      {selectedFlights.departure && (
        <p>Selected Flight: {selectedFlights.departure.flight_id}</p>
      )}
      <button onClick={handleSearch}>Update Search</button>
      <button onClick={handleAddPassenger}>Add Passenger</button>
    </div>
  );
};

// ============================================
// Example 9: Loading States
// ============================================
export const LoadingStateExample = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await flightsAPI.search({});
      setData(response.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={fetchData} disabled={loading}>
        {loading ? (
          <>
            <span className="spinner"></span>
            Loading...
          </>
        ) : (
          'Fetch Data'
        )}
      </button>
      {data && <div>{/* Render data */}</div>}
    </div>
  );
};

// ============================================
// Example 10: Pagination
// ============================================
export const PaginationExample = () => {
  const [bookings, setBookings] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchBookings = async (pageNum) => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllBookings({
        page: pageNum,
        limit: 10,
      });

      if (response.success) {
        setBookings(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(page);
  }, [page]);

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {bookings.map((booking) => (
            <li key={booking.booking_id}>{booking.booking_id}</li>
          ))}
        </ul>
      )}
      <div>
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1 || loading}
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages || loading}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default {
  AuthExample,
  FlightSearchExample,
  BookingFormExample,
  DirectAPIExample,
  AdminExample,
  ErrorHandlingExample,
  ConditionalRenderExample,
  BookingContextExample,
  LoadingStateExample,
  PaginationExample,
};
