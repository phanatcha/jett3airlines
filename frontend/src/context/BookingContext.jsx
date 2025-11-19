import { createContext, useContext, useState, useEffect } from 'react';
import { bookingsAPI, paymentsAPI } from '../services/api';

const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
  const getInitialState = (key, defaultValue) => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const [searchCriteria, setSearchCriteria] = useState(() => 
    getInitialState('searchCriteria', {
      tripType: 'round-trip',
      fromWhere: '',
      toWhere: '',
      departureDate: '',
      returnDate: '',
      passengers: 1,
      cabinClass: 'Economy',
      directFlightsOnly: false,
      searchResults: [],
    })
  );

  const [selectedFlights, setSelectedFlights] = useState(() =>
    getInitialState('selectedFlights', {
      departure: null,
      return: null,
    })
  );

  const [passengers, setPassengers] = useState(() =>
    getInitialState('passengers', [])
  );

  const [selectedSeats, setSelectedSeats] = useState(() =>
    getInitialState('selectedSeats', [])
  );

  const [fareOptions, setFareOptions] = useState(() =>
    getInitialState('fareOptions', {
      support: 'no',
      fasttrack: 'no',
      fareClass: null,
      farePrice: 0,
      cabinClass: 'Economy',
      totalSeatPrice: 0,
      totalPrice: 0,
    })
  );

  const [paymentInfo, setPaymentInfo] = useState(null);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    localStorage.setItem('searchCriteria', JSON.stringify(searchCriteria));
  }, [searchCriteria]);

  useEffect(() => {
    localStorage.setItem('selectedFlights', JSON.stringify(selectedFlights));
  }, [selectedFlights]);

  useEffect(() => {
    localStorage.setItem('passengers', JSON.stringify(passengers));
  }, [passengers]);

  useEffect(() => {
    localStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
  }, [selectedSeats]);

  useEffect(() => {
    localStorage.setItem('fareOptions', JSON.stringify(fareOptions));
  }, [fareOptions]);

  const updateSearchCriteria = (criteria) => {
    setSearchCriteria((prev) => ({ ...prev, ...criteria }));
  };

  const selectDepartureFlight = (flight) => {
    setSelectedFlights((prev) => ({ ...prev, departure: flight }));
  };

  const selectReturnFlight = (flight) => {
    setSelectedFlights((prev) => ({ ...prev, return: flight }));
  };

  const addPassenger = (passenger) => {
    setPassengers((prev) => [...prev, passenger]);
  };

  const updatePassenger = (index, passengerData) => {
    setPassengers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...passengerData };
      return updated;
    });
  };

  const removePassenger = (index) => {
    console.log(`[BookingContext] Removing passenger at index ${index}`);
    console.log('[BookingContext] Current passengers count:', passengers.length);
    
    setPassengers((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      console.log('[BookingContext] New passengers count:', filtered.length);
      return filtered;
    });
  };

  const selectSeat = (passengerId, seatId, price = 0) => {
    setSelectedSeats((prev) => {
      const existing = prev.find((s) => s.passengerId === passengerId);
      if (existing) {
        return prev.map((s) =>
          s.passengerId === passengerId ? { ...s, seatId, price } : s
        );
      }
      return [...prev, { passengerId, seatId, price }];
    });
  };

  const updateFareOptions = (options) => {
    setFareOptions((prev) => ({ ...prev, ...options }));
  };

  const updatePaymentInfo = (info) => {
    setPaymentInfo(info);
  };

  const createBooking = async () => {
    try {
      setError(null);
      setLoading(true);

      if (!selectedFlights.departure) {
        throw new Error('Please select a departure flight');
      }

      if (passengers.length === 0) {
        throw new Error('Please add at least one passenger');
      }

      const bookingData = {
        flight_id: selectedFlights.departure.flight_id,
        support: fareOptions.support,
        fasttrack: fareOptions.fasttrack,
        fare_class: fareOptions.fareClass,
        cabin_class: fareOptions.cabinClass,
        fare_price: fareOptions.totalPrice || fareOptions.farePrice,
        passengers: passengers.map((passenger, index) => {
          const seatData = selectedSeats.find((s) => s.passengerId === index);
          
          const transformedPassenger = {
            firstname: passenger.firstname || passenger.first_name || '',
            lastname: passenger.lastname || passenger.last_name || '',
            gender: passenger.gender 
              ? passenger.gender.charAt(0).toUpperCase() + passenger.gender.slice(1).toLowerCase()
              : 'Other',
            passport_no: passenger.passport_no || `TEMP${Date.now().toString().slice(-8)}${index}`.toUpperCase().slice(0, 20),
            nationality: passenger.nationality || passenger.country || 'Unknown',
            dob: passenger.dob || '1990-01-01',
            seat_id: seatData?.seatId ?? null,
            weight_limit: passenger.weight_limit || 20,
          };
          
          const phoneNumber = passenger.phone_no || passenger.phone;
          if (phoneNumber) {
            transformedPassenger.phone_no = phoneNumber;
          }
          if (passenger.email) transformedPassenger.email = passenger.email;
          if (passenger.country) transformedPassenger.country = passenger.country;
          
          return transformedPassenger;
        }),
      };

      console.log('=== BOOKING DATA BEING SENT ===');
      console.log('Flight ID:', bookingData.flight_id);
      console.log('Support:', bookingData.support);
      console.log('Fasttrack:', bookingData.fasttrack);
      console.log('Passengers:', JSON.stringify(bookingData.passengers, null, 2));
      console.log('Selected Seats:', selectedSeats);
      console.log('================================');

      const response = await bookingsAPI.create(bookingData);

      console.log('=== BOOKING CREATION RESPONSE ===');
      console.log('Success:', response.success);
      console.log('Response data:', JSON.stringify(response.data, null, 2));
      console.log('=================================');

      if (response.success) {
        setCurrentBooking(response.data);
        console.log('Current booking set to:', response.data);
        return { success: true, data: response.data };
      }

      console.error('=== BOOKING CREATION FAILED ===');
      console.error('Full Response:', JSON.stringify(response, null, 2));
      console.error('================================');

      return response;
    } catch (err) {
      console.error('=== BOOKING CREATION ERROR ===');
      console.error('Error object:', err);
      console.error('Error details:', JSON.stringify(err, null, 2));
      console.error('================================');
      
      const errorMessage = err.error?.message || err.message || 'Booking creation failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async (paymentData, bookingIdOverride = null) => {
    try {
      setError(null);
      setLoading(true);

      const bookingId = bookingIdOverride || currentBooking?.booking?.booking_id || currentBooking?.booking_id;
      
      if (!bookingId) {
        throw new Error('No active booking found');
      }

      const response = await paymentsAPI.process({
        booking_id: bookingId,
        ...paymentData,
      });

      if (response.success) {
        return { success: true, data: response.data };
      }

      return response;
    } catch (err) {
      const errorMessage = err.error?.message || err.message || 'Payment processing failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const getUserBookings = async () => {
    try {
      setError(null);
      setLoading(true);

      const response = await bookingsAPI.getAll();

      if (response.success) {
        return { success: true, data: response.data };
      }

      return response;
    } catch (err) {
      const errorMessage = err.error?.message || 'Failed to fetch bookings';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const getBookingById = async (bookingId) => {
    try {
      setError(null);
      setLoading(true);

      const response = await bookingsAPI.getById(bookingId);

      if (response.success) {
        return { success: true, data: response.data };
      }

      return response;
    } catch (err) {
      const errorMessage = err.error?.message || 'Failed to fetch booking';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      setError(null);
      setLoading(true);

      const response = await bookingsAPI.cancel(bookingId);

      if (response.success) {
        return { success: true, data: response.data };
      }

      return response;
    } catch (err) {
      const errorMessage = err.error?.message || 'Failed to cancel booking';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetBooking = () => {
    setSearchCriteria({
      tripType: 'round-trip',
      fromWhere: '',
      toWhere: '',
      departureDate: '',
      returnDate: '',
      passengers: 1,
      cabinClass: 'Economy',
      directFlightsOnly: false,
      searchResults: [],
    });
    setSelectedFlights({ departure: null, return: null });
    setPassengers([]);
    setSelectedSeats([]);
    setFareOptions({ support: 'no', fasttrack: 'no' });
    setPaymentInfo(null);
    setCurrentBooking(null);
    setError(null);
    
    localStorage.removeItem('searchCriteria');
    localStorage.removeItem('selectedFlights');
    localStorage.removeItem('passengers');
    localStorage.removeItem('selectedSeats');
    localStorage.removeItem('fareOptions');
  };

  const value = {
    searchCriteria,
    selectedFlights,
    passengers,
    selectedSeats,
    fareOptions,
    paymentInfo,
    currentBooking,
    loading,
    error,
    
    updateSearchCriteria,
    selectDepartureFlight,
    selectReturnFlight,
    addPassenger,
    updatePassenger,
    removePassenger,
    selectSeat,
    updateFareOptions,
    updatePaymentInfo,
    createBooking,
    processPayment,
    getUserBookings,
    getBookingById,
    cancelBooking,
    resetBooking,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export default BookingContext;
